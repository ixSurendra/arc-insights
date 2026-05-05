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
} from "./types";

type EChartsOption = Record<string, unknown>;

function asNumber(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
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
    ...(config.area ? { areaStyle: {} } : {}),
    smooth: true,
  }));
  return {
    title: config.title ? { text: config.title, left: "center" } : undefined,
    tooltip: { trigger: "axis" },
    legend: config.yAxes.length > 1 ? { top: "bottom" } : undefined,
    grid: { left: 48, right: 16, top: config.title ? 48 : 16, bottom: 56 },
    xAxis: { type: "category", data: categories },
    yAxis: { type: "value" },
    series,
  };
}

export function toBarOption(config: BarConfig, data: ChartData): EChartsOption {
  const horizontal = config.orientation === "horizontal";
  const categories = data.rows.map((r) => r[config.xAxis] as string | number);
  const series = config.yAxes.map((col) => ({
    name: col,
    type: "bar",
    data: data.rows.map((r) => asNumber(r[col])),
  }));
  const categoryAxis = { type: "category" as const, data: categories };
  const valueAxis = { type: "value" as const };
  return {
    title: config.title ? { text: config.title, left: "center" } : undefined,
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: config.yAxes.length > 1 ? { top: "bottom" } : undefined,
    grid: { left: 64, right: 16, top: config.title ? 48 : 16, bottom: 56 },
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
