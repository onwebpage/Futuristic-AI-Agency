import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { adminRepository } from "@workspace/db";

// Production-safe JWT secrets — must be set in environment
const JWT_SECRET = process.env.SESSION_SECRET || (process.env.NODE_ENV === "production" ? (() => { throw new Error("SESSION_SECRET must be set in production"); })() : "dev-admin-secret");
const USER_JWT_SECRET = process.env.USER_SESSION_SECRET || (process.env.NODE_ENV === "production" ? (() => { throw new Error("USER_SESSION_SECRET must be set in production"); })() : "dev-user-secret-2026");

export function signToken(payload: { id: number; username: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { id: number; username: string };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const payload = verifyToken(auth.slice(7));
    const admin = await adminRepository.getById(payload.id);
    if (!admin) {
      res.status(401).json({ error: "Admin account is not active" });
      return;
    }
    (req as Request & { admin: { id: number; username: string } }).admin = payload;
    next();
  } catch {
    try {
      jwt.verify(auth.slice(7), USER_JWT_SECRET);
      res.status(403).json({ error: "Administrator access required" });
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
    }
  }
}
