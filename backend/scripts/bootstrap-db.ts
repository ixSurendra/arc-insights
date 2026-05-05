/**
 * Apply the initial migration via postgres.js (no external `psql` dep).
 *
 * Used by both local dev (`make dev` workflow) and CI. Reads the SQL file
 * adjacent to this script and pipes it through the same connection driver
 * the app uses, so behavior is consistent across environments.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const here = dirname(fileURLToPath(import.meta.url));
const migrationPath = join(here, "..", "drizzle", "0000_initial.sql");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env first.");
  process.exit(1);
}

const sqlText = readFileSync(migrationPath, "utf8");
const client = postgres(url);

try {
  await client.unsafe(sqlText);
  console.info(`✅ Applied ${migrationPath}`);
} catch (err) {
  console.error("❌ Migration failed:", err);
  process.exit(1);
} finally {
  await client.end();
}
