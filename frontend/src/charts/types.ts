/**
 * P1-08 — Chart configuration types.
 *
 * The visual builder (P1-05) and SQL editor (P1-06) emit one of these
 * configs alongside a `ChartData` shape (rows from the query result).
 * The Chart component switches on `type` and renders.
 *
 * Frontend-only types — the API surface (P3-04 SDK publish) will mirror
 * these shapes so embed customers can pass them too.
 */

export type ChartType =
  | "line"
  | "bar"
  | "pie"
  | "scatter"
  | "big_number"
  | "table";

export interface ChartData {
  /** One row per data point; column names match QueryResult shape. */
  rows: Array<Record<string, unknown>>;
}

interface BaseConfig {
  type: ChartType;
  /** Optional title rendered above the chart. */
  title?: string;
}

export interface LineConfig extends BaseConfig {
  type: "line";
  xAxis: string;
  /** One yAxis column = single series; multiple = multi-series. */
  yAxes: string[];
  /** Render area below the line — gives a stacked-area look. */
  area?: boolean;
}

export interface BarConfig extends BaseConfig {
  type: "bar";
  xAxis: string;
  yAxes: string[];
  orientation?: "vertical" | "horizontal";
}

export interface PieConfig extends BaseConfig {
  type: "pie";
  category: string;
  value: string;
  /** "donut" renders an inner radius. */
  variant?: "pie" | "donut";
}

export interface ScatterConfig extends BaseConfig {
  type: "scatter";
  xAxis: string;
  yAxis: string;
  /** Optional bubble-size column. */
  size?: string;
}

export interface BigNumberConfig extends BaseConfig {
  type: "big_number";
  /** Column whose first-row value is displayed. */
  value: string;
  /** Optional secondary column rendered as a delta below. */
  delta?: string;
  format?: "number" | "currency" | "percent";
  prefix?: string;
  suffix?: string;
  /** Locale-specific number formatting. Default "en-US". */
  locale?: string;
  /** ISO currency code when format='currency'. Default "USD". */
  currency?: string;
}

export interface TableConfig extends BaseConfig {
  type: "table";
  /** Column subset; default = every key in the first row. */
  columns?: string[];
}

export type ChartConfig =
  | LineConfig
  | BarConfig
  | PieConfig
  | ScatterConfig
  | BigNumberConfig
  | TableConfig;
