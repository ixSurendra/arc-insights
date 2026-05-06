import { useEffect, useMemo, useState } from "react";
import { Chart } from "../charts/Chart";
import type { ChartConfig, ChartType } from "../charts/types";
import { Card, CardHeader } from "../ui/Card";
import { previewExecute, previewSql } from "./preview";
import type { QuerySpec } from "./types";

interface Props {
  spec: QuerySpec;
  rows: Array<Record<string, unknown>>;
  /** Notifies the parent (Builder right panel) of the active chart type. */
  onChartTypeChange?: (chartType: string) => void;
}

const TYPES: Array<{ value: ChartType; label: string }> = [
  { value: "table", label: "Table" },
  { value: "bar", label: "Bar" },
  { value: "line", label: "Line" },
  { value: "pie", label: "Pie" },
  { value: "big_number", label: "Big number" },
];

export function BuilderPreview({ spec, rows, onChartTypeChange }: Props) {
  const [chartType, setChartType] = useState<ChartType>("table");
  useEffect(() => {
    onChartTypeChange?.(chartType);
  }, [chartType, onChartTypeChange]);
  const result = useMemo(() => previewExecute(spec, rows), [spec, rows]);
  const sql = useMemo(() => previewSql(spec), [spec]);
  const config = useMemo(
    () => buildChartConfig(chartType, spec, result),
    [chartType, spec, result],
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-5)",
      }}
    >
      <Card>
        <CardHeader
          title="Preview"
          subtitle={`${result.length} row${result.length === 1 ? "" : "s"} · sample dataset`}
          actions={
            <div
              role="tablist"
              aria-label="Chart type"
              style={{
                display: "flex",
                gap: 2,
                background: "var(--color-bg-subtle)",
                padding: 2,
                borderRadius: "var(--radius-md)",
              }}
            >
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  role="tab"
                  aria-selected={chartType === t.value}
                  onClick={() => setChartType(t.value)}
                  style={{
                    border: "none",
                    background:
                      chartType === t.value ? "var(--color-bg)" : "transparent",
                    color:
                      chartType === t.value
                        ? "var(--color-fg)"
                        : "var(--color-fg-muted)",
                    padding: "4px 10px",
                    fontSize: "var(--text-xs)",
                    fontWeight: 500,
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    boxShadow:
                      chartType === t.value ? "var(--shadow-sm)" : "none",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          }
        />
        {result.length === 0 ? (
          <div
            style={{
              padding: "var(--space-10)",
              textAlign: "center",
              color: "var(--color-fg-muted)",
              fontSize: "var(--text-sm)",
            }}
          >
            No rows match the current filters.
          </div>
        ) : config ? (
          <Chart
            config={config}
            data={{ rows: result }}
            testId="builder-preview"
          />
        ) : (
          <div
            style={{
              padding: "var(--space-10)",
              textAlign: "center",
              color: "var(--color-fg-muted)",
              fontSize: "var(--text-sm)",
            }}
          >
            Configure dimensions / measures to populate this chart type.
          </div>
        )}
      </Card>

      <Card padded={false}>
        <div style={{ padding: "var(--space-4) var(--space-5) 0" }}>
          <CardHeader
            title="Generated SQL"
            subtitle="What the compiler will emit (postgres dialect, values inlined for preview only)"
          />
        </div>
        <pre
          style={{
            margin: 0,
            padding: "var(--space-4) var(--space-5)",
            background: "var(--color-bg-subtle)",
            borderTop: "1px solid var(--color-border)",
            borderBottomLeftRadius: "var(--radius-lg)",
            borderBottomRightRadius: "var(--radius-lg)",
            fontSize: "var(--text-sm)",
            fontFamily: "var(--font-mono)",
            whiteSpace: "pre-wrap",
            color: "var(--color-fg)",
            overflowX: "auto",
          }}
          data-testid="generated-sql"
        >
          {sql}
        </pre>
      </Card>
    </div>
  );
}

function buildChartConfig(
  type: ChartType,
  spec: QuerySpec,
  result: Array<Record<string, unknown>>,
): ChartConfig | null {
  if (result.length === 0 && type !== "table") return null;
  const first = result[0] ?? {};
  const dimAliases = spec.dimensions.map(
    (d) =>
      d.alias ?? (d.granularity ? `${d.column}_${d.granularity}` : d.column),
  );
  const measureAliases = spec.measures.map(
    (m) =>
      m.alias ??
      (m.column === "*" && m.agg === "count"
        ? "count"
        : `${m.column}_${m.agg}`),
  );

  switch (type) {
    case "table":
      return { type: "table" };
    case "big_number":
      if (measureAliases.length === 0) return null;
      return {
        type: "big_number",
        value: measureAliases[0]!,
        format: "number",
      };
    case "pie":
      if (dimAliases.length === 0 || measureAliases.length === 0) return null;
      return {
        type: "pie",
        category: dimAliases[0]!,
        value: measureAliases[0]!,
        variant: "donut",
      };
    case "bar":
    case "line": {
      if (dimAliases.length === 0 || measureAliases.length === 0) return null;
      const xAxis = dimAliases[0]!;
      // Use every column from the result that isn't the xAxis as a y series.
      const yAxes = Object.keys(first).filter((k) => k !== xAxis);
      if (yAxes.length === 0) return null;
      return type === "bar"
        ? { type: "bar", xAxis, yAxes }
        : { type: "line", xAxis, yAxes, area: true };
    }
    default:
      return null;
  }
}
