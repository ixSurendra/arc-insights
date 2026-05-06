/**
 * Data Model types — Phase 1 frontend mirror of the semantic-layer
 * "B-plus" shape locked in UX-SPEC §8. Backend Drizzle schema for
 * persistence lands with P1-21..P1-25; the in-memory shape below
 * matches the API contract those tasks will expose.
 */

export type FieldType =
  | "string"
  | "integer"
  | "float"
  | "currency"
  | "percent"
  | "date"
  | "datetime"
  | "boolean"
  | "email"
  | "url"
  | "category"
  | "json";

export interface ModelColumn {
  /** Raw DB column name (e.g. customer_id). */
  name: string;
  /** Friendly label shown in widgets / AI / charts. */
  friendlyName: string;
  /** Field type — drives default formatting and chart-type compatibility. */
  fieldType: FieldType;
  /** When set, this column is a foreign key to another model table. */
  fkTo?: { table: string; labelColumn: string };
  /** Hidden from analysts (passwords, internal flags). */
  hidden: boolean;
  /** Optional plain-English description for AI grounding. */
  description?: string;
}

export interface ModelTable {
  /** Schema-qualified id (e.g. public.orders). */
  id: string;
  schema: string;
  name: string;
  friendlyName: string;
  rowCount?: number;
  columns: ModelColumn[];
  description?: string;
}

export type MetricKind =
  | "count"
  | "sum"
  | "avg"
  | "count_distinct"
  | "ratio"
  | "sql";

export interface MetricDefinition {
  id: string;
  name: string;
  description?: string;
  kind: MetricKind;
  /** For non-SQL metrics: which table + column the aggregate runs against. */
  table?: string;
  column?: string;
  /** Ratio metric: numerator + denominator. */
  numerator?: { table: string; column: string; agg: "sum" | "count" };
  denominator?: { table: string; column: string; agg: "sum" | "count" };
  /** Free-form SQL expression for kind='sql'. */
  expression?: string;
  /** Field type the metric reads as — drives default formatting. */
  fieldType: FieldType;
  /** How many widgets currently reference the metric. UI-only. */
  usageCount?: number;
}

export type PolicyOp = "=" | "!=" | "in" | "not_in";

export interface AccessPolicyRule {
  /** Table column on the left side of the comparison. */
  column: string;
  op: PolicyOp;
  /** Right side: a JWT claim (e.g. customer_id) or a literal value. */
  claim?: string;
  literal?: string;
}

export interface AccessPolicy {
  id: string;
  table: string;
  description?: string;
  /** Visual rules — empty when policy is expression-only. */
  rules: AccessPolicyRule[];
  /** SQL escape hatch — overrides rules when set. */
  expression?: string;
  enabled: boolean;
}

export interface JoinDefinition {
  id: string;
  /** Source table. */
  from: string;
  /** Target table. */
  to: string;
  /** Equality columns: from.col = to.col */
  on: Array<{ fromColumn: string; toColumn: string }>;
  joinType: "inner" | "left" | "right" | "full";
}

export interface DataModel {
  tables: ModelTable[];
  metrics: MetricDefinition[];
  policies: AccessPolicy[];
  joins: JoinDefinition[];
  /** Tenant-defined JWT claims expected from embedded contexts. */
  jwtClaims: string[];
  /** True until tenant has reviewed/confirmed the auto-detected model. */
  pendingReview: boolean;
}
