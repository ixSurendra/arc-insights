/**
 * P1-02 — MySQL / MariaDB connector.
 *
 * Wraps mysql2/promise with the same Connector surface as the Postgres
 * driver. One pool per data source. The interface stayed unchanged from
 * P1-01 — the only MySQL-specific bits are the system-schema list, the
 * type-inference table, and the version query.
 */
import mysql from "mysql2/promise";
import {
  type Connector,
  type ConnectionTestResult,
  type QueryResult,
  type SchemaColumn,
  type SchemaTable,
} from "./types.ts";

export interface MysqlConnectorConfig {
  /** mysql:// URL or a DSN string. */
  url: string;
  poolMax?: number;
  /** Reserved for P1-01b — timeout enforcement at the API tier. */
  queryTimeoutMs?: number;
  signal?: AbortSignal;
}

const SYSTEM_SCHEMAS = new Set([
  "information_schema",
  "mysql",
  "performance_schema",
  "sys",
]);

function inferKind(dataType: string): SchemaColumn["inferredKind"] {
  const t = dataType.toLowerCase();
  if (
    t.includes("char") ||
    t.includes("text") ||
    t === "enum" ||
    t === "set" ||
    t === "json" // mysql json is a real type — but we still bucket it as json
  ) {
    if (t === "json") return "json";
    return "string";
  }
  if (
    t.startsWith("int") ||
    t === "tinyint" || // also boolean in MySQL — handled below
    t === "smallint" ||
    t === "mediumint" ||
    t === "bigint" ||
    t === "decimal" ||
    t === "numeric" ||
    t === "float" ||
    t === "double"
  ) {
    return "number";
  }
  if (t === "boolean" || t === "bool") return "boolean";
  if (
    t === "date" ||
    t === "datetime" ||
    t === "timestamp" ||
    t === "time" ||
    t === "year"
  ) {
    return "datetime";
  }
  return "other";
}

export class MysqlConnector implements Connector {
  readonly kind = "mysql" as const;
  private readonly pool: mysql.Pool;
  private closed = false;

  constructor(config: MysqlConnectorConfig) {
    this.pool = mysql.createPool({
      uri: config.url,
      connectionLimit: config.poolMax ?? 5,
      idleTimeout: 30_000,
      connectTimeout: 10_000,
      // Returning Date objects rather than strings for datetime types.
      dateStrings: false,
    });
  }

  async test(): Promise<ConnectionTestResult> {
    const t0 = performance.now();
    try {
      const [rows] = await this.pool.query<mysql.RowDataPacket[]>(
        "SELECT VERSION() AS version",
      );
      const version = rows[0]?.["version"];
      return {
        ok: true,
        latencyMs: Math.round(performance.now() - t0),
        serverVersion: typeof version === "string" ? version : undefined,
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
    interface InfoRow extends mysql.RowDataPacket {
      table_schema: string;
      table_name: string;
      table_type: string;
      column_name: string;
      data_type: string;
      is_nullable: "YES" | "NO";
      ordinal_position: number;
    }

    // MySQL 8 returns information_schema columns in uppercase by default.
    // Aliasing each selected column to lowercase makes the row shape stable
    // across MySQL versions and case-sensitivity settings.
    const [rows] = await this.pool.query<InfoRow[]>(`
      SELECT
        c.TABLE_SCHEMA      AS table_schema,
        c.TABLE_NAME        AS table_name,
        t.TABLE_TYPE        AS table_type,
        c.COLUMN_NAME       AS column_name,
        c.DATA_TYPE         AS data_type,
        c.IS_NULLABLE       AS is_nullable,
        c.ORDINAL_POSITION  AS ordinal_position
      FROM information_schema.columns c
      JOIN information_schema.tables t
        USING (TABLE_SCHEMA, TABLE_NAME)
      WHERE t.TABLE_TYPE IN ('BASE TABLE', 'VIEW')
      ORDER BY c.TABLE_SCHEMA, c.TABLE_NAME, c.ORDINAL_POSITION
    `);

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
    const [rows] = await this.pool.query<mysql.RowDataPacket[]>(sql, params);
    return {
      rows: rows as QueryResult["rows"],
      rowCount: rows.length,
      durationMs: Math.round(performance.now() - t0),
    };
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    await this.pool.end();
  }
}
