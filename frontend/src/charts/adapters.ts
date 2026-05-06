/**
 * Pure adapter functions: ChartConfig + ChartData → renderable shapes
 * for ECharts / AG Grid / BigNumber. Pure so the unit tests can assert
 * exact output structure without mounting React.
 */
import {
  type BarConfig,
  type BigNumberConfig,
  type ChartData,
  type LineConfig,
  type PieConfig,
  type ScatterConfig,
  type TableConfig,
  type ValueFormat,
} from "./types";

type EChartsOption = Record<string, unknown>;

function asNumber(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function compactNumber(v: number, currency?: string): string {
  const abs = Math.abs(v);
  const prefix = currency === "USD" || !currency ? "$" : "";
  let body: string;
  if (abs >= 1_000_000)
    body = `${(v / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  else if (abs >= 1_000) body = `${Math.round(v / 1_000)}k`;
  else body = `${Math.round(v)}`;
  return `${prefix}${body}`;
}

function valueAxisFormatter(format?: ValueFormat, currency?: string) {
  if (!format) return undefined;
  switch (format) {
    case "currency":
      return (v: number) => compactNumber(v, currency ?? "USD");
    case "percent":
      return (v: number) => `${(v * 100).toFixed(1)}%`;
    case "number":
    default:
      return (v: number) =>
        Math.abs(v) >= 1_000 ? compactNumber(v).replace("$", "") : `${v}`;
  }
}

export function toLineOption(
  config: LineConfig,
  data: ChartData,
): EChartsOption {
  const categories = data.rows.map((r) => r[config.xAxis] as string | number);
  const series = config.yAxes.map((col) => ({
    name: col,
    type: "line",
    data: data.rows.map((r) => asNumber(r[col])),
    showSymbol: true,
    symbol: "circle",
    symbolSize: 6,
    ...(config.area ? { areaStyle: { opacity: 0.18 } } : {}),
    smooth: true,
  }));
  const fmt = valueAxisFormatter(config.valueFormat, config.currency);
  return {
    title: config.title ? { text: config.title, left: "center" } : undefined,
    tooltip: { trigger: "axis" },
    legend: config.yAxes.length > 1 ? { top: "bottom" } : undefined,
    grid: { left: 56, right: 16, top: config.title ? 48 : 16, bottom: 56 },
    xAxis: { type: "category", data: categories, boundaryGap: false },
    yAxis: {
      type: "value",
      axisLabel: fmt ? { formatter: fmt } : undefined,
      splitLine: { lineStyle: { opacity: 0.5 } },
    },
    series,
  };
}

export function toBarOption(config: BarConfig, data: ChartData): EChartsOption {
  const horizontal = config.orientation === "horizontal";
  const categories = data.rows.map((r) => r[config.xAxis] as string | number);
  const fmt = valueAxisFormatter(config.valueFormat, config.currency);
  const series = config.yAxes.map((col) => ({
    name: col,
    type: "bar",
    data: data.rows.map((r) => asNumber(r[col])),
    ...(config.showValueLabels && fmt
      ? {
          label: {
            show: true,
            position: horizontal ? "right" : "top",
            formatter: ({ value }: { value: number | null }) =>
              value === null || value === undefined ? "" : fmt(Number(value)),
          },
        }
      : {}),
  }));
  const categoryAxis = { type: "category" as const, data: categories };
  const valueAxis = {
    type: "value" as const,
    axisLabel: fmt ? { formatter: fmt } : undefined,
    splitLine: { lineStyle: { opacity: 0.5 } },
  };
  return {
    title: config.title ? { text: config.title, left: "center" } : undefined,
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: config.yAxes.length > 1 ? { top: "bottom" } : undefined,
    grid: { left: 96, right: 24, top: config.title ? 48 : 16, bottom: 40 },
    xAxis: horizontal ? valueAxis : categoryAxis,
    yAxis: horizontal ? categoryAxis : valueAxis,
    series,
  };
}

export function toPieOption(config: PieConfig, data: ChartData): EChartsOption {
  const seriesData = data.rows
    .map((r) => ({
      name: String(r[config.category] ?? ""),
      value: asNumber(r[config.value]) ?? 0,
    }))
    .filter((d) => d.name !== "");
  const radius = config.variant === "donut" ? ["40%", "70%"] : "70%";
  return {
    title: config.title ? { text: config.title, left: "center" } : undefined,
    tooltip: { trigger: "item" },
    legend: { top: "bottom" },
    series: [
      {
        type: "pie",
        radius,
        data: seriesData,
        label: { show: true, formatter: "{b}: {d}%" },
      },
    ],
  };
}

export function toScatterOption(
  config: ScatterConfig,
  data: ChartData,
): EChartsOption {
  const points = data.rows.map((r) => {
    const x = asNumber(r[config.xAxis]);
    const y = asNumber(r[config.yAxis]);
    const size = config.size ? asNumber(r[config.size]) : null;
    return size === null ? [x, y] : [x, y, size];
  });
  const seriesItem: Record<string, unknown> = {
    type: "scatter",
    data: points,
  };
  if (config.size) {
    seriesItem["symbolSize"] = (
      datum: Array<number | null> | undefined,
    ): number => {
      const raw = datum?.[2] ?? 10;
      const n = typeof raw === "number" ? raw : 10;
      return Math.max(6, Math.sqrt(n) * 4);
    };
  }
  return {
    title: config.title ? { text: config.title, left: "center" } : undefined,
    tooltip: { trigger: "item" },
    grid: { left: 48, right: 16, top: config.title ? 48 : 16, bottom: 48 },
    xAxis: { type: "value", name: config.xAxis },
    yAxis: { type: "value", name: config.yAxis },
    series: [seriesItem],
  };
}

export interface BigNumberView {
  display: string;
  delta?: string;
  raw: number | null;
}

export function toBigNumber(
  config: BigNumberConfig,
  data: ChartData,
): BigNumberView {
  const first = data.rows[0];
  const raw = first ? asNumber(first[config.value]) : null;
  const display = formatNumber(raw, config);
  const delta =
    config.delta && first
      ? formatNumber(asNumber(first[config.delta]), {
          ...config,
          format: config.format,
        })
      : undefined;
  return { display, delta, raw };
}

function formatNumber(value: number | null, config: BigNumberConfig): string {
  if (value === null) return "—";
  const locale = config.locale ?? "en-US";
  const prefix = config.prefix ?? "";
  const suffix = config.suffix ?? "";
  let body: string;
  switch (config.format) {
    case "currency":
      body = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: config.currency ?? "USD",
        maximumFractionDigits: 2,
      }).format(value);
      break;
    case "percent":
      body = new Intl.NumberFormat(locale, {
        style: "percent",
        maximumFractionDigits: 1,
      }).format(value);
      break;
    case "number":
    default:
      body = new Intl.NumberFormat(locale, {
        maximumFractionDigits: 2,
      }).format(value);
      break;
  }
  return `${prefix}${body}${suffix}`;
}

export interface AgGridColumn {
  field: string;
  headerName: string;
  sortable: boolean;
  filter: boolean;
  resizable: boolean;
}

export function toAgGridColumns(
  config: TableConfig,
  data: ChartData,
): AgGridColumn[] {
  const first = data.rows[0];
  const fields =
    config.columns && config.columns.length > 0
      ? config.columns
      : first
        ? Object.keys(first)
        : [];
  return fields.map((field) => ({
    field,
    headerName: field,
    sortable: true,
    filter: true,
    resizable: true,
  }));
}
