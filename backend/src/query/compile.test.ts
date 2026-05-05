/**
 * Unit tests for compileQuery — no DB required, exercises every dialect
 * branch and the identifier-safety perimeter.
 */
import { describe, expect, test } from "bun:test";
import { compileQuery } from "./compile.ts";
import { QuerySpec } from "./spec.ts";

const baseFrom = { schema: "public", table: "orders" };

describe("compileQuery — postgres dialect", () => {
  test("plain SELECT * with no group-by", () => {
    const spec = QuerySpec.parse({ from: baseFrom });
    const out = compileQuery(spec, "postgres");
    expect(out.sql).toBe(`SELECT * FROM "public"."orders" LIMIT 1000`);
    expect(out.params).toEqual([]);
  });

  test("dimensions + measures emit GROUP BY and aliases", () => {
    const spec = QuerySpec.parse({
      from: baseFrom,
      dimensions: [{ column: "region" }],
      measures: [
        { column: "amount", agg: "sum" },
        { column: "*", agg: "count" },
      ],
      limit: 50,
    });
    const out = compileQuery(spec, "postgres");
    expect(out.sql).toBe(
      `SELECT "region" AS "region", SUM("amount") AS "amount_sum", COUNT(*) AS "count" FROM "public"."orders" GROUP BY "region" LIMIT 50`,
    );
    expect(out.params).toEqual([]);
  });

  test("time bucketing via date_trunc with explicit alias", () => {
    const spec = QuerySpec.parse({
      from: baseFrom,
      dimensions: [{ column: "ts", granularity: "month", alias: "bucket" }],
      measures: [{ column: "*", agg: "count" }],
    });
    const out = compileQuery(spec, "postgres");
    expect(out.sql).toContain(`date_trunc('month', "ts") AS "bucket"`);
    expect(out.sql).toContain(`GROUP BY date_trunc('month', "ts")`);
  });

  test("filters bind parameters in $N order", () => {
    const spec = QuerySpec.parse({
      from: baseFrom,
      filters: [
        { column: "status", op: "=", value: "completed" },
        { column: "amount", op: ">", value: 100 },
        { column: "region", op: "in", value: ["EU", "US"] },
        { column: "deleted_at", op: "is_null" },
      ],
    });
    const out = compileQuery(spec, "postgres");
    expect(out.sql).toContain(
      `WHERE "status" = $1 AND "amount" > $2 AND "region" IN ($3, $4) AND "deleted_at" IS NULL`,
    );
    expect(out.params).toEqual(["completed", 100, "EU", "US"]);
  });

  test("ORDER BY direction defaults to asc and uppercases", () => {
    const spec = QuerySpec.parse({
      from: baseFrom,
      orderBy: [{ column: "amount" }, { column: "ts", direction: "desc" }],
    });
    const out = compileQuery(spec, "postgres");
    expect(out.sql).toContain(`ORDER BY "amount" ASC, "ts" DESC`);
  });

  test("identifier perimeter rejects DDL-flavoured input", () => {
    const spec = QuerySpec.parse({
      from: { schema: "public", table: "orders; DROP TABLE users" },
    });
    expect(() => compileQuery(spec, "postgres")).toThrow(/unsafe identifier/);
  });
});

describe("compileQuery — mysql dialect", () => {
  test("identifiers are backticked, parameters use ?", () => {
    const spec = QuerySpec.parse({
      from: baseFrom,
      filters: [{ column: "status", op: "=", value: "completed" }],
    });
    const out = compileQuery(spec, "mysql");
    expect(out.sql).toBe(
      "SELECT * FROM `public`.`orders` WHERE `status` = ? LIMIT 1000",
    );
    expect(out.params).toEqual(["completed"]);
  });

  test("month bucket emits DATE_FORMAT, not date_trunc", () => {
    const spec = QuerySpec.parse({
      from: baseFrom,
      dimensions: [{ column: "ts", granularity: "month" }],
      measures: [{ column: "*", agg: "count" }],
    });
    const out = compileQuery(spec, "mysql");
    expect(out.sql).toContain("DATE_FORMAT(`ts`, '%Y-%m-01')");
    expect(out.sql).not.toContain("date_trunc");
  });
});

describe("compileQuery — duckdb dialect", () => {
  test("double-quoted identifiers with ? placeholders", () => {
    const spec = QuerySpec.parse({
      from: baseFrom,
      filters: [{ column: "amount", op: ">", value: 100 }],
    });
    const out = compileQuery(spec, "duckdb");
    expect(out.sql).toBe(
      `SELECT * FROM "public"."orders" WHERE "amount" > ? LIMIT 1000`,
    );
    expect(out.params).toEqual([100]);
  });
});

describe("QuerySpec validation", () => {
  test("count(*) is valid; sum(*) is rejected", () => {
    expect(() =>
      QuerySpec.parse({
        from: baseFrom,
        measures: [{ column: "*", agg: "count" }],
      }),
    ).not.toThrow();
    expect(() =>
      QuerySpec.parse({
        from: baseFrom,
        measures: [{ column: "*", agg: "sum" }],
      }),
    ).toThrow();
  });

  test("filter with op='in' requires a non-empty array value", () => {
    expect(() =>
      QuerySpec.parse({
        from: baseFrom,
        filters: [{ column: "x", op: "in", value: "not-an-array" }],
      }),
    ).toThrow();
    expect(() =>
      QuerySpec.parse({
        from: baseFrom,
        filters: [{ column: "x", op: "in", value: [] }],
      }),
    ).toThrow();
  });

  test("filter with op='is_null' rejects a value", () => {
    expect(() =>
      QuerySpec.parse({
        from: baseFrom,
        filters: [{ column: "x", op: "is_null", value: 1 }],
      }),
    ).toThrow();
  });

  test("limit defaults to 1000 and caps at 10 000", () => {
    expect(QuerySpec.parse({ from: baseFrom }).limit).toBe(1000);
    expect(() => QuerySpec.parse({ from: baseFrom, limit: 10_001 })).toThrow();
  });
});
