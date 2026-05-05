/**
 * P1-01 — PostgresConnector tests.
 *
 * Runs against the local docker-compose Postgres when DATABASE_URL is set
 * (same pattern as withTenant.test.ts). Exercises the connector against
 * the existing arc_insights schema (tenants, users, audit_log) so the
 * tests don't require any extra fixture setup.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { PostgresConnector } from "./postgres.ts";

const DB_AVAILABLE = Boolean(process.env.DATABASE_URL);

describe.skipIf(!DB_AVAILABLE)("PostgresConnector", () => {
  let conn: PostgresConnector;

  beforeAll(() => {
    conn = new PostgresConnector({ url: process.env.DATABASE_URL! });
  });

  afterAll(async () => {
    await conn.close();
  });

  test("test() returns ok with a server version when reachable", async () => {
    const result = await conn.test();
    expect(result.ok).toBe(true);
    expect(typeof result.latencyMs).toBe("number");
    expect(result.serverVersion).toContain("PostgreSQL");
  });

  test("test() returns ok=false with an error message on a bad URL", async () => {
    const bad = new PostgresConnector({
      url: "postgresql://nope:nope@127.0.0.1:1/nope",
      poolMax: 1,
    });
    const result = await bad.test();
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).not.toContain("nope:nope"); // no creds in errors
    await bad.close();
  });

  test("scanSchema() finds tenants/users/audit_log with their columns", async () => {
    const tables = await conn.scanSchema();
    const names = new Set(tables.map((t) => `${t.schema}.${t.name}`));
    expect(names.has("public.tenants")).toBe(true);
    expect(names.has("public.users")).toBe(true);
    expect(names.has("public.audit_log")).toBe(true);

    const users = tables.find((t) => t.name === "users")!;
    const cols = new Map(users.columns.map((c) => [c.name, c]));
    expect(cols.get("id")?.inferredKind).toBe("string"); // uuid
    expect(cols.get("email")?.inferredKind).toBe("string");
    expect(cols.get("is_active")?.inferredKind).toBe("boolean");
    expect(cols.get("created_at")?.inferredKind).toBe("datetime");
    expect(cols.get("tenant_id")?.nullable).toBe(false);
  });

  test("scanSchema() excludes system schemas", async () => {
    const tables = await conn.scanSchema();
    const systems = tables.filter((t) =>
      ["pg_catalog", "pg_toast", "information_schema"].includes(t.schema),
    );
    expect(systems.length).toBe(0);
  });

  test("runQuery() returns shaped rows with timing", async () => {
    const result = await conn.runQuery("SELECT 1 AS n, 'hi' AS greet");
    expect(result.rowCount).toBe(1);
    expect(result.rows[0]).toEqual({ n: 1, greet: "hi" });
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });
});

describe.skipIf(DB_AVAILABLE)("PostgresConnector tests skipped", () => {
  test("set DATABASE_URL to run PostgresConnector tests", () => {
    expect(true).toBe(true);
  });
});
