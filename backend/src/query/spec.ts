/**
 * QuerySpec — the JSON contract between the visual builder (P1-05),
 * the SQL editor (P1-06), and the compiler (this module's sibling).
 *
 * Stays deliberately small for v1: SELECT / GROUP BY / WHERE / ORDER BY /
 * LIMIT against a single table. No joins, no subqueries, no HAVING, no
 * window functions yet. Phase 5's cohort/funnel/retention builders extend
 * the spec with their own shapes — those compile to specialized SQL
 * outside this module.
 *
 * Every shape is Zod-validated at the API edge so a bad spec returns a
 * 400 with a precise error path, never a SQL parse error from the
 * customer database.
 */
import { z } from "zod";

export const Granularity = z.enum([
  "hour",
  "day",
  "week",
  "month",
  "quarter",
  "year",
]);
export type Granularity = z.infer<typeof Granularity>;

export const Aggregate = z.enum([
  "sum",
  "count",
  "count_distinct",
  "avg",
  "min",
  "max",
]);
export type Aggregate = z.infer<typeof Aggregate>;

export const FilterOp = z.enum([
  "=",
  "!=",
  "<",
  "<=",
  ">",
  ">=",
  "in",
  "not_in",
  "is_null",
  "is_not_null",
  "like",
]);
export type FilterOp = z.infer<typeof FilterOp>;

/** A grouping column — optionally bucketed by a time granularity. */
export const Dimension = z.object({
  column: z.string().min(1),
  alias: z.string().min(1).optional(),
  granularity: Granularity.optional(),
});
export type Dimension = z.infer<typeof Dimension>;

/** An aggregated column. `column: "*"` is only valid with `agg: "count"`. */
export const Measure = z
  .object({
    column: z.string().min(1),
    agg: Aggregate,
    alias: z.string().min(1).optional(),
  })
  .refine((m) => !(m.column === "*" && m.agg !== "count"), {
    message: "column='*' is only valid with agg='count'",
  });
export type Measure = z.infer<typeof Measure>;

/**
 * A WHERE-clause predicate. Value semantics depend on op:
 *   =, !=, <, <=, >, >=, like → primitive value
 *   in, not_in                 → array of primitives
 *   is_null, is_not_null       → no value
 */
export const Filter = z
  .object({
    column: z.string().min(1),
    op: FilterOp,
    value: z.unknown().optional(),
  })
  .refine(
    (f) => {
      if (f.op === "is_null" || f.op === "is_not_null") {
        return f.value === undefined;
      }
      if (f.op === "in" || f.op === "not_in") {
        return Array.isArray(f.value) && f.value.length > 0;
      }
      return f.value !== undefined && f.value !== null;
    },
    {
      message:
        "filter value must match op: array for in/not_in, omitted for is_null/is_not_null, primitive otherwise",
    },
  );
export type Filter = z.infer<typeof Filter>;

export const Order = z.object({
  column: z.string().min(1),
  direction: z.enum(["asc", "desc"]).default("asc"),
});
export type Order = z.infer<typeof Order>;

export const QuerySpec = z.object({
  from: z.object({
    schema: z.string().min(1),
    table: z.string().min(1),
  }),
  dimensions: z.array(Dimension).default([]),
  measures: z.array(Measure).default([]),
  filters: z.array(Filter).default([]),
  orderBy: z.array(Order).default([]),
  /** Hard cap to keep result sets sane. UI can request up to 10 000. */
  limit: z.number().int().positive().max(10_000).default(1000),
});
export type QuerySpec = z.infer<typeof QuerySpec>;

/** Default alias when a measure doesn't supply one — e.g. `amount_sum`. */
export function defaultMeasureAlias(m: Measure): string {
  if (m.column === "*" && m.agg === "count") return "count";
  return `${m.column}_${m.agg}`;
}

/** Default alias for a dimension — `ts_month` for a bucketed dim. */
export function defaultDimensionAlias(d: Dimension): string {
  return d.granularity ? `${d.column}_${d.granularity}` : d.column;
}
