import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { existsSync } from "fs";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

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
app.use(cors());
app.use(express.json({ limit: "40mb" }));
app.use(express.urlencoded({ extended: true }));

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

if (process.env.NODE_ENV === "production") {
  const staticPath = path.resolve(process.cwd(), "artifacts/thinkatic/dist/public");
  if (existsSync(staticPath)) {
    app.get(
      ["/favicon.ico", "/favicon.png", "/favicon.svg", "/apple-touch-icon.png"],
      (_req, res) => res.set("Cache-Control", "no-store").status(404).end(),
    );
    app.use(express.static(staticPath));
    app.get("*splat", (_req, res) => {
      res.sendFile(path.join(staticPath, "index.html"));
    });
  } else {
    logger.warn({ staticPath }, "Static files directory not found — frontend not served");
  }
}

export default app;
