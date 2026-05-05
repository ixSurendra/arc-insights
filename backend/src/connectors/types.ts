/**
 * Connector interface — every data-source driver implements this.
 *
 * Phase 1 ships Postgres + MySQL + BigQuery + Snowflake (P1-01..P1-04). Each
 * connector exposes the same surface so the query compiler (P1-07) and the
 * API layer (P1-01b) can treat them uniformly.
 *
 * Privacy: connectors NEVER log raw row values. Schema metadata, query
 * plans, and aggregate stats only. PII passes through but doesn't get
 * cached at this tier — that's the result-cache layer's responsibility.
 */

export interface ConnectionTestResult {
  ok: boolean;
  /** Round-trip latency in milliseconds for the test query. */
  latencyMs: number;
  /** Driver / server version string when reachable. */
  serverVersion?: string;
  /** Plain-English error message when ok=false. Never includes credentials. */
  error?: string;
}

export interface SchemaColumn {
  name: string;
  /** Postgres / driver-native type name, e.g. "varchar", "timestamp with time zone". */
  dataType: string;
  /** Driver-normalized broad category for the UI / query builder. */
  inferredKind: "string" | "number" | "boolean" | "datetime" | "json" | "other";
  nullable: boolean;
  ordinal: number;
}

export interface SchemaTable {
  schema: string;
  name: string;
  /** "table" or "view" — derived from information_schema. */
  kind: "table" | "view";
  columns: SchemaColumn[];
}

export interface QueryRow {
  [column: string]: unknown;
}

export interface QueryResult {
  rows: QueryRow[];
  /** Number of rows returned (rows.length unless we ever truncate). */
  rowCount: number;
  /** Wallclock duration including network. */
  durationMs: number;
}

export interface Connector {
  readonly kind: "postgres" | "mysql" | "bigquery" | "snowflake";

  /** Cheap reachability check — `SELECT 1` or driver equivalent. */
  test(): Promise<ConnectionTestResult>;

  /**
   * Introspect tables + columns. Excludes system schemas
   * (pg_catalog, information_schema, etc.) by default.
   */
  scanSchema(): Promise<SchemaTable[]>;

  /**
   * Run a SQL query with a hard timeout (default 30s per CLAUDE.md).
   * Connectors MUST enforce the timeout at the driver level; the API
   * tier additionally enforces it via AbortController.
   */
  runQuery(sql: string, params?: unknown[]): Promise<QueryResult>;

  /** Release connections / pool. Idempotent. */
  close(): Promise<void>;
}
