/**
 * Integration test for executeQuery against the local docker-compose
 * Postgres. Exercises the full path: spec → compileQuery → connector
 * → optional shapeWithDuckDB.
 *
 * Skips when DATABASE_URL is unset (same pattern as withTenant.test.ts).
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { PostgresConnector } from "../connectors/postgres.ts";
import { executeQuery } from "./execute.ts";
import { QuerySpec } from "./spec.ts";

const DB_AVAILABLE = Boolean(process.env.DATABASE_URL);

describe.skipIf(!DB_AVAILABLE)("executeQuery — postgres", () => {
  let conn: PostgresConnector;

  beforeAll(async () => {
    conn = new PostgresConnector({ url: process.env.DATABASE_URL! });
    // Hermetic fixture in a non-RLS schema so we don't need app_user/withTenant.
    await conn.runQuery(`CREATE SCHEMA IF NOT EXISTS query_test`);
    await conn.runQuery(`DROP TABLE IF EXISTS query_test.orders`);
    await conn.runQuery(`
      CREATE TABLE query_test.orders (
        id        serial PRIMARY KEY,
        region    text NOT NULL,
        amount    integer NOT NULL,
        ts        timestamptz NOT NULL,
        status    text NOT NULL
      )
    `);
    await conn.runQuery(`
      INSERT INTO query_test.orders (region, amount, ts, status) VALUES
        ('EU', 100, '2026-01-15', 'completed'),
        ('EU',  50, '2026-01-20', 'completed'),
        ('US', 200, '2026-02-05', 'completed'),
        ('US',  75, '2026-02-10', 'cancelled')
    `);
  });

  afterAll(async () => {
    await conn.runQuery(`DROP SCHEMA IF EXISTS query_test CASCADE`);
    await conn.close();
  });

  test("aggregates by region with a filter — sum + count", async () => {
    const spec = QuerySpec.parse({
      from: { schema: "query_test", table: "orders" },
      dimensions: [{ column: "region" }],
      measures: [
        { column: "amount", agg: "sum" },
        { column: "*", agg: "count" },
      ],
      filters: [{ column: "status", op: "=", value: "completed" }],
      orderBy: [{ column: "region" }],
    });
    const result = await executeQuery(spec, conn);
    expect(result.rowCount).toBe(2);
    expect(result.rows[0]).toMatchObject({ region: "EU", amount_sum: "150" });
    expect(result.rows[1]).toMatchObject({ region: "US", amount_sum: "200" });
  });

  test("monthly time-bucket aggregation", async () => {
    const spec = QuerySpec.parse({
      from: { schema: "query_test", table: "orders" },
      dimensions: [{ column: "ts", granularity: "month", alias: "month" }],
      measures: [{ column: "*", agg: "count" }],
      orderBy: [{ column: "month" }],
    });
    const result = await executeQuery(spec, conn);
    expect(result.rowCount).toBe(2);
    expect(Number(result.rows[0]!["count"])).toBe(2); // Jan
    expect(Number(result.rows[1]!["count"])).toBe(2); // Feb
  });

  test("optional DuckDB shaping post-processes the source rows", async () => {
    const spec = QuerySpec.parse({
      from: { schema: "query_test", table: "orders" },
      dimensions: [{ column: "region" }],
      measures: [{ column: "amount", agg: "sum" }],
    });
    // DuckDB receives `region`/`amount_sum` and computes a global share.
    // Source-side `amount_sum` comes back as a string from postgres
    // (NUMERIC), so cast in the shaping query.
    const result = await executeQuery(spec, conn, {
      shapeWith: `
        SELECT region,
               CAST(amount_sum AS BIGINT) AS region_total,
               ROUND(100.0 * CAST(amount_sum AS BIGINT)
                     / SUM(CAST(amount_sum AS BIGINT)) OVER (), 2) AS pct
        FROM input
        ORDER BY region_total DESC
      `,
    });
    expect(result.rowCount).toBe(2);
    expect(result.rows[0]).toMatchObject({ region: "US", region_total: 275n });
  });
});
