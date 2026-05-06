import {
  ActivityIcon,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Bell,
  Clock,
  Database,
  FileText,
  Layout as LayoutIcon,
  Plus,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const sparkConfig: ChartConfig = {
  type: "line",
  xAxis: "i",
  yAxes: ["v"],
  area: true,
};

// ─── Page ──────────────────────────────────────────────────────────

const DASHBOARD_COUNT = PINNED_DASHBOARDS.length;
const SHOW_TEMPLATES = DASHBOARD_COUNT < 3;

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
        {/* ─── Above the fold ─── */}
        <Welcome />
        <AskAIInput />
        <PulseStrip />
        <Section
          title="Pinned dashboards"
          actions={<TextLink to="/dashboards">View all →</TextLink>}
        >
          <DashboardGrid />
        </Section>
        <Section
          title="AI suggestions for you"
          actions={
            <span
              style={{
                fontSize: 11,
                color: "var(--color-fg-subtle)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Powered by Ollama Cloud
            </span>
          }
        >
          <SuggestionCards />
        </Section>

        {/* ─── Below the fold ─── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-5)",
            marginTop: "var(--space-10)",
          }}
        >
          <Section title="Recent widgets" tight>
            <RecentWidgetList />
          </Section>
          <Section title="Recent reports" tight>
            <RecentReportList />
          </Section>
        </div>

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

        {SHOW_TEMPLATES && (
          <Section
            title="Dashboard templates"
            actions={
              <span style={{ fontSize: 11, color: "var(--color-fg-subtle)" }}>
                Hidden once your workspace has 3+ dashboards · toggle in
                Settings
              </span>
            }
          >
            <TemplatesGrid />
          </Section>
        )}
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
          <Link to="/data-sources/new" style={{ textDecoration: "none" }}>
            <SecondaryAction iconLeft={<Database size={14} />}>
              Connect data
            </SecondaryAction>
          </Link>
          <Link to="/widgets/new" style={{ textDecoration: "none" }}>
            <PrimaryAction iconLeft={<Plus size={14} />}>
              New widget
            </PrimaryAction>
          </Link>
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

// Data sources table moved to its own surface (/data-sources). Removed
// from the home page in the Phase 1 realignment — home now has Recent
// widgets / reports / activity / alerts above the templates section.

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
            : title === "AI suggestions for you"
              ? Sparkles
              : title === "Recent widgets"
                ? BarChart3
                : title === "Recent reports"
                  ? FileText
                  : title === "Dashboard templates"
                    ? LayoutIcon
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

// ─── Ask AI input (persistent, top of home) ────────────────────────
function AskAIInput() {
  const [value, setValue] = useState("");
  const navigate = useNavigate();
  const exemplars = [
    "Revenue by region last 90 days",
    "Why did EU sales drop in Q3?",
    "Top 10 customers by lifetime value",
  ];

  const submit = (q: string) => {
    const text = q.trim();
    if (!text) return;
    navigate(`/widgets/new?door=ai&q=${encodeURIComponent(text)}`);
  };

  return (
    <div
      style={{
        marginBottom: "var(--space-10)",
        animation: "arc-fade-up 600ms 80ms var(--ease) both",
      }}
    >
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          padding: "var(--space-3) var(--space-4)",
          background: "var(--color-bg-elev)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <Sparkles size={16} style={{ color: "var(--color-primary)" }} />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask AI a question about your data — e.g. revenue by region last 90 days"
          aria-label="Ask AI"
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: "var(--text-md)",
            color: "var(--color-fg)",
            fontFamily: "inherit",
            minWidth: 0,
          }}
        />
        <kbd
          style={{
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            color: "var(--color-fg-subtle)",
            padding: "2px 6px",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
          }}
        >
          ⌘K
        </kbd>
      </form>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          marginTop: "var(--space-2)",
          flexWrap: "wrap",
          fontSize: 11,
          color: "var(--color-fg-subtle)",
        }}
      >
        <span style={{ letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Try
        </span>
        {exemplars.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setValue(q)}
            style={{
              border: "1px dashed var(--color-border)",
              background: "transparent",
              padding: "2px 8px",
              borderRadius: "var(--radius-full)",
              color: "var(--color-fg-muted)",
              fontFamily: "inherit",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── AI suggestion cards (passive, schema-aware) ───────────────────
const SUGGESTIONS = [
  {
    id: "rev-by-region",
    title: "Revenue by region",
    blurb:
      "Your `orders` table has `country` and `amount` — looks like a natural choropleth.",
    cta: "Build the widget",
    icon: BarChart3,
  },
  {
    id: "weekly-orders",
    title: "Weekly orders trend",
    blurb:
      "`orders.created_at` is a date column. Group by week to spot seasonality.",
    cta: "Open in builder",
    icon: TrendingUp,
  },
  {
    id: "top-products",
    title: "Top products by revenue",
    blurb:
      "We see `products` joined to `orders` — top-N table is one click away.",
    cta: "Generate widget",
    icon: Star,
  },
];

function SuggestionCards() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "var(--space-4)",
      }}
    >
      {SUGGESTIONS.map((s) => (
        <Link
          key={s.id}
          to="/widgets/new"
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
          }}
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-md)",
              background:
                "linear-gradient(135deg, rgba(34, 211, 238, 0.16), rgba(56, 189, 248, 0.10))",
              color: "var(--color-primary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <s.icon size={16} />
          </span>
          <div
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "var(--color-fg)",
            }}
          >
            {s.title}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--color-fg-muted)",
              lineHeight: "var(--leading-snug)",
            }}
          >
            {s.blurb}
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--color-primary)",
              marginTop: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {s.cta}
            <ArrowRight size={11} />
          </span>
        </Link>
      ))}
    </div>
  );
}

// ─── Recent widgets / reports ──────────────────────────────────────
const RECENT_WIDGETS = [
  {
    id: "rev-region",
    title: "Revenue by region",
    type: "Choropleth",
    updated: "8m ago",
    owner: "AM",
  },
  {
    id: "weekly-orders",
    title: "Weekly orders",
    type: "Line",
    updated: "21m ago",
    owner: "PS",
  },
  {
    id: "top-products",
    title: "Top products by revenue",
    type: "Bar",
    updated: "1h ago",
    owner: "AM",
  },
  {
    id: "aov",
    title: "Average order value",
    type: "KPI card",
    updated: "2h ago",
    owner: "RK",
  },
];

const RECENT_REPORTS = [
  {
    id: "mbr-may",
    title: "Monthly business review · May",
    type: "Monthly",
    updated: "Yesterday",
    owner: "AM",
  },
  {
    id: "weekly-19",
    title: "Weekly digest · W19",
    type: "Weekly",
    updated: "3 days ago",
    owner: "PS",
  },
  {
    id: "q1-board",
    title: "Q1 board pack",
    type: "Quarterly",
    updated: "2 weeks ago",
    owner: "AM",
  },
];

function RecentWidgetList() {
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
      {RECENT_WIDGETS.map((w, i) => (
        <li
          key={w.id}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            gap: "var(--space-3)",
            alignItems: "center",
            padding: "var(--space-3) var(--space-4)",
            borderBottom:
              i === RECENT_WIDGETS.length - 1
                ? "none"
                : "1px solid var(--color-border)",
            fontSize: "var(--text-sm)",
          }}
        >
          <span style={{ color: "var(--color-fg)", fontWeight: 500 }}>
            {w.title}
          </span>
          <span
            style={{
              fontSize: 11,
              padding: "2px 6px",
              background: "var(--color-bg-subtle)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--color-fg-muted)",
            }}
          >
            {w.type}
          </span>
          <span
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--color-fg-subtle)",
            }}
          >
            {w.updated}
          </span>
        </li>
      ))}
    </ul>
  );
}

function RecentReportList() {
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
      {RECENT_REPORTS.map((r, i) => (
        <li
          key={r.id}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            gap: "var(--space-3)",
            alignItems: "center",
            padding: "var(--space-3) var(--space-4)",
            borderBottom:
              i === RECENT_REPORTS.length - 1
                ? "none"
                : "1px solid var(--color-border)",
            fontSize: "var(--text-sm)",
          }}
        >
          <span style={{ color: "var(--color-fg)", fontWeight: 500 }}>
            {r.title}
          </span>
          <span
            style={{
              fontSize: 11,
              padding: "2px 6px",
              background: "var(--color-bg-subtle)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--color-fg-muted)",
            }}
          >
            {r.type}
          </span>
          <span
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--color-fg-subtle)",
            }}
          >
            {r.updated}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ─── Dashboard templates (gated by dashboard count) ────────────────
const TEMPLATE_PICKS = [
  {
    id: "executive",
    title: "Executive overview",
    blurb: "4 KPIs · trend · geo · top-N table",
  },
  {
    id: "sales-pipeline",
    title: "Sales pipeline",
    blurb: "Funnel · deals by stage · win rate · top reps · forecast",
  },
  {
    id: "marketing",
    title: "Marketing performance",
    blurb: "Channel mix · campaigns · conversion funnel · weekly trend",
  },
  {
    id: "ops",
    title: "Operations / health",
    blurb: "Uptime · p99 latency · errors · top failures",
  },
  {
    id: "saas",
    title: "SaaS metrics",
    blurb: "DAU/MAU · activation funnel · retention cohort · adoption",
  },
];

function TemplatesGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "var(--space-3)",
      }}
    >
      {TEMPLATE_PICKS.map((t) => (
        <Link
          key={t.id}
          to={`/dashboards/new?template=${t.id}`}
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
            gap: "var(--space-2)",
          }}
        >
          <div
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "var(--color-fg)",
            }}
          >
            {t.title}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--color-fg-muted)",
              lineHeight: "var(--leading-snug)",
            }}
          >
            {t.blurb}
          </div>
        </Link>
      ))}
    </div>
  );
}
