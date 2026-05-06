/**
 * Dashboard view — Phase 1 grid skeleton.
 *
 * Replaces the notebook canvas with the locked Metabase-style grid.
 * Header, filter bar, responsive grid of mock widgets, hybrid edit
 * affordance (per-widget pencil) — all in place. Real persistence,
 * drag-resize, and AI surfaces wire in with P1-09 / P1-31..P1-35.
 */
import {
  ArrowDown,
  Calendar,
  Filter,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Share2,
  Sparkles,
  Star,
} from "lucide-react";
import type { ReactNode } from "react";
import { Chart } from "../charts/Chart";
import type { ChartConfig } from "../charts/types";
import { PageHeader } from "../layout/AppShell";
import { Button } from "../ui/Button";
import { StatusBadge } from "../ui/StatusBadge";

interface DashboardWidget {
  id: string;
  title: string;
  type: "kpi" | "line" | "bar" | "donut" | "table";
  /** Grid span — { cols, rows } at desktop. Tablet halves cols, mobile = 1. */
  span: { cols: 1 | 2 | 3 | 4; rows: 1 | 2 };
  /** Mock data for rendering. */
  data?: Record<string, unknown>;
}

const FILTERS = [
  { label: "Last 90 days", icon: Calendar },
  { label: "All regions", icon: Filter },
  { label: "All segments", icon: Filter },
];

const WIDGETS: DashboardWidget[] = [
  {
    id: "kpi-revenue",
    title: "Revenue · Q2 to date",
    type: "kpi",
    span: { cols: 1, rows: 1 },
    data: {
      value: "$405k",
      delta: "+14.2%",
      dir: "up",
      spark: [120, 135, 148, 162, 178, 195, 215, 240],
    },
  },
  {
    id: "kpi-orders",
    title: "Orders · Q2 to date",
    type: "kpi",
    span: { cols: 1, rows: 1 },
    data: {
      value: "9,648",
      delta: "+8.4%",
      dir: "up",
      spark: [800, 812, 850, 880, 905, 920, 940, 968],
    },
  },
  {
    id: "kpi-aov",
    title: "Average order value",
    type: "kpi",
    span: { cols: 1, rows: 1 },
    data: {
      value: "$42.0",
      delta: "+1.3%",
      dir: "up",
      spark: [40, 41, 41, 42, 42, 41, 42, 42],
    },
  },
  {
    id: "kpi-customers",
    title: "Active customers",
    type: "kpi",
    span: { cols: 1, rows: 1 },
    data: {
      value: "2,841",
      delta: "−2.1%",
      dir: "down",
      spark: [2900, 2890, 2870, 2860, 2850, 2845, 2842, 2841],
    },
  },
  {
    id: "trend-revenue",
    title: "Revenue and orders over time",
    type: "line",
    span: { cols: 2, rows: 2 },
    data: {
      points: [
        { q: "Q1 24", rev: 123900, ord: 2100 },
        { q: "Q2 24", rev: 142400, ord: 8800 },
        { q: "Q3 24", rev: 141800, ord: 5400 },
        { q: "Q4 24", rev: 141900, ord: 9500 },
        { q: "Q1 25", rev: 130800, ord: 2700 },
        { q: "Q2 25", rev: 145000, ord: 9200 },
      ],
    },
  },
  {
    id: "donut-categories",
    title: "Total orders by product category",
    type: "donut",
    span: { cols: 2, rows: 2 },
    data: {
      slices: [
        { name: "Doohickey", value: 21 },
        { name: "Gadget", value: 27 },
        { name: "Gizmo", value: 25 },
        { name: "Widget", value: 27 },
      ],
    },
  },
  {
    id: "bar-categories",
    title: "Revenue by product category",
    type: "bar",
    span: { cols: 2, rows: 2 },
    data: {
      bars: [
        { cat: "Doohickey", value: 11800 },
        { cat: "Gadget", value: 12100 },
        { cat: "Gizmo", value: 12900 },
        { cat: "Widget", value: 14000 },
      ],
    },
  },
  {
    id: "table-events",
    title: "Events by quarter",
    type: "table",
    span: { cols: 2, rows: 2 },
    data: {
      rows: [
        { plan: "Basic", event: "Button Clicked", q1: 785, q2: 412 },
        { plan: "Basic", event: "Page Viewed", q1: 5006, q2: 2412 },
        { plan: "Business", event: "Button Clicked", q1: 4, q2: 6 },
        { plan: "Business", event: "Page Viewed", q1: 9, q2: 12 },
        { plan: "Premium", event: "Button Clicked", q1: 35, q2: 41 },
        { plan: "Premium", event: "Page Viewed", q1: 279, q2: 312 },
      ],
    },
  },
];

