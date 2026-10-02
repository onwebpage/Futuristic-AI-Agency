import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger.js";
import { supabase } from "@workspace/db";

// ─────────────────────────────────────────────────────────────────────────────
// 1. SECURITY HEADERS MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  // Prevent MIME sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Prevent clickjacking / frame embedding
  res.setHeader("X-Frame-Options", "DENY");
  // Legacy XSS filter protection
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Control referrer information sent in requests
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Restrict browser features
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // Remove Express fingerprinting header
  res.removeHeader("X-Powered-By");

  // Enforce HSTS in production
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  next();
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PRODUCTION IN-MEMORY SLIDING WINDOW RATE LIMITER
// ─────────────────────────────────────────────────────────────────────────────
interface RateLimitBucket {
  timestamps: number[];
}

export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}) {
  const { windowMs, maxRequests, message = "Too many requests, please try again later." } = options;
  const store = new Map<string, RateLimitBucket>();

  // Cleanup interval to avoid memory growth
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of store.entries()) {
      bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < windowMs);
      if (bucket.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, Math.max(windowMs, 60000));

  // Allow Node process to exit without waiting on interval
  if (cleanupTimer.unref) cleanupTimer.unref();

  return function rateLimiterMiddleware(req: Request, res: Response, next: NextFunction) {
    const key = options.keyGenerator ? options.keyGenerator(req) : (req.ip || req.socket.remoteAddress || "global");
    const now = Date.now();

    let bucket = store.get(key);
    if (!bucket) {
      bucket = { timestamps: [] };
      store.set(key, bucket);
    }

    // Filter out timestamps older than the sliding window
    bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < windowMs);

    if (bucket.timestamps.length >= maxRequests) {
      const oldest = bucket.timestamps[0];
      const resetInSeconds = Math.ceil((oldest + windowMs - now) / 1000);
      res.setHeader("Retry-After", String(resetInSeconds));
      res.status(429).json({
        success: false,
        error: message,
        message,
        retryAfterSeconds: resetInSeconds,
      });
      return;
    }

    bucket.timestamps.push(now);
    next();
  };
}

// Pre-configured rate limiters
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 20, // Max 20 attempts per 15 min per IP
  message: "Too many authentication attempts. Please try again after 15 minutes.",
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 400, // Max 400 requests per minute per IP
  message: "API rate limit exceeded. Please slow down your requests.",
});

export const uploadRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxRequests: 50, // Max 50 uploads per 10 minutes per IP
  message: "Document upload limit reached. Please wait before uploading more documents.",
});

export const webhookRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 600, // Max 600 webhook requests per minute
  message: "Webhook rate limit exceeded. Please throttle webhook delivery.",
});

export const syncRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 30, // Max 30 manual sync requests per 15 minutes
  message: "Manual sync rate limit reached. Please wait before triggering another sync job.",
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. FILE & DOCUMENT SECURITY VALIDATOR
// ─────────────────────────────────────────────────────────────────────────────
export const MAX_DOCUMENT_SIZE_BYTES = 25 * 1024 * 1024; // 25 MiB = 26,214,400 bytes

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/octet-stream",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".docx",
  ".webp",
]);

const DANGEROUS_EXTENSIONS = new Set([
  ".exe", ".bat", ".cmd", ".sh", ".msi", ".com", ".scr", ".pif",
  ".php", ".jsp", ".asp", ".aspx", ".py", ".rb", ".pl", ".cgi",
  ".js", ".ts", ".vbs", ".wsf", ".jar", ".war",
]);

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedFileName?: string;
}

