import { useMemo } from "react";
import { Chart } from "../charts/Chart";
import { previewExecute } from "../builder/preview";
import { SAMPLE_ROWS } from "../builder/sample-schema";
import type { Filter } from "../builder/types";
import { Card, CardHeader } from "../ui/Card";
import type { Dashboard, DashboardChart } from "./types";

interface Props {
  dashboard: Dashboard;
}

export function DashboardView({ dashboard }: Props) {
  const groupedByRow = useMemo(() => {
    const map = new Map<number, DashboardChart[]>();
    for (const c of dashboard.charts) {
      if (!map.has(c.grid.row)) map.set(c.grid.row, []);
      map.get(c.grid.row)!.push(c);
    }
    // Sort each row by column.
    for (const row of map.values()) {
      row.sort((a, b) => a.grid.col - b.grid.col);
    }
    return [...map.entries()].sort(([a], [b]) => a - b);
  }, [dashboard]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-5)",
      }}
    >
      {groupedByRow.map(([rowIdx, charts]) => (
        <div
          key={rowIdx}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
            gap: "var(--space-5)",
          }}
        >
          {charts.map((chart) => (
            <DashboardChartCard
              key={chart.id}
              chart={chart}
              globalFilters={dashboard.globalFilters}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function DashboardChartCard({
  chart,
  globalFilters,
}: {
  chart: DashboardChart;
  globalFilters: Filter[];
}) {
  const data = useMemo(() => {
    // Merge global filters into the chart's spec — global wins on conflict.
    const mergedSpec = {
      ...chart.spec,
      filters: [...chart.spec.filters, ...globalFilters],
    };
    const sourceKey = `${chart.spec.from.schema}.${chart.spec.from.table}`;
    const rows = SAMPLE_ROWS[sourceKey] ?? [];
    return previewExecute(mergedSpec, rows);
  }, [chart, globalFilters]);

  return (
    <div
      style={{
        gridColumn: `span ${chart.grid.w}`,
      }}
    >
      <Card testId={`dashboard-chart-${chart.id}`}>
        <CardHeader title={chart.title} />
        <Chart config={chart.config} data={{ rows: data }} />
      </Card>
    </div>
  );
}
