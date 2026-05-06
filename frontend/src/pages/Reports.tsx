/**
 * Reports — list page reads from the in-memory reports store. Click a
 * row to open the editor; pick a template tile to start a new draft.
 * Real persistence + scheduled delivery wires in P1-39 / P1-41 / P1-42.
 */
import { CalendarClock, FileText, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../layout/AppShell";
import { useReports } from "../reports/store";
import type { Cadence } from "../reports/types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Empty } from "../ui/Empty";

const TEMPLATES = [
  {
    id: "monthly-business-review",
    title: "Monthly business review",
    blurb:
      "Cover page · KPI summary · AI-written callouts · supporting widgets. PDF-optimized.",
  },
  {
    id: "weekly-digest",
    title: "Weekly digest",
    blurb:
      "Short scannable email-style report — KPI deltas + 3 highlights + 1 alert callout.",
  },
  {
    id: "quarterly-board-pack",
    title: "Quarterly board pack",
    blurb:
      "Multi-page formal pack — executive summary, trended KPIs, risks, forward-looking.",
  },
];

const CADENCE_LABEL: Record<Cadence, string> = {
  daily: "daily",
  weekly: "weekly",
  monthly: "monthly",
  quarterly: "quarterly",
};

export function ReportsPage() {
  const reports = useReports((s) => s.reports);

  return (
    <div style={{ padding: "var(--space-5) var(--space-6)" }}>
      <PageHeader
        breadcrumb="Workspace · Acme · Reports"
        title="Reports"
        description="Flowing documents that combine widgets and prose. Schedule them as PDF emails, version each run, embed read-only. Delivery wires in Phase 2 (P2-13)."
        actions={
          <Link to="/reports/new" style={{ textDecoration: "none" }}>
            <Button variant="primary" iconLeft={<Plus size={14} />}>
              New report
            </Button>
          </Link>
        }
      />

      <h2
        style={{
          margin: "0 0 var(--space-3)",
          fontSize: "var(--text-md)",
          fontWeight: 600,
          color: "var(--color-fg)",
        }}
      >
        Start from a template
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "var(--space-3)",
          marginBottom: "var(--space-8)",
        }}
      >
        {TEMPLATES.map((t) => (
          <Link
            key={t.id}
            to={`/reports/new?template=${t.id}`}
            data-testid={`template-${t.id}`}
            className="arc-card-lift"
            style={{
              background: "var(--color-bg-elev)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-4)",
              color: "inherit",
              textDecoration: "none",
              display: "block",
            }}
          >
            <div
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                color: "var(--color-fg)",
                marginBottom: 4,
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

      <h2
        style={{
          margin: "0 0 var(--space-3)",
          fontSize: "var(--text-md)",
          fontWeight: 600,
          color: "var(--color-fg)",
        }}
      >
        Your reports
      </h2>

      {reports.length === 0 ? (
        <Card padded={false}>
          <Empty
            icon={<FileText size={28} />}
            title="No reports yet"
            description="Pick a template above, or build from scratch."
          />
        </Card>
      ) : (
        <Card padded={false}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 1fr 1fr 0.8fr",
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
            <span>Folder</span>
            <span>Schedule</span>
            <span>Last edited</span>
          </div>
          {reports.map((r) => (
            <Link
              key={r.id}
              to={`/reports/${r.id}`}
              data-testid={`report-${r.id}`}
              style={{
                display: "grid",
                gridTemplateColumns: "1.6fr 1fr 1fr 0.8fr",
                gap: "var(--space-4)",
                padding: "var(--space-3) var(--space-4)",
                alignItems: "center",
                borderBottom: "1px solid var(--color-border)",
                fontSize: "var(--text-sm)",
                color: "var(--color-fg)",
                textDecoration: "none",
              }}
            >
              <span>
                <span
                  style={{
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                  }}
                >
                  <FileText
                    size={12}
                    style={{ color: "var(--color-fg-muted)" }}
                  />
                  {r.name}
                </span>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-fg-subtle)",
                    marginTop: 2,
                  }}
                >
                  v{r.version} · {r.blocks.length} blocks
                </div>
              </span>
              <span style={{ color: "var(--color-fg-muted)" }}>
                {r.folder ?? "—"}
              </span>
              <span style={{ color: "var(--color-fg-muted)" }}>
                {r.schedule?.enabled ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 11,
                      color: "var(--color-success)",
                    }}
                  >
                    <CalendarClock size={11} />
                    {CADENCE_LABEL[r.schedule.cadence]} · {r.schedule.time}
                  </span>
                ) : (
                  <span style={{ fontSize: 11 }}>Not scheduled</span>
                )}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--color-fg-subtle)",
                }}
              >
                {new Date(r.updatedAt).toLocaleDateString()}
              </span>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
