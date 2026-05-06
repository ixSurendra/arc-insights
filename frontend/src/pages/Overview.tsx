import {
  ActivityIcon,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Bell,
  CheckCircle2,
  Clock,
  Database,
  FileText,
  Plus,
  Star,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Chart } from "../charts/Chart";
import type { ChartConfig } from "../charts/types";

// ─── Sample data (replaced by API in P1-10 / P1-12) ────────────────
const PINNED_DASHBOARDS = [
  {
    id: "sales-overview",
    title: "Sales overview",
    folder: "Finance",
    owner: "Aman M.",
    ownerInitials: "AM",
    updated: "12s ago",
    href: "/dashboard",
    accent: "var(--color-primary)",
    metricLabel: "Q2 to date",
    metricValue: "$405k",
    metricDelta: "+14.2%",
    metricDir: "up" as const,
    status: "live" as const,
    spark: [120, 135, 148, 162, 178, 195, 215, 240],
  },
  {
    id: "growth-funnel",
    title: "Growth funnel · self-serve",
    folder: "Growth",
    owner: "Priya S.",
    ownerInitials: "PS",
    updated: "4m ago",
    href: "/dashboard",
    accent: "var(--color-accent)",
    metricLabel: "Activations",
    metricValue: "2,148",
    metricDelta: "+8.4%",
    metricDir: "up" as const,
    status: "live" as const,
    spark: [90, 88, 102, 110, 118, 130, 142, 158],
  },
  {
    id: "infra-health",
    title: "Infra · p99 latency",
    folder: "Engineering",
    owner: "Ravi K.",
    ownerInitials: "RK",
    updated: "1h ago",
    href: "/dashboard",
    accent: "var(--color-cell-chart)",
    metricLabel: "p99 (5m)",
    metricValue: "838ms",
    metricDelta: "−4ms",
    metricDir: "down" as const,
    status: "stale" as const,
    spark: [820, 815, 838, 842, 836, 830, 822, 818],
  },
  {
    id: "tenant-usage",
    title: "Tenant usage rollup",
    folder: "Embed",
    owner: "Aman M.",
    ownerInitials: "AM",
    updated: "3h ago",
    href: "/dashboard",
    accent: "var(--color-success)",
    metricLabel: "Capacity used",
    metricValue: "84%",
    metricDelta: "+6pp",
    metricDir: "up" as const,
    status: "live" as const,
    spark: [40, 55, 60, 75, 78, 82, 90, 96],
  },
];

const ALERTS = [
  {
    id: 1,
    severity: "danger" as const,
    title: "Snowflake spend approaching budget",
    body: "Q3 budget at 82% with 14 days remaining.",
    time: "8 min ago",
  },
  {
    id: 2,
    severity: "warn" as const,
    title: "EU revenue dropped 11% WoW",
    body: "Anomaly detected on `Sales overview`.",
    time: "1 hr ago",
  },
  {
    id: 3,
    severity: "warn" as const,
    title: "Slow query · 14.2s",
    body: "`growth-funnel.daily_active` exceeded soft cap.",
    time: "3 hr ago",
  },
];

const ACTIVITY = [
  {
    id: 1,
    who: "PS",
    action: "edited",
    target: "Growth funnel · self-serve",
    time: "4m",
  },
  {
    id: 2,
    who: "RK",
    action: "ran",
    target: "infra · p99_latency.sql",
    time: "12m",
  },
  {
    id: 3,
    who: "AM",
    action: "shared",
    target: "Sales overview with Acme · prod",
    time: "27m",
  },
  {
    id: 4,
    who: "PS",
    action: "created notebook",
    target: "Q3 retention probe",
    time: "1h",
  },
  {
    id: 5,
    who: "system",
    action: "auto-refreshed",
    target: "Tenant usage rollup",
    time: "1h",
  },
];

const DATA_SOURCES = [
  {
    name: "warehouse·prod",
    type: "Postgres",
    status: "healthy" as const,
    latency: "23ms",
    cache: "84%",
  },
  {
    name: "events-stream",
    type: "Snowflake",
    status: "healthy" as const,
    latency: "118ms",
    cache: "62%",
  },
  {
    name: "billing-replica",
    type: "Postgres",
    status: "stale" as const,
    latency: "—",
    cache: "—",
  },
  {
    name: "marketing-kpi",
    type: "BigQuery",
    status: "healthy" as const,
    latency: "240ms",
    cache: "55%",
  },
];

const sparkConfig: ChartConfig = {
  type: "line",
  xAxis: "i",
  yAxes: ["v"],
  area: true,
};