export function DashboardPage() {
  return (
    <div style={{ padding: "var(--space-5) var(--space-6)" }}>
      <PageHeader
        breadcrumb="Workspace · Acme · Dashboards"
        title="Sales overview"
        titleIcon={<Star size={18} fill="currentColor" stroke="currentColor" />}
        tag="Finance"
        status={<StatusBadge tone="live">Live · refreshed 12s ago</StatusBadge>}
        description="Q2 sales performance — revenue, orders, AOV, and category breakdown. Filters at the top apply to every widget."
        toolbar={
          <Button variant="ghost" iconLeft={<RefreshCw size={14} />} size="sm">
            Refresh
          </Button>
        }
        actions={
          <>
            <Button variant="ghost" iconLeft={<Sparkles size={14} />} size="sm">
              Ask a follow-up
            </Button>
            <Button variant="secondary" iconLeft={<Share2 size={14} />}>
              Share
            </Button>
            <Button variant="primary" iconLeft={<Pencil size={14} />}>
              Edit
            </Button>
            <Button variant="ghost" aria-label="More" size="sm">
              <MoreHorizontal size={14} />
            </Button>
          </>
        }
      />

      <FilterBar />

      <div
        data-testid="dashboard-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gridAutoRows: "minmax(140px, auto)",
          gap: "var(--space-4)",
        }}
      >
        {WIDGETS.map((w) => (
          <WidgetTile key={w.id} widget={w} />
        ))}
      </div>
    </div>
  );
}

function FilterBar() {
  return (
    <div
      role="toolbar"
      aria-label="Dashboard filters"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
        padding: "var(--space-3) var(--space-4)",
        background: "var(--color-bg-elev)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        marginBottom: "var(--space-4)",
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--color-fg-subtle)",
          marginRight: "var(--space-2)",
        }}
      >
        Filters
      </span>
      {FILTERS.map((f) => (
        <button
          key={f.label}
          type="button"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-sm)",
            color: "var(--color-fg)",
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          <f.icon size={12} />
          {f.label}
          <ArrowDown size={10} />
        </button>
      ))}
      <span
        style={{
          fontSize: 11,
          color: "var(--color-fg-subtle)",
          marginLeft: "auto",
        }}
      >
        3 active filters apply to all 8 widgets
      </span>
    </div>
  );
}

function WidgetTile({ widget }: { widget: DashboardWidget }) {
  return (
    <article
      data-testid={`widget-${widget.id}`}
      data-widget-type={widget.type}
      className="arc-card-lift arc-widget-tile"
      style={{
        gridColumn: `span ${widget.span.cols}`,
        gridRow: `span ${widget.span.rows}`,
        background: "var(--color-bg-elev)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-4)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        minHeight: 0,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-3)",
          gap: "var(--space-2)",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            color: "var(--color-fg)",
          }}
        >
          {widget.title}
        </h3>
        <div
          className="arc-widget-actions"
          style={{
            display: "flex",
            gap: "var(--space-1)",
            color: "var(--color-fg-subtle)",
          }}
        >
          <button
            type="button"
            aria-label="Edit widget"
            title="Edit widget"
            style={iconButtonStyle}
          >
            <Pencil size={12} />
          </button>
          <button
            type="button"
            aria-label="Widget actions"
            title="More actions"
            style={iconButtonStyle}
          >
            <MoreHorizontal size={12} />
          </button>
        </div>
      </header>

      <div style={{ flex: 1, minHeight: 0 }}>
        <WidgetBody widget={widget} />
      </div>
    </article>
  );
}

const iconButtonStyle: React.CSSProperties = {
  width: 22,
  height: 22,
  border: "none",
  background: "transparent",
  color: "inherit",
  borderRadius: "var(--radius-sm)",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

function WidgetBody({ widget }: { widget: DashboardWidget }): ReactNode {
  if (widget.type === "kpi") {
    const d = widget.data as {
      value: string;
      delta: string;
      dir: "up" | "down";
      spark: number[];
    };
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
          height: "100%",
        }}
      >
        <div
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--color-fg)",
            fontFamily: "var(--font-mono)",
            lineHeight: 1,
          }}
        >
          {d.value}
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            fontWeight: 600,
            color:
              d.dir === "up" ? "var(--color-success)" : "var(--color-danger)",
          }}
        >
          {d.delta}
        </div>
        <div style={{ flex: 1, minHeight: 32 }}>
          <Chart
            config={{ type: "line", xAxis: "i", yAxes: ["v"], area: true }}
            data={{ rows: d.spark.map((v, i) => ({ i, v })) }}
            height={48}
          />
        </div>
      </div>
    );
  }
  if (widget.type === "line") {
    const d = widget.data as {
      points: Array<{ q: string; rev: number; ord: number }>;
    };
    return (
      <Chart
        config={{ type: "line", xAxis: "q", yAxes: ["rev", "ord"] }}
        data={{ rows: d.points }}
        height={260}
      />
    );
  }
  if (widget.type === "bar") {
    const d = widget.data as { bars: Array<{ cat: string; value: number }> };
    const config: ChartConfig = { type: "bar", xAxis: "cat", yAxes: ["value"] };
    return <Chart config={config} data={{ rows: d.bars }} height={260} />;
  }
  if (widget.type === "donut") {
    const d = widget.data as { slices: Array<{ name: string; value: number }> };
    const config: ChartConfig = {
      type: "pie",
      category: "name",
      value: "value",
      variant: "donut",
    };
    return <Chart config={config} data={{ rows: d.slices }} height={260} />;
  }
  if (widget.type === "table") {
    const d = widget.data as {
      rows: Array<Record<string, string | number>>;
    };
    return (
      <Chart config={{ type: "table" }} data={{ rows: d.rows }} height={260} />
    );
  }
  return null;
}
