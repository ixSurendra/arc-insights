/**
 * Dashboard model — a saved arrangement of charts driven by QuerySpecs.
 * P1-10 (save/share/fork) persists these via the API and the SDK.
 */
import type { ChartConfig } from "../charts/types";
import type { Filter, QuerySpec } from "../builder/types";

export interface DashboardChart {
  id: string;
  title: string;
  /** The query that produces the chart's data. */
  spec: QuerySpec;
  /** Chart-type-specific config (line/bar/pie/etc.). */
  config: ChartConfig;
  /** Grid placement — 12-column responsive grid; row spans are open-ended. */
  grid: { col: number; row: number; w: number; h: number };
}

export interface Dashboard {
  id: string;
  title: string;
  description?: string;
  /**
   * Filters applied to every chart on the dashboard. Each filter is
   * merged into each chart's `spec.filters` at render time, so charts
   * stay queryable in isolation when viewed outside a dashboard.
   */
  globalFilters: Filter[];
  charts: DashboardChart[];
}
