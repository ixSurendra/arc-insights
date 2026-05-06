/**
 * Dashboards — top-level list page. Shows recent + pinned dashboards
 * with the same enhanced cards as the Home page. Phase 1 skeleton uses
 * mock data; real persistence + folder filtering land later in Phase 1.
 */
import { Plus, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Chart } from "../charts/Chart";
import type { ChartConfig } from "../charts/types";
import { PageHeader } from "../layout/AppShell";
import { Button } from "../ui/Button";

const DASHBOARDS = [
  {
    id: "sales-overview",
    title: "Sales overview",
    folder: "Finance",
    owner: "Aman M.",
    updated: "12s ago",
    accent: "var(--color-primary)",
    metric: "$405k",
    metricLabel: "Q2 to date",
    spark: [120, 135, 148, 162, 178, 195, 215, 240],
  },
  {
    id: "growth-funnel",
    title: "Growth funnel · self-serve",
    folder: "Growth",
    owner: "Priya S.",
    updated: "4m ago",
    accent: "var(--color-accent)",
    metric: "2,148",
    metricLabel: "Activations",
    spark: [90, 88, 102, 110, 118, 130, 142, 158],
  },
  {
    id: "infra-health",
    title: "Infra · p99 latency",
    folder: "Engineering",
    owner: "Ravi K.",
    updated: "1h ago",
    accent: "var(--color-cell-chart)",
    metric: "838ms",
    metricLabel: "p99 (5m)",
    spark: [820, 815, 838, 842, 836, 830, 822, 818],
  },
  {
    id: "tenant-usage",
    title: "Tenant usage rollup",
    folder: "Embed",
    owner: "Aman M.",
    updated: "3h ago",
    accent: "var(--color-success)",
    metric: "84%",
    metricLabel: "Capacity used",
    spark: [40, 55, 60, 75, 78, 82, 90, 96],
  },
];

const sparkConfig: ChartConfig = {
  type: "line",
  xAxis: "i",
  yAxes: ["v"],
  area: true,
};

export function DashboardsPage() {
  return (
    <div style={{ padding: "var(--space-5) var(--space-6)" }}>
      <PageHeader
        breadcrumb="Workspace · Acme · Dashboards"
        title="Dashboards"
        description="All dashboards in this workspace. Click a card to open the responsive grid view; click + New to compose from scratch, a template, or AI."
        actions={
          <Link to="/dashboards/new" style={{ textDecoration: "none" }}>
            <Button variant="primary" iconLeft={<Plus size={14} />}>
              New dashboard
            </Button>
          </Link>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        {DASHBOARDS.map((d) => (
          <Link
            key={d.id}
            to={`/dashboards/${d.id}`}
            className="arc-card-lift"
            style={{
              background: "var(--color-bg-elev)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-4)",
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: "0 0 auto 0",
                height: 2,
                background: `linear-gradient(90deg, ${d.accent}, transparent 70%)`,
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: d.accent,
                  padding: "2px 6px",
                  borderRadius: "var(--radius-sm)",
                  background: `${d.accent}1a`,
                }}
              >
                {d.folder}
              </span>
              <Star size={12} fill={d.accent} stroke={d.accent} />
            </div>
            <div
              style={{
                fontSize: "var(--text-md)",
                fontWeight: 600,
                color: "var(--color-fg)",
                lineHeight: "var(--leading-tight)",
              }}
            >
              {d.title}
            </div>
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--color-fg-subtle)",
                }}
              >
                {d.metricLabel}
              </div>
              <div
                style={{
                  fontSize: "var(--text-xl)",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "var(--color-fg)",
                  fontFamily: "var(--font-mono)",
                  lineHeight: 1,
                }}
              >
                {d.metric}
              </div>
            </div>
            <div style={{ height: 60 }}>
              <Chart
                config={sparkConfig}
                data={{ rows: d.spark.map((v, i) => ({ i, v })) }}
                height={60}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 11,
                color: "var(--color-fg-subtle)",
                paddingTop: "var(--space-2)",
                borderTop: "1px solid var(--color-border)",
              }}
            >
              <span>{d.owner}</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>
                {d.updated}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
