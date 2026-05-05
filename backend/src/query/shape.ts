/**
 * DuckDB result shaping.
 *
 * Loads rows produced by a source-database connector into an in-memory
 * DuckDB instance and runs a shaping query against them — the canonical
 * use cases are time-series gap-filling, pivoting, and rolling windows
 * that the source DB can't (or shouldn't) compute.
 *
 * The rows are exposed inside DuckDB as a CTE named `input`. The caller's
 * `ddbSql` should reference `input` rather than a literal table name. We
 * use VALUES clauses with bound parameters so even adversarial cell
 * values can't break out of the SQL.
 *
 * Scope (Phase 1, first slice):
 *   - In-memory only — no persistent DuckDB file.
 *   - Tested ceiling ~10k rows per call; larger result sets should
 *     compute aggregates source-side first.
 *   - One ephemeral DuckDB per call. P2-02 will keep a per-tenant pool.
 */
import { Database } from "duckdb-async";
import { type QueryRow } from "../connectors/types.ts";

export interface ShapeOptions {
  /** Hard cap on rows passed in. Default 10 000. */
  maxRows?: number;
}

export async function shapeWithDuckDB(
  rows: QueryRow[],
  ddbSql: string,
  options: ShapeOptions = {},
): Promise<QueryRow[]> {
  const maxRows = options.maxRows ?? 10_000;
  if (rows.length > maxRows) {
    throw new Error(
      `shapeWithDuckDB: ${rows.length} rows exceeds maxRows=${maxRows}; aggregate source-side first`,
    );
  }
  if (rows.length === 0) {
    // Nothing to shape. Run the SQL against an empty CTE so the caller
    // still gets the right column shape if their query doesn't depend
    // on input rows (e.g. a generate_series scaffold).
    const db = await Database.create(":memory:");
    try {
      const result = await db.all(
        `WITH input AS (SELECT NULL WHERE FALSE) ${ddbSql}`,
      );
      return result as QueryRow[];
    } finally {
      // process.exit not used here — short-lived test path; close is safe
      await db.close().catch(() => {});
    }
  }

  // Stable column order from the first row.
  const cols = Object.keys(rows[0]!);
  const placeholderRow = `(${cols.map(() => "?").join(", ")})`;
  const valuesClause = rows.map(() => placeholderRow).join(",\n");
  const colList = cols.map((c) => `"${c.replace(/"/g, '""')}"`).join(", ");
  const sql = `WITH input(${colList}) AS (VALUES ${valuesClause}) ${ddbSql}`;
  const params = rows.flatMap((r) => cols.map((c) => r[c] ?? null));

  const db = await Database.create(":memory:");
  try {
    const result = await db.all(sql, ...params);
    return result as QueryRow[];
  } finally {
    await db.close().catch(() => {});
  }
}
