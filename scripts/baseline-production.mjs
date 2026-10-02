import pg from "pg";
import { execFileSync } from "node:child_process";

const { Pool } = pg;
const url = process.env.DIRECT_URL;
if (!url) {
  console.log("[baseline] DIRECT_URL is not configured; skipping automatic baseline.");
  process.exit(0);
}

const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });

try {
  const client = await pool.connect();
  try {
    const schema = await client.query(
      'SELECT to_regclass(\'public."Order"\') AS order_table, to_regclass(\'public."_prisma_migrations"\') AS migrations_table'
    );

    const orderExists = Boolean(schema.rows[0]?.order_table);
    const migrationsExists = Boolean(schema.rows[0]?.migrations_table);

    if (!orderExists) {
      console.log("[baseline] Database is empty/new; normal Prisma migrations will run.");
      process.exit(0);
    }

    let migrationCount = 0;
    if (migrationsExists) {
      const result = await client.query('SELECT COUNT(*)::int AS count FROM "public"."_prisma_migrations"');
      migrationCount = result.rows[0]?.count ?? 0;
    }

    if (!migrationsExists || migrationCount === 0) {
      console.log("[baseline] Existing production schema detected with no migration history.");
      console.log("[baseline] Marking the two legacy migrations as already applied.");
      execFileSync("npx", ["prisma", "migrate", "resolve", "--applied", "20260919180000_guest_cj"], { stdio: "inherit" });
      execFileSync("npx", ["prisma", "migrate", "resolve", "--applied", "20260921170000_remove_cj_dropshipping"], { stdio: "inherit" });
    } else {
      console.log(`[baseline] Prisma migration history already exists (${migrationCount} records); no baseline action needed.`);
    }
  } finally {
    client.release();
  }
} finally {
  await pool.end();
}
