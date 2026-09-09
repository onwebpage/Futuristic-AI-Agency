import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

let pg;
try {
  pg = require("pg");
} catch {
  pg = require(path.join(__dirname, "../lib/db/node_modules/pg"));
}

const connectionString =
  process.env.SUPABASE_DB_URL ||
  process.argv[2];

if (!connectionString) {
  console.log(`
================================================================================
Thinkatic - Supabase Schema Migration Runner
================================================================================

To execute the migration directly against Supabase Postgres:
  node scripts/apply_supabase_schema.js "postgresql://postgres:[YOUR-PASSWORD]@db.gkcmdngzatpdrzfdahcq.supabase.co:5432/postgres"

Alternatively, run every SQL file in supabase/migrations/ in filename order
from the Supabase Dashboard -> SQL Editor. The billing schema is provided by:
  20260908000006_create_billing.sql
  20260908000007_billing_enhancements.sql
Do not run only the billing files unless the earlier base/module migrations
have already been applied.
================================================================================
`);
  process.exit(0);
}

async function run() {
  const migrationDir = path.join(__dirname, "../supabase/migrations");
  const migrations = fs.readdirSync(migrationDir)
    .filter((name) => /^\d+.*\.sql$/.test(name))
    .sort()
    .map((name) => ({ name, sql: fs.readFileSync(path.join(migrationDir, name), "utf-8") }));

  console.log(`[Migration] Connecting to Supabase database...`);
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log(`[Migration] Connected successfully.`);
    console.log(`[Migration] Executing ${migrations.length} ordered migrations...`);

    await client.query("BEGIN;");
    await client.query(`
      CREATE TABLE IF NOT EXISTS public._app_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    const applied = await client.query("SELECT name FROM public._app_migrations");
    const appliedNames = new Set(applied.rows.map((row) => row.name));
    for (const migration of migrations) {
      if (appliedNames.has(migration.name)) continue;
      console.log(`[Migration] Applying ${migration.name}`);
      await client.query(migration.sql);
      await client.query("INSERT INTO public._app_migrations (name) VALUES ($1)", [migration.name]);
    }
    await client.query("COMMIT;");

    console.log(`[Migration] Successfully applied complete schema and seed data!`);

    // Verify tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log(`[Migration] Verified public tables:`, res.rows.map((r) => r.table_name));

    // Verify plans count
    const plansRes = await client.query(`SELECT COUNT(*) as count FROM public.plans;`);
    console.log(`[Migration] Verified plans seeded: ${plansRes.rows[0].count}`);

    // Verify admin_users count
    const adminRes = await client.query(`SELECT COUNT(*) as count FROM public.admin_users;`);
    console.log(`[Migration] Verified admin users: ${adminRes.rows[0].count}`);
  } catch (err) {
    await client.query("ROLLBACK;").catch(() => {});
    console.error(`[Migration Error] Failed to execute migration:`, err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
