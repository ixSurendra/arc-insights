/**
 * Reports — Phase 1 skeleton. The flowing-document composer (P1-39),
 * exports (P1-40), schedule UI (P1-41), versioning (P1-42), and the 3
 * report templates (P1-43) all land in follow-up commits. This page
 * exists so the route + nav are wired and the empty-state CTA points
 * at the future composer.
 */
import { FileText, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../layout/AppShell";
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

export function ReportsPage() {
  return (
    <div style={{ padding: "var(--space-5) var(--space-6)" }}>
      <PageHeader
        breadcrumb="Workspace · Acme · Reports"
        title="Reports"
        description="Flowing documents that combine widgets and prose. Schedule them as PDF emails, version each run, embed read-only. Composer + schedule UI land with P1-39 / P1-41."
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
      <Card padded={false}>
        <Empty
          icon={<FileText size={28} />}
          title="No reports yet"
          description="Pick a template above, or build from scratch. Reports compose widgets with prose and ship as PDFs, scheduled emails, or embedded URLs."
        />
      </Card>
    </div>
  );
}
