/**
 * executeQuery — orchestrator that ties spec → SQL → connector → optional
 * DuckDB shaping → result.
 *
 * Connectors are dialect-tagged via their `kind` field, so we pick the
 * compiler dialect automatically. The optional `shapeWith` parameter lets
 * the caller post-process the rows in DuckDB without managing the lifecycle
 * directly.
 */
import { type Connector, type QueryResult } from "../connectors/types.ts";
import { compileQuery, type Dialect } from "./compile.ts";
import { shapeWithDuckDB } from "./shape.ts";
import { type QuerySpec } from "./spec.ts";

export interface ExecuteOptions {
  /** Apply this DuckDB SQL to the result rows after the source query runs. */
  shapeWith?: string;
}

const KIND_TO_DIALECT: Record<Connector["kind"], Dialect> = {
  postgres: "postgres",
  mysql: "mysql",
  // BigQuery and Snowflake will get their own dialects in P1-03 / P1-04.
  // For now point them at postgres — the standard SELECT shape happens to
  // be valid in both, but compileQuery will need to learn their quirks.
  bigquery: "postgres",
  snowflake: "postgres",
};

export async function executeQuery(
  spec: QuerySpec,
  connector: Connector,
  options: ExecuteOptions = {},
): Promise<QueryResult> {
  const dialect = KIND_TO_DIALECT[connector.kind];
  const { sql, params } = compileQuery(spec, dialect);
  const sourceResult = await connector.runQuery(sql, params);

  if (!options.shapeWith) return sourceResult;

  const t0 = performance.now();
  const shapedRows = await shapeWithDuckDB(
    sourceResult.rows,
    options.shapeWith,
  );
  return {
    rows: shapedRows,
    rowCount: shapedRows.length,
    durationMs: sourceResult.durationMs + Math.round(performance.now() - t0),
  };
}
