/**
 * Frontend mirror of backend/src/query/spec.ts. Types only — Zod
 * validation runs at the API edge when the spec is submitted. We keep
 * this small mirror because importing backend code into the browser
 * would pull `postgres`, `mysql2`, etc. P1-05b extracts both into a
 * shared `@arc-insights/query` workspace package.
 */
export type Granularity =
  | "hour"
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "year";

export type Aggregate =
  | "sum"
  | "count"
  | "count_distinct"
  | "avg"
  | "min"
  | "max";

export type FilterOp =
  | "="
  | "!="
  | "<"
  | "<="
  | ">"
  | ">="
  | "in"
  | "not_in"
  | "is_null"
  | "is_not_null"
  | "like";

export interface Dimension {
  column: string;
  alias?: string;
  granularity?: Granularity;
}

export interface Measure {
  column: string;
  agg: Aggregate;
  alias?: string;
}

export interface Filter {
  column: string;
  op: FilterOp;
  value?: unknown;
}

export interface Order {
  column: string;
  direction: "asc" | "desc";
}

export interface QuerySpec {
  from: { schema: string; table: string };
  dimensions: Dimension[];
  measures: Measure[];
  filters: Filter[];
  orderBy: Order[];
  limit: number;
}

/** A scanned table — output of Connector.scanSchema(). */
export interface SchemaColumn {
  name: string;
  dataType: string;
  inferredKind: "string" | "number" | "boolean" | "datetime" | "json" | "other";
  nullable: boolean;
}

export interface SchemaTable {
  schema: string;
  name: string;
  columns: SchemaColumn[];
}
