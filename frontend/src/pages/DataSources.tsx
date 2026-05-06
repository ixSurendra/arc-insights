/**
 * Data Sources — Phase 1 skeleton.
 *
 * Top-level list of connected sources (DBs and uploaded CSVs). The
 * "Connect database" / "Upload CSV" tiles drive onboarding for new
 * tenants and ad-hoc additions for existing ones. Real connector forms
 * land with P1-17; CSV upload with P1-16.
 */
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../layout/AppShell";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

const SOURCES = [
  {
    name: "warehouse·prod",
    type: "Postgres",
    status: "healthy" as const,
    latency: "23ms",
    cache: "84%",
    tables: 18,
  },
  {
    name: "events-stream",
    type: "Snowflake",
    status: "healthy" as const,
    latency: "118ms",
    cache: "62%",
    tables: 7,
  },
  {
    name: "billing-replica",
    type: "Postgres",
    status: "stale" as const,
    latency: "—",
    cache: "—",
    tables: 12,
  },
  {
    name: "marketing-kpi",
    type: "BigQuery",
    status: "healthy" as const,
    latency: "240ms",
    cache: "55%",
    tables: 24,
  },
];

export function DataSourcesPage() {
  return (
    <div style={{ padding: "var(--space-5) var(--space-6)" }}>
      <PageHeader
        breadcrumb="Workspace · Acme · Data Sources"
        title="Data sources"
        description="Connect databases or upload CSVs. Arc auto-detects schema, narrates the scan with AI, and generates a starter dashboard. Connectors land with P1-01..P1-04 and P1-16..P1-17."
        actions={
          <Link to="/data-sources/new" style={{ textDecoration: "none" }}>
            <Button variant="primary" iconLeft={<Plus size={14} />}>
              Connect data
            </Button>
          </Link>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-4)",
          marginBottom: "var(--space-8)",
        }}
      >
        <ConnectTile
          icon={<Database size={20} />}
          title="Connect a database"
          blurb="Postgres · MySQL · BigQuery · Snowflake. Test the connection, save credentials, and Arc takes it from there."
          href="/data-sources/new?type=db"
        />
        <ConnectTile
          icon={<FileSpreadsheet size={20} />}
          title="Upload a CSV"
          blurb="Drag-drop or pick a file. Arc parses, infers types, and imports into your workspace database."
          href="/data-sources/new?type=csv"
        />
      </div>

      <Card padded={false}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 0.6fr",
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
          <span>Tables</span>
        </div>
        {SOURCES.map((s, i) => (
          <div
            key={s.name}
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 0.6fr",
              gap: "var(--space-4)",
              padding: "var(--space-3) var(--space-4)",
              fontSize: "var(--text-sm)",
              alignItems: "center",
              borderBottom:
                i === SOURCES.length - 1
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
            <StatusPill status={s.status} />
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
            <span style={{ color: "var(--color-fg-muted)" }}>{s.tables}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function ConnectTile({
  icon,
  title,
  blurb,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  blurb: string;
  href: string;
}) {
  return (
    <Link
      to={href}
      className="arc-card-lift"
      style={{
        background: "var(--color-bg-elev)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-5)",
        color: "inherit",
        textDecoration: "none",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: "var(--radius-md)",
          background:
            "linear-gradient(135deg, rgba(34, 211, 238, 0.16), rgba(56, 189, 248, 0.10))",
          color: "var(--color-primary)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </span>
      <div
        style={{
          fontSize: "var(--text-md)",
          fontWeight: 600,
          color: "var(--color-fg)",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--color-fg-muted)",
          lineHeight: "var(--leading-snug)",
        }}
      >
        {blurb}
      </div>
    </Link>
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
        width: "max-content",
      }}
    >
      <Icon size={12} />
      {tone.label}
    </span>
  );
}
