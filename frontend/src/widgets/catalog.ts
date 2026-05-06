/**
 * Widget catalog — Phase 1.
 *
 * 18 chart types + 3 containers, exposed as separate tiles in the picker
 * (variants like horizontal vs vertical, stacked vs grouped, pie vs donut
 * are their own tiles, not toggles inside one tile).
 *
 * Adding a Phase 2 type later is just appending an entry — the picker,
 * library, and chart-type compatibility matrix all read from this list.
 */

export type WidgetCategory =
  | "kpi"
  | "trend"
  | "comparison"
  | "parts"
  | "relationship"
  | "geographic"
  | "tabular"
  | "container";

export interface WidgetType {
  /** Stable id used in saved widget records and the URL. */
  id: string;
  /** Human label shown in the picker tile and right-panel selector. */
  label: string;
  /** Short description used in the picker tooltip. */
  description: string;
  category: WidgetCategory;
  /** Required data shape, used by the chart-suggestion engine. */
  dataShape: {
    /** Number of measure (numeric) columns. */
    measures?: { min: number; max?: number };
    /** Number of dimension (categorical) columns. */
    dimensions?: { min: number; max?: number };
    /** Whether the X axis must be a date / datetime column. */
    timeAxis?: boolean;
    /** Whether the data must be geographic (region / country / state). */
    geographic?: boolean;
    /** Whether the chart needs at least 2 measures to draw correlation. */
    pairedMeasures?: boolean;
  };
  /** Phase 1 supported (true) vs Phase 2+ placeholder (false, hidden in picker). */
  enabled: boolean;
}

