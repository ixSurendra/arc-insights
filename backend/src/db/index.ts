/**
 * Arc Insights — Drizzle DB client + tenant-aware query helper.
 *
 * IMPORTANT: every query that touches a domain table MUST go through `withTenant()`.
 * Direct use of the raw `db` object is reserved for migrations and bootstrap code.
 *
 * The `withTenant(tenantId)` helper sets the Postgres session variable `app.tenant_id`
 * before running any query. Postgres RLS policies read this variable to enforce
 * row-level isolation. See docs/adr/0003-multi-tenancy-model.md.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and configure it.",
  );
}

// Single connection pool for the process. Max connections sized for the API tier.
const queryClient = postgres(databaseUrl, {
  max: Number(process.env.DATABASE_POOL_MAX ?? 10),
  idle_timeout: 30,
  max_lifetime: 60 * 30,
});

// Raw Drizzle client. Avoid using directly in feature code.
export const db = drizzle(queryClient, { schema });

/**
 * Run a callback in a transaction with the tenant context set.
 * All Postgres RLS policies will see `app.tenant_id` = tenantId.
 *
 * Usage:
 *   const dashboards = await withTenant(ctx.tenantId, async (tx) => {
 *     return tx.select().from(dashboardsTable);
 *   });
 */
export async function withTenant<T>(
  tenantId: string,
  fn: (tx: typeof db) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    // Bind the tenant for the duration of this transaction. `set_config(..., true)`
    // is transaction-local (equivalent to SET LOCAL) and uses a real bind parameter,
    // so a hostile tenantId can't break out of the SQL.
    await tx.execute(
      sql`SELECT set_config('app.tenant_id', ${tenantId}, true)`,
    );
    return fn(tx);
  });
}

/**
 * Health check helper. Used by GET /health to verify the DB is alive.
 */
export async function pingDb(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch {
    return false;
  }
}

export { schema };
