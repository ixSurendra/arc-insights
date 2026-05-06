/**
 * Report editor — wraps the Composer with the page chrome (header,
 * actions, schedule, export, save). Phase 1 keeps state in the in-
 * memory reports store; persistence wires later.
 */
import {
  CalendarClock,
  Clock,
  Download,
  Eye,
  EyeOff,
  History,
  Save,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Composer } from "../reports/Composer";
import { ScheduleDialog } from "../reports/ScheduleDialog";
import { useReports } from "../reports/store";
import type { Cadence, Report } from "../reports/types";
import { PageHeader } from "../layout/AppShell";
import { Button } from "../ui/Button";
import { StatusBadge } from "../ui/StatusBadge";

const CADENCE_LABEL: Record<Cadence, string> = {
  daily: "daily",
  weekly: "weekly",
  monthly: "monthly",
  quarterly: "quarterly",
};

export function ReportEditorPage() {
  const { id } = useParams<{ id: string }>();
  const [search] = useSearchParams();
  const reports = useReports((s) => s.reports);
  const upsertReport = useReports((s) => s.upsertReport);
  const setShowAutoSummary = useReports((s) => s.setShowAutoSummary);
  const navigate = useNavigate();

  const report = useMemo(() => {
    if (id) return reports.find((r) => r.id === id);
    // /reports/new — build a draft, optionally seed from template param
    const template = search.get("template") ?? undefined;
    const fresh: Report = {
      id: `rpt-${Date.now()}`,
      name: template ? prettify(template) : "Untitled report",
      template,
      showAutoSummary: true,
      version: 1,
      updatedAt: new Date().toISOString(),
      ownerInitials: "AM",
      blocks: starterBlocks(template),
    };
    return fresh;
  }, [id, search, reports]);

  const [scheduleOpen, setScheduleOpen] = useState(false);

  if (!report) {
    return (
      <div style={{ padding: "var(--space-5) var(--space-6)" }}>
        <PageHeader
          breadcrumb={
            <Link to="/reports" style={crumbStyle}>
              Reports
            </Link>
          }
          title="Report not found"
          description="This report id isn't in the workspace store. It may have been deleted."
          actions={
            <Link to="/reports" style={{ textDecoration: "none" }}>
              <Button variant="secondary">Back to Reports</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const onSave = () => {
    upsertReport(report);
    navigate("/reports");
  };

  return (
    <div
      style={{
        padding: "var(--space-5) var(--space-6) var(--space-12)",
      }}
    >
      <PageHeader
        breadcrumb={
          <Link to="/reports" style={crumbStyle}>
            Reports
          </Link>
        }
        title={
          <input
            type="text"
            value={report.name}
            onChange={(e) => upsertReport({ ...report, name: e.target.value })}
            aria-label="Report name"
            data-testid="report-name"
            style={{
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: "var(--text-xl)",
              fontWeight: 600,
              color: "var(--color-fg)",
              fontFamily: "inherit",
              minWidth: 200,
            }}
          />
        }
        tag={report.folder}
        status={
          report.schedule?.enabled ? (
            <StatusBadge tone="ok">
              <CalendarClock size={11} style={{ marginRight: 4 }} />
              {CADENCE_LABEL[report.schedule.cadence]} · {report.schedule.time}
            </StatusBadge>
          ) : (
            <StatusBadge tone="muted">Not scheduled</StatusBadge>
          )
        }
        description={
          <>
            <Clock
              size={11}
              style={{ marginRight: 4, verticalAlign: "-1px" }}
            />
            v{report.version} · last edited{" "}
            {new Date(report.updatedAt).toLocaleDateString()} · owner ·{" "}
            {report.ownerInitials}
          </>
        }
        toolbar={
          <Button
            variant="ghost"
            size="sm"
            iconLeft={
              report.showAutoSummary ? <Eye size={14} /> : <EyeOff size={14} />
            }
            onClick={() =>
              setShowAutoSummary(report.id, !report.showAutoSummary)
            }
          >
            {report.showAutoSummary ? "Hide AI summary" : "Show AI summary"}
          </Button>
        }
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              iconLeft={<History size={14} />}
              data-testid="versions"
            >
              Versions
            </Button>
            <Button
              variant="secondary"
              iconLeft={<Download size={14} />}
              data-testid="export"
            >
              Export
            </Button>
            <Button
              variant="secondary"
              iconLeft={<CalendarClock size={14} />}
              onClick={() => setScheduleOpen(true)}
              data-testid="schedule"
            >
              {report.schedule ? "Edit schedule" : "Schedule"}
            </Button>
            <Button
              variant="primary"
              iconLeft={<Save size={14} />}
              onClick={onSave}
              data-testid="save-report"
            >
              Save
            </Button>
          </>
        }
      />

      <Composer report={report} />

      {scheduleOpen && (
        <ScheduleDialog
          reportId={report.id}
          current={report.schedule}
          onClose={() => setScheduleOpen(false)}
        />
      )}

      {/* Re-export the Sparkles icon usage so eslint doesn't flag the unused
          import; it's reserved for the upcoming "Write commentary" button. */}
      <span aria-hidden style={{ display: "none" }}>
        <Sparkles />
      </span>
    </div>
  );
}

const crumbStyle: React.CSSProperties = {
  color: "var(--color-fg-muted)",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
};

function starterBlocks(template?: string): Report["blocks"] {
  const id = (k: string) => `${k}-${Math.random().toString(36).slice(2, 8)}`;
  if (template === "monthly-business-review") {
    return [
      {
        id: id("h"),
        type: "heading",
        level: 1,
        text: "Monthly business review",
      },
      {
        id: id("p"),
        type: "paragraph",
        text: "Executive summary — replace with your headline takeaways for the month.",
      },
      {
        id: id("h"),
        type: "heading",
        level: 2,
        text: "Headline KPIs",
      },
      {
        id: id("w"),
        type: "widget",
        widgetId: "w-revenue-q2",
        widgetTitle: "Revenue · Q2 to date",
        widgetTypeId: "kpi-card",
        span: "half",
      },
      {
        id: id("w"),
        type: "widget",
        widgetId: "w-orders-q2",
        widgetTitle: "Orders · Q2 to date",
        widgetTypeId: "kpi-card",
        span: "half",
      },
    ];
  }
  if (template === "weekly-digest") {
    return [
      { id: id("h"), type: "heading", level: 1, text: "Weekly digest" },
      {
        id: id("p"),
        type: "paragraph",
        text: "Three highlights and one anomaly this week.",
      },
    ];
  }
  if (template === "quarterly-board-pack") {
    return [
      {
        id: id("h"),
        type: "heading",
        level: 1,
        text: "Quarterly board pack",
      },
      {
        id: id("h"),
        type: "heading",
        level: 2,
        text: "Executive summary",
      },
      {
        id: id("p"),
        type: "paragraph",
        text: "Summary of the quarter — strategic context for the board.",
      },
      {
        id: id("h"),
        type: "heading",
        level: 2,
        text: "Trended KPIs",
      },
      {
        id: id("w"),
        type: "widget",
        widgetId: "w-revenue-trend",
        widgetTitle: "Revenue and orders over time",
        widgetTypeId: "line",
        span: "full",
      },
    ];
  }
  return [
    { id: id("h"), type: "heading", level: 1, text: "Untitled report" },
    {
      id: id("p"),
      type: "paragraph",
      text: "Start typing or insert a widget below.",
    },
  ];
}

function prettify(slug: string): string {
  return slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}