export const WIDGET_CATALOG: readonly WidgetType[] = [
  // ─── KPI / single value (4) ─────────────────────────────────────
  {
    id: "big-number",
    label: "Big number",
    description: "One headline metric, displayed large.",
    category: "kpi",
    dataShape: { measures: { min: 1, max: 1 } },
    enabled: true,
  },
  {
    id: "kpi-card",
    label: "KPI card",
    description:
      "Headline metric with delta vs comparison period and a sparkline.",
    category: "kpi",
    dataShape: { measures: { min: 1, max: 1 }, timeAxis: true },
    enabled: true,
  },
  {
    id: "gauge",
    label: "Gauge",
    description: "Value vs goal on a semicircular dial.",
    category: "kpi",
    dataShape: { measures: { min: 1, max: 1 } },
    enabled: true,
  },
  {
    id: "progress-bar",
    label: "Progress bar",
    description: "Value vs goal as a horizontal bar with thresholds.",
    category: "kpi",
    dataShape: { measures: { min: 1, max: 1 } },
    enabled: true,
  },

  // ─── Trend over time (4) ────────────────────────────────────────
  {
    id: "line",
    label: "Line chart",
    description: "Trend of one or more measures over time.",
    category: "trend",
    dataShape: { timeAxis: true, measures: { min: 1 } },
    enabled: true,
  },
  {
    id: "area",
    label: "Area chart",
    description: "Line chart with the area below the line filled.",
    category: "trend",
    dataShape: { timeAxis: true, measures: { min: 1 } },
    enabled: true,
  },
  {
    id: "stacked-area",
    label: "Stacked area",
    description: "Multiple measures stacked on a time axis.",
    category: "trend",
    dataShape: { timeAxis: true, measures: { min: 2 } },
    enabled: true,
  },
  {
    id: "column",
    label: "Column chart",
    description: "Vertical bars on a time axis.",
    category: "trend",
    dataShape: { timeAxis: true, measures: { min: 1 } },
    enabled: true,
  },

  // ─── Categorical comparison (3) ─────────────────────────────────
  {
    id: "bar",
    label: "Bar (horizontal)",
    description: "Horizontal bars across categories.",
    category: "comparison",
    dataShape: { dimensions: { min: 1, max: 1 }, measures: { min: 1, max: 1 } },
    enabled: true,
  },
  {
    id: "stacked-bar",
    label: "Stacked bar",
    description: "Categories stacked into a single bar each.",
    category: "comparison",
    dataShape: { dimensions: { min: 1, max: 2 }, measures: { min: 1 } },
    enabled: true,
  },
  {
    id: "grouped-bar",
    label: "Grouped bar",
    description: "Categories with sub-categories shown side-by-side.",
    category: "comparison",
    dataShape: { dimensions: { min: 2, max: 2 }, measures: { min: 1, max: 1 } },
    enabled: true,
  },

  // ─── Parts of whole (2) ─────────────────────────────────────────
  {
    id: "pie",
    label: "Pie",
    description: "Slices summing to 100%.",
    category: "parts",
    dataShape: { dimensions: { min: 1, max: 1 }, measures: { min: 1, max: 1 } },
    enabled: true,
  },
  {
    id: "donut",
    label: "Donut",
    description: "Pie with a hollow center for a centered total.",
    category: "parts",
    dataShape: { dimensions: { min: 1, max: 1 }, measures: { min: 1, max: 1 } },
    enabled: true,
  },

  // ─── Relationship (2) ───────────────────────────────────────────
  {
    id: "scatter",
    label: "Scatter",
    description: "Two measures correlated across rows.",
    category: "relationship",
    dataShape: { measures: { min: 2, max: 3 }, pairedMeasures: true },
    enabled: true,
  },
  {
    id: "heatmap",
    label: "Heatmap",
    description: "Two categorical axes, color intensity = measure.",
    category: "relationship",
    dataShape: { dimensions: { min: 2, max: 2 }, measures: { min: 1, max: 1 } },
    enabled: true,
  },

  // ─── Geographic (1) ─────────────────────────────────────────────
  {
    id: "choropleth",
    label: "Choropleth map",
    description: "Geographic regions colored by measure.",
    category: "geographic",
    dataShape: { geographic: true, measures: { min: 1, max: 1 } },
    enabled: true,
  },

  // ─── Tabular (2) ────────────────────────────────────────────────
  {
    id: "table",
    label: "Table",
    description: "Sortable, filterable, paginated rows.",
    category: "tabular",
    dataShape: {},
    enabled: true,
  },
  {
    id: "pivot",
    label: "Pivot table",
    description: "Group rows and columns with measure aggregation in cells.",
    category: "tabular",
    dataShape: { dimensions: { min: 2 }, measures: { min: 1 } },
    enabled: true,
  },

  // ─── Containers (3) ─────────────────────────────────────────────
  {
    id: "markdown",
    label: "Markdown",
    description: "Rich text — headings, paragraphs, lists, links, callouts.",
    category: "container",
    dataShape: {},
    enabled: true,
  },
  {
    id: "image",
    label: "Image",
    description: "Static image — logos, diagrams, screenshots.",
    category: "container",
    dataShape: {},
    enabled: true,
  },
  {
    id: "divider",
    label: "Divider",
    description: "Horizontal rule for grouping widgets visually.",
    category: "container",
    dataShape: {},
    enabled: true,
  },
];

export const WIDGET_BY_ID: Record<string, WidgetType> = Object.fromEntries(
  WIDGET_CATALOG.map((w) => [w.id, w]),
);

export const CATEGORY_LABEL: Record<WidgetCategory, string> = {
  kpi: "KPI / single value",
  trend: "Trend over time",
  comparison: "Categorical comparison",
  parts: "Parts of whole",
  relationship: "Relationship",
  geographic: "Geographic",
  tabular: "Tabular",
  container: "Containers",
};

export const CATEGORY_ORDER: readonly WidgetCategory[] = [
  "kpi",
  "trend",
  "comparison",
  "parts",
  "relationship",
  "geographic",
  "tabular",
  "container",
];

export function widgetsByCategory(): Record<WidgetCategory, WidgetType[]> {
  const out = {} as Record<WidgetCategory, WidgetType[]>;
  for (const cat of CATEGORY_ORDER) out[cat] = [];
  for (const w of WIDGET_CATALOG) out[w.category].push(w);
  return out;
}
