import { useEffect, useState } from "react";
import { createArcInsights } from "@arc-insights/sdk";
import { Activity, BarChart3, Plus } from "lucide-react";
import { Chart } from "../charts/Chart";
import type { ChartConfig, ChartData } from "../charts/types";
import { PageHeader } from "../layout/AppShell";
import { Button } from "../ui/Button";
import { Card, CardHeader } from "../ui/Card";
import { Empty } from "../ui/Empty";

const client = createArcInsights();
type Health = NonNullable<
  Awaited<ReturnType<typeof client.health.get>>["data"]
>;

const monthlySeries: ChartData = {
  rows: [
    { month: "2026-01", eu: 12000, us: 18000 },
    { month: "2026-02", eu: 15000, us: 22000 },
    { month: "2026-03", eu: 17500, us: 24000 },
    { month: "2026-04", eu: 16000, us: 27000 },
    { month: "2026-05", eu: 21000, us: 30000 },
  ],
};
const regionTotals: ChartData = {
  rows: [
    { region: "EU", revenue: 81500 },
    { region: "US", revenue: 121000 },
    { region: "APAC", revenue: 47000 },
  ],
};
const conversionPoints: ChartData = {
  rows: [
    { ad_spend: 1000, conversions: 80, campaigns: 12 },
    { ad_spend: 2500, conversions: 210, campaigns: 18 },
    { ad_spend: 4000, conversions: 290, campaigns: 22 },
    { ad_spend: 6500, conversions: 480, campaigns: 30 },
    { ad_spend: 9000, conversions: 610, campaigns: 35 },
  ],
};
const tableRows: ChartData = {
  rows: [
    { region: "EU", revenue: 81500, dau: 1240, churn: 0.024 },
    { region: "US", revenue: 121000, dau: 2100, churn: 0.018 },
    { region: "APAC", revenue: 47000, dau: 720, churn: 0.031 },
  ],
};

const lineConfig: ChartConfig = {
  type: "line",
  xAxis: "month",
  yAxes: ["eu", "us"],
  area: true,
};
const barConfig: ChartConfig = {
  type: "bar",
  xAxis: "region",
  yAxes: ["revenue"],
};
const pieConfig: ChartConfig = {
  type: "pie",
  category: "region",
  value: "revenue",
  variant: "donut",
};
const scatterConfig: ChartConfig = {
  type: "scatter",
  xAxis: "ad_spend",
  yAxis: "conversions",
  size: "campaigns",
};
const bigNumberConfig: ChartConfig = {
  type: "big_number",
  value: "revenue",
  format: "currency",
  currency: "USD",
};
const tableConfig: ChartConfig = { type: "table" };

export function OverviewPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void client.health
      .get()
      .then(({ data, error }) => {
        if (error)
          setError(error.value ? String(error.value) : "request failed");
        else if (data) setHealth(data);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "request failed");
      });
  }, []);

  return (
    <>
      <PageHeader
        breadcrumb="Workspace · Acme"
        title="Overview"
        description="Six chart primitives rendered from sample data — the same Chart component the visual builder emits."
        actions={
          <>
            <Button variant="secondary" iconLeft={<Activity size={14} />}>
              Activity
            </Button>
            <Button variant="primary" iconLeft={<Plus size={14} />}>
              New dashboard
            </Button>
          </>
        }
      />

      <Card style={{ marginBottom: "var(--space-6)" }}>
        <CardHeader
          title="Backend health"
          subtitle="Live response from /health via the typed Eden Treaty SDK"
        />
        {error && (
          <Empty
            icon={<BarChart3 size={28} />}
            title="Couldn't reach the API"
            description={error}
          />
        )}
        {health && (
          <pre
            style={{
              background: "var(--color-bg-subtle)",
              border: "1px solid var(--color-border)",
              padding: "var(--space-3) var(--space-4)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-sm)",
              color: "var(--color-fg)",
              margin: 0,
              overflowX: "auto",
            }}
          >
            {JSON.stringify(health, null, 2)}
          </pre>
        )}
        {!health && !error && (
          <p style={{ color: "var(--color-fg-muted)", margin: 0 }}>Loading…</p>
        )}
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "var(--space-5)",
        }}
      >
        <ChartCard title="Revenue by month" subtitle="EU vs US — last 5 months">
          <Chart config={lineConfig} data={monthlySeries} testId="chart-line" />
        </ChartCard>
        <ChartCard title="Revenue by region" subtitle="Cumulative">
          <Chart config={barConfig} data={regionTotals} testId="chart-bar" />
        </ChartCard>
        <ChartCard title="Revenue share" subtitle="By region">
          <Chart config={pieConfig} data={regionTotals} testId="chart-pie" />
        </ChartCard>
        <ChartCard
          title="Ad spend → conversions"
          subtitle="Bubble size = campaigns active"
        >
          <Chart
            config={scatterConfig}
            data={conversionPoints}
            testId="chart-scatter"
          />
        </ChartCard>
        <ChartCard title="US revenue" subtitle="This month">
          <Chart
            config={bigNumberConfig}
            data={{ rows: [{ revenue: 30000 }] }}
            testId="chart-big-number"
          />
        </ChartCard>
        <ChartCard title="Region rollup" subtitle="DAU + churn">
          <Chart config={tableConfig} data={tableRows} testId="chart-table" />
        </ChartCard>
      </div>
    </>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card testId="chart-card">
      <CardHeader title={title} subtitle={subtitle} />
      {children}
    </Card>
  );
}
