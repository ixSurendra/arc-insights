/**
 * Dashboard view — Phase 1 grid skeleton, store-backed.
 *
 * Reads the selected dashboard from the dashboards store by URL id.
 * Falls back to "sales-overview" for the legacy /dashboard route.
 * Widgets that have known mock data (the seed sales-overview record)
 * render rich; smart-fill widgets render a structural placeholder
 * with their kind, title, and source description until real query
 * execution wires in.
 */
import {
  ArrowDown,
  BarChart3,
  Calendar,
  Filter,
  Hash,
  type LucideIcon,
  MapPin,
  MoreHorizontal,
  Pencil,
  PieChart,
  RefreshCw,
  Share2,
  Sparkles,
  Star,
  Table as TableIcon,
  TrendingUp,
  Users,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { Chart } from "../charts/Chart";
import type { ChartConfig } from "../charts/types";
import { useDashboards } from "../dashboards/store";
import type {
  DashboardRecord,
  DashboardWidget,
  DashboardWidgetKind,
} from "../dashboards/types";
import { PageHeader } from "../layout/AppShell";
import { Button } from "../ui/Button";
import { StatusBadge } from "../ui/StatusBadge";

const FILTERS = [
  { label: "Last 90 days", icon: Calendar },
  { label: "All regions", icon: Filter },
  { label: "All segments", icon: Filter },
];

const KIND_ICON: Record<DashboardWidgetKind, LucideIcon> = {
  "kpi-card": Users,
  "big-number": Hash,
  line: TrendingUp,
  column: BarChart3,
  bar: BarChart3,
  donut: PieChart,
  pie: PieChart,
  choropleth: MapPin,
  table: TableIcon,
};

interface MockData {
  kpi?: { value: string; delta?: string; dir: "up" | "down"; spark: number[] };
  bigNumber?: { value: string };
  line?: Array<Record<string, string | number>>;
  bar?: Array<{ cat: string; value: number }>;
  donut?: Array<{ name: string; value: number }>;
  table?: Array<Record<string, string | number>>;
}

const MOCK_BY_WIDGET_ID: Record<string, MockData> = {
  "kpi-revenue": {
    kpi: {
      value: "$405k",
      delta: "+14.2%",
      dir: "up",
      spark: [120, 135, 148, 162, 178, 195, 215, 240],
    },
  },
  "kpi-orders": { bigNumber: { value: "9,648" } },
  "kpi-aov": {
    kpi: {
      value: "$42.0",
      delta: "+1.3%",
      dir: "up",
      spark: [40, 41, 41, 42, 42, 41, 42, 42],
    },
  },
  "kpi-customers": { bigNumber: { value: "2,841" } },
  "trend-revenue": {
    line: [
      { q: "Q1 24", rev: 123900, ord: 2100 },
      { q: "Q2 24", rev: 142400, ord: 8800 },
      { q: "Q3 24", rev: 141800, ord: 5400 },
      { q: "Q4 24", rev: 141900, ord: 9500 },
      { q: "Q1 25", rev: 130800, ord: 2700 },
      { q: "Q2 25", rev: 145000, ord: 9200 },
    ],
  },
  "donut-categories": {
    donut: [
      { name: "Doohickey", value: 21 },
      { name: "Gadget", value: 27 },
      { name: "Gizmo", value: 25 },
      { name: "Widget", value: 27 },
    ],
  },
  "bar-categories": {
    bar: [
      { cat: "Doohickey", value: 11800 },
      { cat: "Gadget", value: 12100 },
      { cat: "Gizmo", value: 12900 },
      { cat: "Widget", value: 14000 },
    ],
  },
  "table-events": {
    table: [
      { plan: "Basic", event: "Button Clicked", q1: 785, q2: 412 },
      { plan: "Basic", event: "Page Viewed", q1: 5006, q2: 2412 },
      { plan: "Business", event: "Button Clicked", q1: 4, q2: 6 },
      { plan: "Business", event: "Page Viewed", q1: 9, q2: 12 },
      { plan: "Premium", event: "Button Clicked", q1: 35, q2: 41 },
      { plan: "Premium", event: "Page Viewed", q1: 279, q2: 312 },
    ],
  },
};

export function DashboardPage() {
  const { id: routeId } = useParams<{ id: string }>();
  const id = routeId ?? "sales-overview";
  const dashboard = useDashboards((s) => s.byId(id));

  if (!dashboard) {
    return (
      <div style={{ padding: "var(--space-5) var(--space-6)" }}>
        <PageHeader
          breadcrumb="Workspace · Acme · Dashboards"
          title="Dashboard not found"
          description={`No dashboard with id "${id}". It may have been deleted, or you came from a stale link.`}
        />
      </div>
    );
  }

  return <DashboardView dashboard={dashboard} />;
}

function DashboardView({ dashboard }: { dashboard: DashboardRecord }) {
  return (
    <div style={{ padding: "var(--space-5) var(--space-6)" }}>
      <PageHeader
        breadcrumb="Workspace · Acme · Dashboards"
        title={dashboard.title}
        titleIcon={<Star size={18} fill="currentColor" stroke="currentColor" />}
        tag={dashboard.folder}
        status={
          <StatusBadge tone={dashboard.status === "stale" ? "warn" : "live"}>
            {dashboard.status === "stale"
              ? "Stale · refresh to update"
              : "Live · refreshed just now"}
          </StatusBadge>
        }
        description={
          dashboard.generatedFromTemplate
            ? `Smart-filled from the "${dashboard.generatedFromTemplate}" template. Filters at the top apply to every widget.`
            : "Filters at the top apply to every widget on the page."
        }
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

      <FilterBar widgetCount={dashboard.widgets.length} />

      {dashboard.widgets.length === 0 ? (
        <EmptyDashboard />
      ) : (
        <div
          data-testid="dashboard-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gridAutoRows: "minmax(140px, auto)",
            gap: "var(--space-4)",
          }}
        >
          {dashboard.widgets.map((w) => (
            <WidgetTile key={w.id} widget={w} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterBar({ widgetCount }: { widgetCount: number }) {
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
        3 active filters apply to all {widgetCount} widget
        {widgetCount === 1 ? "" : "s"}
      </span>
    </div>
  );
}

function EmptyDashboard() {
  return (
    <div
      style={{
        padding: "var(--space-12) var(--space-6)",
        textAlign: "center",
        color: "var(--color-fg-muted)",
        background: "var(--color-bg-elev)",
        border: "1px dashed var(--color-border-strong)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <div style={{ fontWeight: 600, color: "var(--color-fg)" }}>
        No widgets yet
      </div>
      <div style={{ marginTop: 8, fontSize: "var(--text-sm)" }}>
        Pick a template on the Home page or click + New widget to add the first
        one.
      </div>
    </div>
  );
}

function WidgetTile({ widget }: { widget: DashboardWidget }) {
  const mock = MOCK_BY_WIDGET_ID[widget.id];
  return (
    <article
      data-testid={`widget-${widget.id}`}
      data-widget-type={widget.kind}
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
        <WidgetBody widget={widget} mock={mock} />
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

function WidgetBody({
  widget,
  mock,
}: {
  widget: DashboardWidget;
  mock: MockData | undefined;
}) {
  if (mock?.kpi) {
    const d = mock.kpi;
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
        {d.delta && (
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
        )}
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
  if (mock?.bigNumber) {
    return (
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
        {mock.bigNumber.value}
      </div>
    );
  }
  if (mock?.line) {
    return (
      <Chart
        config={{ type: "line", xAxis: "q", yAxes: ["rev", "ord"] }}
        data={{ rows: mock.line }}
        height={260}
      />
    );
  }
  if (mock?.bar) {
    const config: ChartConfig = { type: "bar", xAxis: "cat", yAxes: ["value"] };
    return <Chart config={config} data={{ rows: mock.bar }} height={260} />;
  }
  if (mock?.donut) {
    const config: ChartConfig = {
      type: "pie",
      category: "name",
      value: "value",
      variant: "donut",
    };
    return <Chart config={config} data={{ rows: mock.donut }} height={260} />;
  }
  if (mock?.table) {
    return (
      <Chart
        config={{ type: "table" }}
        data={{ rows: mock.table }}
        height={260}
      />
    );
  }

  // Smart-fill widget without registered mock data — render a clean
  // structural placeholder citing the source the AI generated.
  const Icon = KIND_ICON[widget.kind];
  return (
    <div
      style={{
        height: "100%",
        minHeight: widget.span.rows === 1 ? 60 : 200,
        background:
          "linear-gradient(135deg, rgba(34, 211, 238, 0.06), rgba(56, 189, 248, 0.03))",
        border: "1px dashed var(--color-border-strong)",
        borderRadius: "var(--radius-md)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        color: "var(--color-fg-muted)",
        padding: "var(--space-3)",
        textAlign: "center",
      }}
    >
      <Icon size={20} style={{ color: "var(--color-primary)" }} />
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {widget.kind}
      </div>
      <div
        style={{
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          maxWidth: 280,
        }}
      >
        {widget.source}
      </div>
    </div>
  );
}
