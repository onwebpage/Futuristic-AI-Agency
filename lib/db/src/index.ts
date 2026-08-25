import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const useSsl = process.env.PGSSL === "true" || process.env.DATABASE_URL?.includes("sslmode=require") === true;

function createPool() {
  const connectionConfig = process.env.PGHOST
    ? {
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT ?? 5432),
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
      }
    : process.env.DATABASE_URL
      ? { connectionString: process.env.DATABASE_URL, ssl: useSsl ? { rejectUnauthorized: false } : undefined }
      : (() => { throw new Error("DATABASE_URL or PGHOST must be set. Did you forget to provision a database?"); })();

  const nextPool = new Pool({
    ...connectionConfig,
    max: 5,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
    maxLifetimeSeconds: 1_800,
  });
  nextPool.on("error", (error) => console.error("Postgres pool client error:", error));
  return nextPool;
}

export let pool = createPool();
export let db = drizzle(pool, { schema });
let reconnectPromise: Promise<void> | undefined;

function isTransientDatabaseError(error: unknown) {
  const candidate = error as { code?: string; errno?: string; message?: string };
  return ["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "57P01", "57P03"].includes(candidate?.code ?? candidate?.errno ?? "")
    || /connection reset|connection terminated|server closed the connection|timeout/i.test(candidate?.message ?? "");
}

export async function withDbRetry<T>(operation: () => Promise<T>, label: string, maxAttempts = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (!isTransientDatabaseError(error) || attempt === maxAttempts) throw error;
      const delayMs = 150 * 2 ** (attempt - 1);
      console.warn(`${label} transient database error; retrying in ${delayMs}ms`, { attempt, code: (error as { code?: string }).code });
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      if (!reconnectPromise) {
        reconnectPromise = (async () => {
          const previousPool = pool;
          const nextPool = createPool();
          pool = nextPool;
          db = drizzle(nextPool, { schema });
          await previousPool.end().catch((closeError) => {
            console.warn(`${label} could not close the reset pool`, { code: (closeError as { code?: string }).code });
          });
        })().finally(() => {
          reconnectPromise = undefined;
        });
      }
      await reconnectPromise;
    }
  }
  throw new Error(`${label} failed after retries`);
}

export * from "./schema";
