/**
 * Dashboard template — abstract definition that gets bound to the
 * tenant's actual schema at smart-fill time.
 *
 * A template lists the *roles* it needs (e.g. "primary measure",
 * "category dimension", "time axis", "geo column"). The smart-fill
 * mapper proposes a binding from each role to one of the tenant's
 * columns, the tenant confirms, and we synthesize a real dashboard.
 */

import type { FieldType, ModelTable } from "../data-model/types";

export type RoleKind =
  | "measure" // any numeric column
  | "dimension" // categorical for grouping
  | "time" // date / datetime
  | "geo" // geographic (country / region / state / …)
  | "ratio_num" // numerator for ratio metrics
  | "ratio_den"; // denominator for ratio metrics

export interface TemplateFieldRole {
  /** Stable role id used by widgets in the template. */
  id: string;
  /** Friendly label shown in the smart-fill dialog. */
  label: string;
  /** Single-line description / hint. */
  hint: string;
  kind: RoleKind;
  /** When set, only columns of these field types are eligible. */
  acceptedTypes?: FieldType[];
  /** Optional: prefer this column if it exists by name. */
  preferredNames?: string[];
  /** Marked optional — if no good match, the widget that uses it
   *  is dropped instead of failing the whole template. */
  optional?: boolean;
}

export type TemplateWidgetType =
  | "kpi-card"
  | "big-number"
  | "line"
  | "column"
  | "bar"
  | "donut"
  | "pie"
  | "choropleth"
  | "table";

export interface TemplateWidget {
  id: string;
  title: string;
  widgetType: TemplateWidgetType;
  /** 4-column grid: span.cols defines width 1-4, span.rows defines height. */
  span: { cols: 1 | 2 | 3 | 4; rows: 1 | 2 };
  /** Role bindings. The mapper resolves these to column references. */
  roles: {
    /** Numeric measure (sum/count/avg) — the "value" axis. */
    measure?: string;
    /** Categorical / dimension column — typically the X axis or slice. */
    dimension?: string;
    /** Time axis (date/datetime). */
    time?: string;
    /** Geographic column for choropleth. */
    geo?: string;
  };
  /** Default aggregation when bound to a measure. */
  agg?: "sum" | "count" | "avg";
}

export interface DashboardTemplate {
  id: string;
  title: string;
  description: string;
  /** Tenant-facing folder/category. */
  folder: string;
  fieldRoles: TemplateFieldRole[];
  widgets: TemplateWidget[];
}

/** A resolved binding: each role id → an actual table+column reference. */
export interface RoleMapping {
  /** roleId → ref or null when intentionally skipped. */
  bindings: Record<string, { tableId: string; columnName: string } | null>;
  /** Which table the mapping is anchored to (the "primary" fact table). */
  primaryTable: string;
}

export interface MappingSuggestion {
  mapping: RoleMapping;
  /** Per-role explanation strings — shown to tenant for trust. */
  reasoning: Record<string, string>;
  /** Roles that have no good column match — tenant must resolve. */
  unresolved: string[];
}

/** Feed for the smart-fill mapper — the tenant's data model surface. */
export interface SmartFillContext {
  tables: ModelTable[];
}
