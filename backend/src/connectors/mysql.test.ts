/**
 * P1-02 — MysqlConnector tests.
 *
 * Runs against the local docker-compose MySQL when MYSQL_TEST_URL is set.
 * The test creates a dedicated table, exercises the connector, then drops
 * it — so the test is hermetic and can run repeatedly.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { MysqlConnector } from "./mysql.ts";

const MYSQL_AVAILABLE = Boolean(process.env.MYSQL_TEST_URL);

describe.skipIf(!MYSQL_AVAILABLE)("MysqlConnector", () => {
  let conn: MysqlConnector;

  beforeAll(async () => {
    conn = new MysqlConnector({ url: process.env.MYSQL_TEST_URL! });
    // Hermetic fixture: drop and create a known table.
    await conn.runQuery("DROP TABLE IF EXISTS mysql_connector_users");
    await conn.runQuery(`
      CREATE TABLE mysql_connector_users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
  });

  afterAll(async () => {
    await conn.runQuery("DROP TABLE IF EXISTS mysql_connector_users");
    await conn.close();
  });

  test("test() returns ok with a server version when reachable", async () => {
    const result = await conn.test();
    expect(result.ok).toBe(true);
    expect(typeof result.latencyMs).toBe("number");
    expect(result.serverVersion).toMatch(/^[0-9]+\./); // "8.0.40" / "10.x" etc
  });

  test("test() returns ok=false with a safe error message on a bad URL", async () => {
    const bad = new MysqlConnector({
      url: "mysql://nope:nope@127.0.0.1:1/nope",
      poolMax: 1,
    });
    const result = await bad.test();
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).not.toContain("nope:nope");
    await bad.close();
  });

  test("scanSchema() finds the fixture table with column kinds", async () => {
    const tables = await conn.scanSchema();
    const fixture = tables.find((t) => t.name === "mysql_connector_users");
    expect(fixture).toBeDefined();
    expect(fixture!.kind).toBe("table");

    const cols = new Map(fixture!.columns.map((c) => [c.name, c]));
    expect(cols.get("id")?.inferredKind).toBe("number");
    expect(cols.get("email")?.inferredKind).toBe("string");
    expect(cols.get("is_active")?.inferredKind).toBe("number"); // tinyint
    expect(cols.get("created_at")?.inferredKind).toBe("datetime");
    expect(cols.get("email")?.nullable).toBe(false);
  });

  test("scanSchema() excludes information_schema, mysql, performance_schema, sys", async () => {
    const tables = await conn.scanSchema();
    const systems = tables.filter((t) =>
      ["information_schema", "mysql", "performance_schema", "sys"].includes(
        t.schema,
      ),
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

describe.skipIf(MYSQL_AVAILABLE)("MysqlConnector tests skipped", () => {
  test("set MYSQL_TEST_URL to run MysqlConnector tests", () => {
    expect(true).toBe(true);
  });
});
