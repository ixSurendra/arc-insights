/**
 * Compile a QuerySpec to SQL + bound parameters for one of the supported
 * dialects. Identifier quoting and time-bucket expressions differ; the
 * structure is shared.
 *
 * Identifiers (column / table / schema names) are quoted, NOT bound — they
 * can't be parameters in SQL. We sanitize them by rejecting anything that
 * isn't [A-Za-z0-9_].* — that's the perimeter check; the compiler's caller
 * should still validate column names exist before invoking us.
 *
 * Values are always bound. Dialect-specific placeholder style:
 *   postgres → $1, $2, …
 *   mysql    → ?, ?, …
 *   duckdb   → ?, ?, …
 */
import {
  type Aggregate,
  type Dimension,
  type Filter,
  type Granularity,
  type Measure,
  type Order,
  type QuerySpec,
  defaultDimensionAlias,
  defaultMeasureAlias,
} from "./spec.ts";

export type Dialect = "postgres" | "mysql" | "duckdb";

export interface CompiledQuery {
  sql: string;
  params: unknown[];
}

const SAFE_IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;

function checkIdent(id: string): string {
  if (!SAFE_IDENT.test(id)) {
    throw new Error(`unsafe identifier: ${JSON.stringify(id)}`);
  }
  return id;
}

interface DialectImpl {
  quoteIdent(name: string): string;
  placeholder(index: number): string;
  /** Truncate a timestamp expression to the bucket boundary. */
  dateTrunc(quotedExpr: string, g: Granularity): string;
}

const POSTGRES: DialectImpl = {
  quoteIdent: (name) => `"${checkIdent(name)}"`,
  placeholder: (i) => `$${i}`,
  dateTrunc: (expr, g) => `date_trunc('${g}', ${expr})`,
};

const MYSQL: DialectImpl = {
  quoteIdent: (name) => `\`${checkIdent(name)}\``,
  placeholder: () => `?`,
  dateTrunc: (expr, g) => {
    // MySQL has no date_trunc — emulate with DATE_FORMAT for the common
    // granularities. Quarter and week need extra arithmetic.
    switch (g) {
      case "hour":
        return `DATE_FORMAT(${expr}, '%Y-%m-%d %H:00:00')`;
      case "day":
        return `DATE(${expr})`;
      case "week":
        return `DATE_SUB(DATE(${expr}), INTERVAL WEEKDAY(${expr}) DAY)`;
      case "month":
        return `DATE_FORMAT(${expr}, '%Y-%m-01')`;
      case "quarter":
        return `MAKEDATE(YEAR(${expr}), 1) + INTERVAL QUARTER(${expr})-1 QUARTER`;
      case "year":
        return `DATE_FORMAT(${expr}, '%Y-01-01')`;
    }
  },
};

const DUCKDB: DialectImpl = {
  quoteIdent: (name) => `"${checkIdent(name)}"`,
  placeholder: () => `?`,
  dateTrunc: (expr, g) => `date_trunc('${g}', ${expr})`,
};

const DIALECTS: Record<Dialect, DialectImpl> = {
  postgres: POSTGRES,
  mysql: MYSQL,
  duckdb: DUCKDB,
};

class Compiler {
  readonly params: unknown[] = [];

  constructor(private readonly d: DialectImpl) {}

  bind(value: unknown): string {
    this.params.push(value);
    return this.d.placeholder(this.params.length);
  }

  dimensionExpr(dim: Dimension): string {
    const col = this.d.quoteIdent(dim.column);
    return dim.granularity ? this.d.dateTrunc(col, dim.granularity) : col;
  }

  measureExpr(m: Measure): string {
    const col = m.column === "*" ? "*" : this.d.quoteIdent(m.column);
    return aggToSql(m.agg, col);
  }

  filterExpr(f: Filter): string {
    const col = this.d.quoteIdent(f.column);
    switch (f.op) {
      case "is_null":
        return `${col} IS NULL`;
      case "is_not_null":
        return `${col} IS NOT NULL`;
      case "in":
      case "not_in": {
        const values = f.value as unknown[];
        const placeholders = values.map((v) => this.bind(v)).join(", ");
        return `${col} ${f.op === "in" ? "IN" : "NOT IN"} (${placeholders})`;
      }
      case "like":
        return `${col} LIKE ${this.bind(f.value)}`;
      default:
        return `${col} ${f.op} ${this.bind(f.value)}`;
    }
  }

  orderExpr(o: Order): string {
    return `${this.d.quoteIdent(o.column)} ${o.direction.toUpperCase()}`;
  }
}

function aggToSql(agg: Aggregate, col: string): string {
  switch (agg) {
    case "count":
      return `COUNT(${col})`;
    case "count_distinct":
      return `COUNT(DISTINCT ${col})`;
    case "sum":
      return `SUM(${col})`;
    case "avg":
      return `AVG(${col})`;
    case "min":
      return `MIN(${col})`;
    case "max":
      return `MAX(${col})`;
  }
}

export function compileQuery(spec: QuerySpec, dialect: Dialect): CompiledQuery {
  const d = DIALECTS[dialect];
  const c = new Compiler(d);

  // SELECT
  const selectParts: string[] = [];
  for (const dim of spec.dimensions) {
    selectParts.push(
      `${c.dimensionExpr(dim)} AS ${d.quoteIdent(dim.alias ?? defaultDimensionAlias(dim))}`,
    );
  }
  for (const m of spec.measures) {
    selectParts.push(
      `${c.measureExpr(m)} AS ${d.quoteIdent(m.alias ?? defaultMeasureAlias(m))}`,
    );
  }
  if (selectParts.length === 0) selectParts.push("*");

  // FROM
  const from = `${d.quoteIdent(spec.from.schema)}.${d.quoteIdent(spec.from.table)}`;

  // WHERE
  const where = spec.filters.map((f) => c.filterExpr(f)).join(" AND ");

  // GROUP BY — only when aggregating
  const hasAgg = spec.measures.length > 0;
  const groupBy =
    hasAgg && spec.dimensions.length > 0
      ? spec.dimensions.map((dim) => c.dimensionExpr(dim)).join(", ")
      : "";

  // ORDER BY
  const orderBy = spec.orderBy.map((o) => c.orderExpr(o)).join(", ");

  // Assemble
  let sql = `SELECT ${selectParts.join(", ")} FROM ${from}`;
  if (where) sql += ` WHERE ${where}`;
  if (groupBy) sql += ` GROUP BY ${groupBy}`;
  if (orderBy) sql += ` ORDER BY ${orderBy}`;
  sql += ` LIMIT ${spec.limit}`;

  return { sql, params: c.params };
}
