/**
 * Tests for shapeWithDuckDB — runs against an in-memory DuckDB, no external
 * services needed.
 */
import { describe, expect, test } from "bun:test";
import { shapeWithDuckDB } from "./shape.ts";

describe("shapeWithDuckDB", () => {
  test("loads rows and runs an aggregate query against the input CTE", async () => {
    const rows = [
      { region: "EU", amount: 100 },
      { region: "EU", amount: 50 },
      { region: "US", amount: 200 },
    ];
    const result = await shapeWithDuckDB(
      rows,
      "SELECT region, SUM(amount) AS total FROM input GROUP BY region ORDER BY region",
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ region: "EU", total: 150n });
    expect(result[1]).toEqual({ region: "US", total: 200n });
  });

  test("hostile cell values are bound, not interpolated", async () => {
    // If shapeWithDuckDB string-built a VALUES clause, this would crash.
    const rows = [{ name: "'); DROP TABLE input; --" }];
    const result = await shapeWithDuckDB(rows, "SELECT name FROM input");
    expect(result).toEqual([{ name: "'); DROP TABLE input; --" }]);
  });

  test("empty input returns the SQL's natural shape", async () => {
    const result = await shapeWithDuckDB([], "SELECT 42 AS answer");
    expect(result).toEqual([{ answer: 42 }]);
  });

  test("rejects oversized inputs", async () => {
    const tooMany = Array.from({ length: 11 }, (_, i) => ({ i }));
    await expect(
      shapeWithDuckDB(tooMany, "SELECT * FROM input", { maxRows: 10 }),
    ).rejects.toThrow(/exceeds maxRows/);
  });
});