// ─── Page ──────────────────────────────────────────────────────────
export function OverviewPage() {
  return (
    <div
      className="arc-bg-textured arc-bg-noise-layer"
      style={{
        minHeight: "100%",
        padding: "var(--space-8) var(--space-6) var(--space-16)",
      }}
    >
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <Welcome />
        <PulseStrip />
        <Section
          title="Pinned dashboards"
          actions={<TextLink to="/dashboard">View all →</TextLink>}
        >
          <DashboardGrid />
        </Section>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-5)",
            marginTop: "var(--space-8)",
          }}
        >
          <Section title="Alerts needing attention" tight>
            <AlertList />
          </Section>
          <Section title="Recent activity" tight>
            <ActivityList />
          </Section>
        </div>
        <Section
          title="Data sources"
          actions={<TextLink to="/data-sources">Manage →</TextLink>}
        >
          <DataSourceTable />
        </Section>
      </div>
    </div>
  );
}

// ─── Welcome row ───────────────────────────────────────────────────
function Welcome() {
  const [now, setNow] = useState(formatDate(new Date()));
  useEffect(() => {
    const t = setInterval(() => setNow(formatDate(new Date())), 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <header
      style={{
        marginBottom: "var(--space-8)",
        animation: "arc-fade-up 500ms var(--ease) both",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--color-fg-subtle)",
          marginBottom: "var(--space-3)",
        }}
      >
        <Clock size={12} />
        {now}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "var(--space-6)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(28px, 4vw, var(--text-3xl))",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              lineHeight: "var(--leading-tight)",
            }}
          >
            Good morning,{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, var(--color-primary), var(--color-accent))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Aman
            </span>
            .
          </h1>
          <p
            style={{
              margin: "var(--space-2) 0 0",
              color: "var(--color-fg-muted)",
              fontSize: "var(--text-md)",
              maxWidth: 600,
            }}
          >
            Here&apos;s your data today — three alerts, four pinned dashboards,
            and spend running 12% under budget.
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <SecondaryAction iconLeft={<Database size={14} />}>
            Connect data
          </SecondaryAction>
          <PrimaryAction iconLeft={<Plus size={14} />}>
            New notebook
          </PrimaryAction>
        </div>
      </div>
    </header>
  );
}

// ─── Pulse strip ───────────────────────────────────────────────────
function PulseStrip() {
  const stats = [
    {
      label: "Queries today",
      value: "1,284",
      delta: "+18%",
      dir: "up" as const,
      hint: "vs yesterday",
    },
    {
      label: "Spend · MTD",
      value: "$284",
      delta: "82%",
      dir: "flat" as const,
      hint: "of $350 budget",
    },
    {
      label: "p99 latency",
      value: "838ms",
      delta: "−4%",
      dir: "down" as const,
      hint: "within budget",
    },
    {
      label: "Cache hit rate",
      value: "84%",
      delta: "+2pp",
      dir: "up" as const,
      hint: "steady",
    },
  ];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: "var(--space-4)",
        marginBottom: "var(--space-10)",
      }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            position: "relative",
            background: "var(--color-bg-elev)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-5)",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: "var(--pattern-dots)",
              opacity: 0.5,
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--color-fg-subtle)",
                marginBottom: "var(--space-2)",
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontSize: "clamp(24px, 2.6vw, var(--text-2xl))",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "var(--color-fg)",
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                marginTop: "var(--space-2)",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                fontSize: 12,
              }}
            >
              <DeltaPill direction={s.dir} value={s.delta} />
              <span style={{ color: "var(--color-fg-subtle)" }}>{s.hint}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Pinned dashboards ─────────────────────────────────────────────
function DashboardGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: "var(--space-4)",
      }}
    >
      {PINNED_DASHBOARDS.map((d) => (
        <Link
          key={d.id}
          to={d.href}
          className="arc-card-lift"
          style={{
            background: "var(--color-bg-elev)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
            color: "inherit",
            textDecoration: "none",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Accent gradient strip — brighter on hover */}
          <div
            aria-hidden
            className="arc-card-accent"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: `linear-gradient(90deg, ${d.accent}, transparent 70%)`,
            }}
          />
          {/* Soft radial glow corner echoing accent */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 160,
              height: 160,
              background: `radial-gradient(circle, ${d.accent}, transparent 65%)`,
              opacity: 0.08,
              pointerEvents: "none",
            }}
          />

          {/* Top row: folder tag · status indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--space-2)",
              position: "relative",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
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
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 10,
                fontWeight: 600,
                color:
                  d.status === "live"
                    ? "var(--color-success)"
                    : "var(--color-warning)",
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background:
                    d.status === "live"
                      ? "var(--color-success)"
                      : "var(--color-warning)",
                  boxShadow:
                    d.status === "live"
                      ? "0 0 0 3px rgba(52, 211, 153, 0.18)"
                      : "0 0 0 3px rgba(251, 191, 36, 0.18)",
                }}
              />
              {d.status === "live" ? "Live" : "Stale"}
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "var(--text-md)",
              fontWeight: 600,
              color: "var(--color-fg)",
              lineHeight: "var(--leading-tight)",
              position: "relative",
            }}
          >
            {d.title}
          </div>

          {/* Metric row: label + value + delta */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "var(--space-2)",
              position: "relative",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--color-fg-subtle)",
                  marginBottom: 2,
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
                  lineHeight: 1,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {d.metricValue}
              </div>
            </div>
            <DeltaPill direction={d.metricDir} value={d.metricDelta} />
          </div>

          {/* Sparkline */}
          <div
            style={{ height: 72, marginInline: "calc(-1 * var(--space-2))" }}
          >
            <Chart
              config={sparkConfig}
              data={{ rows: d.spark.map((v, i) => ({ i, v })) }}
              height={72}
            />
          </div>

          {/* Footer: avatar + owner | updated */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--space-2)",
              paddingTop: "var(--space-2)",
              borderTop: "1px solid var(--color-border)",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-2)",
                minWidth: 0,
              }}
            >
              <Avatar initials={d.ownerInitials} />
              <span
                style={{
                  fontSize: 11,
                  color: "var(--color-fg-muted)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {d.owner}
              </span>
            </div>
            <span
              style={{
                fontSize: 11,
                color: "var(--color-fg-subtle)",
                fontFamily: "var(--font-mono)",
                flexShrink: 0,
              }}
            >
              {d.updated}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ─── Alerts list ────────────────────────────────────────────────────
function AlertList() {
  return (
    <ul
      style={{
        margin: 0,
        padding: 0,
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {ALERTS.map((a, i) => (
        <li
          key={a.id}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "var(--space-3)",
            padding: "var(--space-4)",
            borderBottom:
              i === ALERTS.length - 1
                ? "none"
                : "1px solid var(--color-border)",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              background:
                a.severity === "danger"
                  ? "rgba(239, 68, 68, 0.12)"
                  : "rgba(251, 191, 36, 0.12)",
              color:
                a.severity === "danger"
                  ? "var(--color-danger)"
                  : "var(--color-warning)",
            }}
          >
            <AlertTriangle size={14} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                color: "var(--color-fg)",
                marginBottom: 2,
              }}
            >
              {a.title}
            </div>
            <div style={{ fontSize: 12, color: "var(--color-fg-muted)" }}>
              {a.body}
            </div>
          </div>
          <span
            style={{
              fontSize: 11,
              color: "var(--color-fg-subtle)",
              flexShrink: 0,
            }}
          >
            {a.time}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ─── Activity list ─────────────────────────────────────────────────
function ActivityList() {
  return (
    <ul
      style={{
        margin: 0,
        padding: 0,
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {ACTIVITY.map((a, i) => (
        <li
          key={a.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            padding: "var(--space-3) var(--space-4)",
            borderBottom:
              i === ACTIVITY.length - 1
                ? "none"
                : "1px solid var(--color-border)",
          }}
        >
          <Avatar initials={a.who} />
          <div
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: "var(--text-sm)",
              color: "var(--color-fg-muted)",
            }}
          >
            <span style={{ color: "var(--color-fg)", fontWeight: 600 }}>
              {a.who === "system" ? "System" : a.who}
            </span>{" "}
            {a.action}{" "}
            <span style={{ color: "var(--color-fg)", fontWeight: 500 }}>
              {a.target}
            </span>
          </div>
          <span
            style={{
              fontSize: 11,
              color: "var(--color-fg-subtle)",
              flexShrink: 0,
            }}
          >
            {a.time}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ─── Data sources table ─────────────────────────────────────────────
function DataSourceTable() {
  return (
    <div
      style={{
        background: "var(--color-bg-elev)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 120px 120px 120px 120px",
          gap: "var(--space-4)",
          padding: "var(--space-3) var(--space-4)",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--color-fg-subtle)",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-bg-subtle)",
        }}
      >
        <span>Name</span>
        <span>Type</span>
        <span>Status</span>
        <span>Latency</span>
        <span>Cache hit</span>
      </div>
      {DATA_SOURCES.map((s, i) => (
        <div
          key={s.name}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 120px 120px 120px 120px",
            gap: "var(--space-4)",
            padding: "var(--space-3) var(--space-4)",
            fontSize: "var(--text-sm)",
            color: "var(--color-fg)",
            alignItems: "center",
            borderBottom:
              i === DATA_SOURCES.length - 1
                ? "none"
                : "1px solid var(--color-border)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "var(--color-fg)",
            }}
          >
            {s.name}
          </span>
          <span style={{ color: "var(--color-fg-muted)" }}>{s.type}</span>
          <span>
            <StatusPill status={s.status} />
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--color-fg-muted)",
            }}
          >
            {s.latency}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--color-fg-muted)",
            }}
          >
            {s.cache}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Section wrapper ────────────────────────────────────────────────
function Section({
  title,
  actions,
  tight,
  children,
}: {
  title: string;
  actions?: React.ReactNode;
  tight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        marginTop: tight ? 0 : "var(--space-10)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-4)",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "var(--text-md)",
            fontWeight: 600,
            color: "var(--color-fg)",
            letterSpacing: "-0.005em",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          <SectionIcon title={title} />
          {title}
        </h2>
        {actions}
      </header>
      {tight ? (
        <div
          style={{
            background: "var(--color-bg-elev)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
}

function SectionIcon({ title }: { title: string }) {
  const Icon =
    title === "Pinned dashboards"
      ? Star
      : title === "Alerts needing attention"
        ? Bell
        : title === "Recent activity"
          ? ActivityIcon
          : title === "Data sources"
            ? Database
            : FileText;
  return (
    <span
      style={{
        display: "inline-flex",
        color: "var(--color-fg-subtle)",
      }}
    >
      <Icon size={14} />
    </span>
  );
}

// ─── Tiny components ────────────────────────────────────────────────
function DeltaPill({
  direction,
  value,
}: {
  direction: "up" | "down" | "flat";
  value: string;
}) {
  const tone =
    direction === "up"
      ? { bg: "rgba(52, 211, 153, 0.12)", fg: "var(--color-success)" }
      : direction === "down"
        ? { bg: "rgba(34, 211, 238, 0.12)", fg: "var(--color-primary)" }
        : { bg: "var(--color-bg-subtle)", fg: "var(--color-fg-muted)" };
  const Icon =
    direction === "down"
      ? ArrowDown
      : direction === "up"
        ? ArrowUp
        : TrendingUp;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 6px",
        borderRadius: "var(--radius-full)",
        background: tone.bg,
        color: tone.fg,
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      <Icon size={10} />
      {value}
    </span>
  );
}

function StatusPill({ status }: { status: "healthy" | "stale" | "error" }) {
  const tone =
    status === "healthy"
      ? {
          bg: "rgba(52, 211, 153, 0.14)",
          fg: "var(--color-success)",
          icon: CheckCircle2,
          label: "Healthy",
        }
      : status === "stale"
        ? {
            bg: "rgba(251, 191, 36, 0.14)",
            fg: "var(--color-warning)",
            icon: AlertTriangle,
            label: "Stale",
          }
        : {
            bg: "rgba(248, 113, 113, 0.14)",
            fg: "var(--color-danger)",
            icon: AlertTriangle,
            label: "Error",
          };
  const Icon = tone.icon;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 8px",
        borderRadius: "var(--radius-full)",
        background: tone.bg,
        color: tone.fg,
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      <Icon size={12} />
      {tone.label}
    </span>
  );
}

function Avatar({ initials }: { initials: string }) {
  if (initials === "system") {
    return (
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "var(--color-bg-subtle)",
          color: "var(--color-fg-subtle)",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        ⚙
      </span>
    );
  }
  return (
    <span
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        background:
          "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
        color: "var(--color-primary-fg)",
        fontSize: 11,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {initials.slice(0, 2)}
    </span>
  );
}

function PrimaryAction({
  iconLeft,
  children,
}: {
  iconLeft?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-2)",
        height: 36,
        padding: "0 var(--space-4)",
        background: "var(--color-primary)",
        color: "var(--color-primary-fg)",
        border: "1px solid var(--color-primary)",
        borderRadius: "var(--radius-md)",
        fontFamily: "inherit",
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "var(--shadow-glow)",
      }}
    >
      {iconLeft}
      {children}
    </button>
  );
}

function SecondaryAction({
  iconLeft,
  children,
}: {
  iconLeft?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-2)",
        height: 36,
        padding: "0 var(--space-4)",
        background: "var(--color-bg-elev)",
        color: "var(--color-fg)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        fontFamily: "inherit",
        fontSize: "var(--text-sm)",
        fontWeight: 500,
        cursor: "pointer",
      }}
    >
      {iconLeft}
      {children}
    </button>
  );
}

function TextLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      style={{
        fontSize: 12,
        fontWeight: 500,
        color: "var(--color-primary)",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      {children}
      <ArrowRight size={12} />
    </Link>
  );
}

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
