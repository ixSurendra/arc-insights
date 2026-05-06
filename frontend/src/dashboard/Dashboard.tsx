import { useMemo } from "react";
import { Chart } from "../charts/Chart";
import { ChartCard } from "../charts/ChartCard";
import { RichBigNumber } from "../charts/RichBigNumber";
import { previewExecute } from "../builder/preview";
import { SAMPLE_ROWS } from "../builder/sample-schema";
import type { Filter } from "../builder/types";
import { SAMPLE_META, type SampleChartMeta } from "./sample-dashboard";
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
              meta={SAMPLE_META[chart.id]}
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
  meta,
}: {
  chart: DashboardChart;
  globalFilters: Filter[];
  meta?: SampleChartMeta;
}) {
  const data = useMemo(() => {
    const mergedSpec = {
      ...chart.spec,
      filters: [...chart.spec.filters, ...globalFilters],
    };
    const sourceKey = `${chart.spec.from.schema}.${chart.spec.from.table}`;
    const rows = SAMPLE_ROWS[sourceKey] ?? [];
    return previewExecute(mergedSpec, rows);
  }, [chart, globalFilters]);

  const metaLine = meta
    ? [
        `Refreshed ${meta.refreshedSecondsAgo}s ago`,
        meta.source,
        meta.cacheHit ? "cache hit" : "cache miss",
      ].join(" · ")
    : undefined;

  // The dashboard's headline big-number gets the rich variant — eyebrow,
  // delta pill, sparkline, sub-stats. Other charts use the standard Chart
  // dispatch via ChartCard.
  const isRichBigNumber = chart.id === "total-revenue";

  return (
    <div style={{ gridColumn: `span ${chart.grid.w}` }}>
      <ChartCard
        testId={`dashboard-chart-${chart.id}`}
        eyebrow={isRichBigNumber ? undefined : meta?.eyebrow}
        title={isRichBigNumber ? "Total revenue" : chart.title}
        cost={meta?.cost}
        meta={metaLine}
        onMenu={() => {
          /* placeholder for context menu — P1-10 */
        }}
      >
        {isRichBigNumber ? (
          <RichBigNumber
            eyebrow={meta?.eyebrow}
            label="Total revenue"
            value="$405k"
            delta="+14.2%"
            deltaDirection="up"
            deltaSuffix="vs prior period"
            sparkline={[120, 135, 148, 162, 178, 195, 215, 240]}
            subStats={[
              { label: "Avg / month", value: "$67.5k" },
              { label: "Best month", value: "$84.2k" },
              { label: "Forecast Q3", value: "$1.42M" },
            ]}
          />
        ) : (
          <Chart config={chart.config} data={{ rows: data }} />
        )}
      </ChartCard>
    </div>
  );
}