export function validateUploadedDocument(
  fileName: string,
  mimeType?: string,
  fileSizeBytes?: number,
  fileData?: string | Buffer
): FileValidationResult {
  if (!fileName || typeof fileName !== "string") {
    return { valid: false, error: "Filename is required" };
  }

  // 1. Detect Path Traversal / directory traversal attacks
  if (fileName.includes("..") || fileName.includes("/") || fileName.includes("\\") || fileName.includes("\0")) {
    return { valid: false, error: "Invalid filename: path traversal sequence detected" };
  }

  // 2. Extract and check extension
  const dotIdx = fileName.lastIndexOf(".");
  if (dotIdx === -1) {
    return { valid: false, error: "This file type is not supported. Please upload PDF, PNG, JPG, JPEG, or DOCX." };
  }

  const ext = fileName.slice(dotIdx).toLowerCase();
  if (DANGEROUS_EXTENSIONS.has(ext)) {
    return { valid: false, error: `Executable or script files (${ext}) are strictly prohibited` };
  }

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, error: "This file type is not supported. Please upload PDF, PNG, JPG, JPEG, or DOCX." };
  }

  // 3. Check MIME type if provided
  if (mimeType) {
    const cleanMime = mimeType.split(";")[0].trim().toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(cleanMime)) {
      return { valid: false, error: "This file type is not supported. Please upload PDF, PNG, JPG, JPEG, or DOCX." };
    }
  }

  // 4. Check File Size (Independent 25 MB Limit: 25 * 1024 * 1024 bytes)
  if (fileSizeBytes && fileSizeBytes > MAX_DOCUMENT_SIZE_BYTES) {
    return { valid: false, error: "This document exceeds the 25 MB limit." };
  }

  // Check base64 string size estimate if provided as string
  if (typeof fileData === "string" && fileData.startsWith("data:")) {
    // Base64 is ~4/3 larger than binary
    const pureBase64 = fileData.includes(",") ? fileData.split(",")[1] : fileData;
    const approxBytes = Math.floor((pureBase64.length * 3) / 4);
    if (approxBytes > MAX_DOCUMENT_SIZE_BYTES) {
      return { valid: false, error: "This document exceeds the 25 MB limit." };
    }
  }

  // 5. Inspect magic bytes if buffer or base64 data available
  try {
    let headerBuffer: Buffer | null = null;
    if (Buffer.isBuffer(fileData)) {
      headerBuffer = fileData.subarray(0, 32);
    } else if (typeof fileData === "string" && fileData.length > 0) {
      const pureBase64 = fileData.includes(",") ? fileData.split(",")[1] : fileData;
      // Take first 64 chars of base64 to decode initial bytes
      headerBuffer = Buffer.from(pureBase64.slice(0, 64), "base64");
    }

    if (headerBuffer && headerBuffer.length >= 4) {
      // Check for dangerous executable signatures (MZ for exe/dll, ELF for linux binaries, shebang)
      if (headerBuffer[0] === 0x4D && headerBuffer[1] === 0x5A) {
        return { valid: false, error: "Executable or script files are strictly prohibited" };
      }
      if (headerBuffer[0] === 0x7F && headerBuffer[1] === 0x45 && headerBuffer[2] === 0x4C && headerBuffer[3] === 0x46) {
        return { valid: false, error: "Executable or script files are strictly prohibited" };
      }
      if (headerBuffer[0] === 0x23 && headerBuffer[1] === 0x21) { // #!
        return { valid: false, error: "Executable or script files are strictly prohibited" };
      }

      // Check format signatures for known extensions
      if (ext === ".pdf") {
        const isPdf = headerBuffer.subarray(0, 5).toString("ascii").startsWith("%PDF");
        if (!isPdf) {
          return { valid: false, error: "Invalid PDF file structure. File content does not match PDF format." };
        }
      } else if (ext === ".png") {
        const isPng = headerBuffer[0] === 0x89 && headerBuffer[1] === 0x50 && headerBuffer[2] === 0x4E && headerBuffer[3] === 0x47;
        if (!isPng) {
          return { valid: false, error: "Invalid PNG image structure. File content does not match PNG format." };
        }
      } else if (ext === ".jpg" || ext === ".jpeg") {
        const isJpg = headerBuffer[0] === 0xFF && headerBuffer[1] === 0xD8 && headerBuffer[2] === 0xFF;
        if (!isJpg) {
          return { valid: false, error: "Invalid JPEG image structure. File content does not match JPEG format." };
        }
      } else if (ext === ".docx") {
        // DOCX is a zip container starting with PK (0x50 0x4B 0x03 0x04)
        const isZip = headerBuffer[0] === 0x50 && headerBuffer[1] === 0x4B;
        if (!isZip) {
          return { valid: false, error: "Invalid DOCX document structure. File content does not match DOCX format." };
        }
      }
    }
  } catch {
    // Non-fatal if stream parsing fails
  }

  // 6. Sanitize filename: strip non-alphanumeric (except . - _)
  const base = fileName.slice(0, dotIdx).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 100);
  const sanitizedFileName = `${base}${ext}`;

  return { valid: true, sanitizedFileName };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. INPUT SANITIZATION & SAFE STRING HANDLING
// ─────────────────────────────────────────────────────────────────────────────
export function sanitizeString(val: any, maxLength: number = 1000): string {
  if (val === null || val === undefined) return "";
  const str = String(val).trim().slice(0, maxLength);
  // Strip control characters and dangerous script tag patterns
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/data:text\/html/gi, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. TENANT ISOLATION SECURITY AUDIT LOGGER
// ─────────────────────────────────────────────────────────────────────────────
const inMemoryAuditLogs: any[] = [];

export function getInMemoryAuditLogs() {
  return [...inMemoryAuditLogs];
}

export async function logSecurityEvent(event: {
  action: string;
  actorUserId?: string | null;
  actorAdminId?: number | null;
  targetId?: string;
  ip?: string;
  details?: Record<string, any>;
}) {
  const payload = {
    action: event.action,
    entity_type: "security_event",
    entity_id: event.targetId || "unknown",
    actor_user_id: event.actorUserId || null,
    actor_admin_id: event.actorAdminId || null,
    metadata: {
      ip: event.ip,
      ...event.details,
      timestamp: new Date().toISOString(),
    },
  };

  inMemoryAuditLogs.unshift({
    id: inMemoryAuditLogs.length + 1,
    ...payload,
    created_at: payload.metadata.timestamp,
  });
  if (inMemoryAuditLogs.length > 500) {
    inMemoryAuditLogs.pop();
  }

  logger.warn(payload, `[SECURITY AUDIT] ${event.action}`);

  try {
    await supabase.from("audit_logs").insert(payload);
  } catch {
    // Non-fatal fallback to pino log
  }
}

