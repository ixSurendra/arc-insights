/**
 * Frontend-side preview helpers — keep the builder responsive without
 * a backend round-trip on every keystroke. The backend's `compileQuery`
 * remains the source of truth at execution time.
 *
 * Two functions:
 *   - previewSql(spec, dialect)   → human-readable SQL with values inlined
 *                                   (NEVER use this output for execution!)
 *   - previewExecute(spec, rows)  → runs a small subset of QuerySpec
 *                                   semantics against an in-memory array
 *                                   so the chart preview can render.
 */
import type {
  Aggregate,
  Dimension,
  Filter,
  Granularity,
  Measure,
  QuerySpec,
} from "./types";

// ─── SQL preview (display only) ─────────────────────────────────────
function quote(name: string): string {
  return `"${name}"`;
}

function bucket(expr: string, g: Granularity): string {
  return `date_trunc('${g}', ${expr})`;
}

function literal(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return `(${v.map(literal).join(", ")})`;
  return `'${String(v).replace(/'/g, "''")}'`;
}

function aggExpr(agg: Aggregate, col: string): string {
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

function dimensionExpr(dim: Dimension): string {
  const col = quote(dim.column);
  return dim.granularity ? bucket(col, dim.granularity) : col;
}

function defaultDimensionAlias(d: Dimension): string {
  return d.granularity ? `${d.column}_${d.granularity}` : d.column;
}
function defaultMeasureAlias(m: Measure): string {
  if (m.column === "*" && m.agg === "count") return "count";
  return `${m.column}_${m.agg}`;
}

function filterExpr(f: Filter): string {
  const col = quote(f.column);
  switch (f.op) {
    case "is_null":
      return `${col} IS NULL`;
    case "is_not_null":
      return `${col} IS NOT NULL`;
    case "in":
      return `${col} IN ${literal(f.value)}`;
    case "not_in":
      return `${col} NOT IN ${literal(f.value)}`;
    case "like":
      return `${col} LIKE ${literal(f.value)}`;
    default:
      return `${col} ${f.op} ${literal(f.value)}`;
  }
}

export function previewSql(spec: QuerySpec): string {
  const select: string[] = [];
  for (const dim of spec.dimensions) {
    select.push(
      `${dimensionExpr(dim)} AS ${quote(dim.alias ?? defaultDimensionAlias(dim))}`,
    );
  }
  for (const m of spec.measures) {
    const col = m.column === "*" ? "*" : quote(m.column);
    select.push(
      `${aggExpr(m.agg, col)} AS ${quote(m.alias ?? defaultMeasureAlias(m))}`,
    );
  }
  if (select.length === 0) select.push("*");

  const from = `${quote(spec.from.schema)}.${quote(spec.from.table)}`;
  const where = spec.filters.map(filterExpr).join(" AND ");
  const hasAgg = spec.measures.length > 0;
  const groupBy =
    hasAgg && spec.dimensions.length > 0
      ? spec.dimensions.map(dimensionExpr).join(", ")
      : "";
  const orderBy = spec.orderBy
    .map((o) => `${quote(o.column)} ${o.direction.toUpperCase()}`)
    .join(", ");

  let sql = `SELECT ${select.join(",\n       ")}\nFROM ${from}`;
  if (where) sql += `\nWHERE ${where}`;
  if (groupBy) sql += `\nGROUP BY ${groupBy}`;
  if (orderBy) sql += `\nORDER BY ${orderBy}`;
  sql += `\nLIMIT ${spec.limit}`;
  return sql;
}

// ─── Local execution against sample rows ────────────────────────────
function bucketDate(value: unknown, g: Granularity): string {
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  switch (g) {
    case "year":
      return `${d.getUTCFullYear()}-01-01`;
    case "quarter": {
      const q = Math.floor(d.getUTCMonth() / 3);
      const m = (q * 3 + 1).toString().padStart(2, "0");
      return `${d.getUTCFullYear()}-${m}-01`;
    }
    case "month":
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
    case "week": {
      const copy = new Date(d.getTime());
      const day = copy.getUTCDay();
      const diff = (day + 6) % 7; // back to Monday
      copy.setUTCDate(copy.getUTCDate() - diff);
      return copy.toISOString().slice(0, 10);
    }
    case "day":
      return d.toISOString().slice(0, 10);
    case "hour":
      return d.toISOString().slice(0, 13) + ":00:00Z";
  }
}

function applyFilter(row: Record<string, unknown>, f: Filter): boolean {
  const v = row[f.column];
  switch (f.op) {
    case "is_null":
      return v === null || v === undefined;
    case "is_not_null":
      return v !== null && v !== undefined;
    case "in":
      return Array.isArray(f.value) && f.value.includes(v);
    case "not_in":
      return Array.isArray(f.value) && !f.value.includes(v);
    case "like":
      return typeof v === "string" && typeof f.value === "string"
        ? v.includes(f.value.replace(/%/g, ""))
        : false;
    case "=":
      return v === f.value;
    case "!=":
      return v !== f.value;
    case "<":
    case "<=":
    case ">":
    case ">=": {
      const lhs = typeof v === "number" ? v : Number(v);
      const rhs =
        typeof f.value === "number" ? f.value : Number(f.value as string);
      if (Number.isNaN(lhs) || Number.isNaN(rhs)) return false;
      switch (f.op) {
        case "<":
          return lhs < rhs;
        case "<=":
          return lhs <= rhs;
        case ">":
          return lhs > rhs;
        case ">=":
          return lhs >= rhs;
      }
      return false;
    }
  }
}

function aggregate(values: unknown[], agg: Aggregate): number | null {
  const numeric = values
    .map((v) => (typeof v === "number" ? v : Number(v)))
    .filter((n) => Number.isFinite(n));
  if (agg === "count") return values.length;
  if (agg === "count_distinct") return new Set(values).size;
  if (numeric.length === 0) return null;
  switch (agg) {
    case "sum":
      return numeric.reduce((a, b) => a + b, 0);
    case "avg":
      return numeric.reduce((a, b) => a + b, 0) / numeric.length;
    case "min":
      return Math.min(...numeric);
    case "max":
      return Math.max(...numeric);
  }
}

export function previewExecute(
  spec: QuerySpec,
  source: Array<Record<string, unknown>>,
): Array<Record<string, unknown>> {
  // 1. WHERE
  const filtered = spec.filters.length
    ? source.filter((r) => spec.filters.every((f) => applyFilter(r, f)))
    : [...source];

  // 2. GROUP BY (only when measures present)
  const hasAgg = spec.measures.length > 0;
  let rows: Array<Record<string, unknown>>;

  if (hasAgg) {
    type Group = {
      key: string;
      dimVals: Record<string, unknown>;
      rows: Array<Record<string, unknown>>;
    };
    const groups = new Map<string, Group>();
    for (const r of filtered) {
      const dimVals: Record<string, unknown> = {};
      for (const d of spec.dimensions) {
        const raw = r[d.column];
        const val = d.granularity ? bucketDate(raw, d.granularity) : raw;
        dimVals[d.alias ?? defaultDimensionAlias(d)] = val;
      }
      const key = JSON.stringify(dimVals);
      let g = groups.get(key);
      if (!g) {
        g = { key, dimVals, rows: [] };
        groups.set(key, g);
      }
      g.rows.push(r);
    }

    rows = [...groups.values()].map((g) => {
      const out: Record<string, unknown> = { ...g.dimVals };
      for (const m of spec.measures) {
        const alias = m.alias ?? defaultMeasureAlias(m);
        const values =
          m.column === "*"
            ? g.rows.map(() => 1)
            : g.rows.map((r) => r[m.column]);
        out[alias] = aggregate(values, m.agg);
      }
      return out;
    });
  } else {
    rows = filtered;
  }

  // 3. ORDER BY
  if (spec.orderBy.length) {
    rows.sort((a, b) => {
      for (const o of spec.orderBy) {
        const av = a[o.column];
        const bv = b[o.column];
        if (av === bv) continue;
        const cmp =
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv));
        return o.direction === "desc" ? -cmp : cmp;
      }
      return 0;
    });
  }

  // 4. LIMIT
  return rows.slice(0, spec.limit);
}
