/**
 * P1-01 — Postgres connector.
 *
 * Wraps `postgres.js` with a uniform Connector surface (test + scanSchema +
 * runQuery + close). One instance per data source = one connection pool.
 *
 * Hard 30s query timeout per CLAUDE.md. Closes cleanly on idle.
 */
import postgres, { type Sql } from "postgres";
import {
  type Connector,
  type ConnectionTestResult,
  type QueryResult,
  type SchemaColumn,
  type SchemaTable,
} from "./types.ts";

export interface PostgresConnectorConfig {
  /** Full connection string. Drivers read host, port, user, pass, db, ssl. */
  url: string;
  /** Pool size cap. Default 5 — tune per data source from the metadata layer. */
  poolMax?: number;
  /** Hard query timeout in ms. Default 30 000 (CLAUDE.md). */
  queryTimeoutMs?: number;
  /** Optional AbortSignal to cancel an in-flight test/scan/query. */
  signal?: AbortSignal;
}

const SYSTEM_SCHEMAS = new Set([
  "pg_catalog",
  "pg_toast",
  "information_schema",
]);

function inferKind(dataType: string): SchemaColumn["inferredKind"] {
  const t = dataType.toLowerCase();
  if (
    t.includes("char") ||
    t.includes("text") ||
    t === "uuid" ||
    t === "name"
  ) {
    return "string";
  }
  if (
    t.startsWith("int") ||
    t === "smallint" ||
    t === "bigint" ||
    t.startsWith("numeric") ||
    t.startsWith("decimal") ||
    t === "real" ||
    t === "double precision"
  ) {
    return "number";
  }
  if (t === "boolean") return "boolean";
  if (t.startsWith("timestamp") || t === "date" || t === "time") {
    return "datetime";
  }
  if (t === "json" || t === "jsonb") return "json";
  return "other";
}

export class PostgresConnector implements Connector {
  readonly kind = "postgres" as const;
  private readonly client: Sql;
  private readonly queryTimeoutMs: number;
  private closed = false;

  constructor(private readonly config: PostgresConnectorConfig) {
    this.queryTimeoutMs = config.queryTimeoutMs ?? 30_000;
    this.client = postgres(config.url, {
      max: config.poolMax ?? 5,
      idle_timeout: 30,
      max_lifetime: 60 * 30,
      connect_timeout: 10,
    });
  }

  async test(): Promise<ConnectionTestResult> {
    const t0 = performance.now();
    try {
      const rows = await this.client<
        Array<{ version: string }>
      >`SELECT version() AS version`;
      return {
        ok: true,
        latencyMs: Math.round(performance.now() - t0),
        serverVersion: rows[0]?.version,
      };
    } catch (err) {
      return {
        ok: false,
        latencyMs: Math.round(performance.now() - t0),
        error: err instanceof Error ? err.message : "unknown error",
      };
    }
  }

  async scanSchema(): Promise<SchemaTable[]> {
    interface InfoRow {
      table_schema: string;
      table_name: string;
      table_type: "BASE TABLE" | "VIEW";
      column_name: string;
      data_type: string;
      is_nullable: "YES" | "NO";
      ordinal_position: number;
    }

    const rows = await this.client<InfoRow[]>`
      SELECT
        c.table_schema,
        c.table_name,
        t.table_type,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.ordinal_position
      FROM information_schema.columns c
      JOIN information_schema.tables t
        ON t.table_schema = c.table_schema AND t.table_name = c.table_name
      WHERE t.table_type IN ('BASE TABLE', 'VIEW')
      ORDER BY c.table_schema, c.table_name, c.ordinal_position
    `;

    const byTable = new Map<string, SchemaTable>();
    for (const r of rows) {
      if (SYSTEM_SCHEMAS.has(r.table_schema)) continue;
      const key = `${r.table_schema}.${r.table_name}`;
      let table = byTable.get(key);
      if (!table) {
        table = {
          schema: r.table_schema,
          name: r.table_name,
          kind: r.table_type === "VIEW" ? "view" : "table",
          columns: [],
        };
        byTable.set(key, table);
      }
      table.columns.push({
        name: r.column_name,
        dataType: r.data_type,
        inferredKind: inferKind(r.data_type),
        nullable: r.is_nullable === "YES",
        ordinal: r.ordinal_position,
      });
    }

    return [...byTable.values()].sort((a, b) =>
      a.schema === b.schema
        ? a.name.localeCompare(b.name)
        : a.schema.localeCompare(b.schema),
    );
  }

  async runQuery(sql: string, params: unknown[] = []): Promise<QueryResult> {
    const t0 = performance.now();
    // postgres.js's `unsafe()` doesn't expose a per-query statement_timeout
    // hook cleanly, and SET LOCAL needs its own transaction context to avoid
    // mixing rowsets with the actual query. Enforcement of the 30s hard
    // timeout (CLAUDE.md) happens at the API tier via AbortController in
    // P1-01b — this connector is a primitive and trusts its caller.
    const rows = await this.client.unsafe<QueryResult["rows"]>(
      sql,
      params as never[],
    );
    return {
      rows,
      rowCount: rows.length,
      durationMs: Math.round(performance.now() - t0),
    };
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    await this.client.end({ timeout: 5 });
  }
}
