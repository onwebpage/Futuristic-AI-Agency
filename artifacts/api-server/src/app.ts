import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { existsSync } from "fs";
import router from "./routes";
import { logger } from "./lib/logger";
import { securityHeaders, apiRateLimiter } from "./lib/security";

const app: Express = express();

// 1. Security Headers (nosniff, frame deny, xss protection, hide Express fingerprint)
app.use(securityHeaders);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Root health check endpoints for cloud platform monitors & load balancers
app.get(["/healthz", "/health"], (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Configure CORS for production and development
const defaultOrigins = [
  "https://thinkatic.com",
  "https://www.thinkatic.com",
  "https://thinkatic.onrender.com",
  "http://localhost:3000",
  "http://localhost:4173",
  "http://localhost:5000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:4173",
  "http://127.0.0.1:5000",
  "http://127.0.0.1:5173",
];

if (process.env.APP_BASE_URL) {
  defaultOrigins.push(process.env.APP_BASE_URL.replace(/\/+$/, ""));
}

const configuredOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : [];

const allowedOriginsSet = new Set([...defaultOrigins, ...configuredOrigins]);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. same-origin GETs, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOriginsSet.has(origin)) return callback(null, true);
      try {
        const originUrl = new URL(origin);
        if (allowedOriginsSet.has(originUrl.origin)) return callback(null, true);
      } catch {}
      callback(null, false);
    },
    credentials: true,
  })
);

// Serve project marketplace and media assets if available
const candidateMarketplacePaths = [
  path.resolve(process.cwd(), "Project Marketplace"),
  path.resolve(process.cwd(), "artifacts/thinkatic/public/Project Marketplace"),
  path.resolve(__dirname, "../../thinkatic/public/Project Marketplace"),
  path.resolve(__dirname, "../thinkatic/public/Project Marketplace"),
];
const marketplacePath = candidateMarketplacePaths.find((p) => existsSync(p));
if (marketplacePath) {
  app.use("/Project Marketplace", express.static(marketplacePath));
}

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// 2. Rate Limiting for all API routes
app.use("/api", apiRateLimiter);

app.use("/api", router);

app.use("/api", (_req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});

app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (res.headersSent) return;
  if (error?.type === "entity.parse.failed") {
    res.status(400).json({ success: false, message: "Request body must be valid JSON" });
    return;
  }
  if (error?.type === "entity.too.large") {
    res.status(413).json({ success: false, message: "Request body is too large" });
    return;
  }
  logger.error({ err: error }, "Unhandled API error");
  res.status(500).json({ success: false, message: "Internal server error" });
});

// Multi-candidate static directory resolution for frontend dist/public
const candidateStaticPaths = [
  path.resolve(process.cwd(), "artifacts/thinkatic/dist/public"),
  path.resolve(process.cwd(), "../thinkatic/dist/public"),
  path.resolve(__dirname, "../../thinkatic/dist/public"),
  path.resolve(__dirname, "../thinkatic/dist/public"),
  path.resolve(__dirname, "public"),
];

const staticPath = candidateStaticPaths.find((p) => existsSync(p));

if (staticPath) {
  logger.info({ staticPath }, "Serving static frontend assets");

  app.use(
    express.static(staticPath, {
      maxAge: "1d",
      setHeaders: (res, filePath) => {
        // Hashed Vite assets can be cached immutably
        if (filePath.includes(`${path.sep}assets${path.sep}`) || filePath.includes("/assets/")) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if (filePath.endsWith("index.html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        }
      },
    })
  );

  // Fallback for SPA deep links (all non-API GET requests)
  app.get("*splat", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(path.join(staticPath, "index.html"));
  });
} else {
  logger.warn("Static files directory not found — frontend SPA not served");
}

export default app;
