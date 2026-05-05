import { useEffect, useState } from "react";
import { createArcInsights } from "@arc-insights/sdk";
import { Chart } from "./charts/Chart";
import { type ChartConfig, type ChartData } from "./charts/types";

const client = createArcInsights();
type Health = NonNullable<
  Awaited<ReturnType<typeof client.health.get>>["data"]
>;

// ─── Sample data shared across the demo charts ────────────────────────
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
  title: "Revenue by month (EU vs US)",
};

const barConfig: ChartConfig = {
  type: "bar",
  xAxis: "region",
  yAxes: ["revenue"],
  title: "Revenue by region",
};

const pieConfig: ChartConfig = {
  type: "pie",
  category: "region",
  value: "revenue",
  variant: "donut",
  title: "Revenue share",
};

const scatterConfig: ChartConfig = {
  type: "scatter",
  xAxis: "ad_spend",
  yAxis: "conversions",
  size: "campaigns",
  title: "Ad spend → conversions",
};

const bigNumberConfig: ChartConfig = {
  type: "big_number",
  value: "revenue",
  format: "currency",
  currency: "USD",
  title: "US revenue (this month)",
};

const tableConfig: ChartConfig = {
  type: "table",
  title: "Region rollup",
};

export default function App() {
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
    <main
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        maxWidth: 1080,
        margin: "4rem auto",
        padding: "0 1.5rem",
        color: "#1F3A5F",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
        Arc <span style={{ color: "#F4B860" }}>Insights</span>
      </h1>
      <p style={{ color: "#555", fontSize: "1.05rem" }}>
        Open-source BI and embedded analytics. Phase 1 — Core MVP.
      </p>

      <section
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          background: "#F4F7FB",
          borderRadius: 8,
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>
          Backend health (via Eden Treaty SDK)
        </h2>
        {error && <pre style={{ color: "#9C2D0F" }}>Error: {error}</pre>}
        {health && (
          <pre
            style={{
              background: "white",
              padding: "1rem",
              borderRadius: 4,
              fontSize: "0.9rem",
            }}
          >
            {JSON.stringify(health, null, 2)}
          </pre>
        )}
        {!health && !error && <p style={{ color: "#777" }}>Loading…</p>}
      </section>

      <section style={{ marginTop: "3rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
          Chart demo (P1-08)
        </h2>
        <p
          style={{
            color: "#666",
            fontSize: "0.9rem",
            marginBottom: "1.5rem",
          }}
        >
          Six chart types rendered from sample data. Each accepts a{" "}
          <code>ChartConfig</code> + <code>ChartData</code> — the same contract
          the visual builder will emit.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.25rem",
          }}
        >
          <div data-testid="chart-card" style={cardStyle}>
            <Chart
              config={lineConfig}
              data={monthlySeries}
              testId="chart-line"
            />
          </div>
          <div data-testid="chart-card" style={cardStyle}>
            <Chart config={barConfig} data={regionTotals} testId="chart-bar" />
          </div>
          <div data-testid="chart-card" style={cardStyle}>
            <Chart config={pieConfig} data={regionTotals} testId="chart-pie" />
          </div>
          <div data-testid="chart-card" style={cardStyle}>
            <Chart
              config={scatterConfig}
              data={conversionPoints}
              testId="chart-scatter"
            />
          </div>
          <div data-testid="chart-card" style={cardStyle}>
            <Chart
              config={bigNumberConfig}
              data={{ rows: [{ revenue: 30000 }] }}
              testId="chart-big-number"
            />
          </div>
          <div data-testid="chart-card" style={cardStyle}>
            <Chart config={tableConfig} data={tableRows} testId="chart-table" />
          </div>
        </div>
      </section>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  background: "white",
  padding: "1rem",
  borderRadius: 8,
  border: "1px solid #E5E9F0",
  minHeight: 320,
};
