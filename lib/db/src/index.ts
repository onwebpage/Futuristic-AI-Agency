import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const connectionConfig = process.env.PGHOST
  ? {
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT ?? 5432),
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
    }
  : process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : (() => { throw new Error("DATABASE_URL or PGHOST must be set. Did you forget to provision a database?"); })();

export const pool = new Pool(connectionConfig);
export const db = drizzle(pool, { schema });

export * from "./schema";
