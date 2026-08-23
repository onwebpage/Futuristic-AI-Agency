import { defineConfig } from "drizzle-kit";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const credentials = process.env.PGHOST
  ? {
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT ?? 5432),
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      ssl: false,
    }
  : process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : (() => { throw new Error("DATABASE_URL or PGHOST must be set. Did you forget to provision a database?"); })();

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: credentials,
});
