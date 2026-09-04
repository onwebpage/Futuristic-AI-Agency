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
  process.env.DATABASE_URL ||
  process.argv[2];

if (!connectionString) {
  console.log(`
================================================================================
Thinkatic - Supabase Schema Migration Runner
================================================================================

To execute the migration directly against Supabase Postgres:
  node scripts/apply_supabase_schema.js "postgresql://postgres:[YOUR-PASSWORD]@db.gkcmdngzatpdrzfdahcq.supabase.co:5432/postgres"

Alternatively, copy the contents of:
  supabase/migrations/20260904000000_create_schema.sql
and paste it directly into your Supabase Dashboard -> SQL Editor and click "Run".
================================================================================
`);
  process.exit(0);
}

async function run() {
  const sqlPath = path.join(__dirname, "../supabase/migrations/20260904000000_create_schema.sql");
  const sql = fs.readFileSync(sqlPath, "utf-8");

  console.log(`[Migration] Connecting to Supabase database...`);
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log(`[Migration] Connected successfully.`);
    console.log(`[Migration] Executing schema migration (${sql.length} bytes)...`);

    await client.query("BEGIN;");
    await client.query(sql);
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
