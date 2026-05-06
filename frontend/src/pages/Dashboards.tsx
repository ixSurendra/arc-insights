/**
 * Dashboards — top-level list page, store-backed. Reads from the
 * dashboards store (seed + smart-filled). The "New dashboard" button
 * opens a small picker that routes into the smart-fill dialog for
 * one of the five templates, or to /widgets/new for a from-scratch
 * widget.
 */
import { ArrowDown, Plus, Sparkles, Star, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Chart } from "../charts/Chart";
import type { ChartConfig } from "../charts/types";
import { useDashboards } from "../dashboards/store";
import { PageHeader } from "../layout/AppShell";
import { DASHBOARD_TEMPLATES } from "../templates/dashboard-templates";
import { SmartFillDialog } from "../templates/SmartFillDialog";
import { Button } from "../ui/Button";

const sparkConfig: ChartConfig = {
  type: "line",
  xAxis: "i",
  yAxes: ["v"],
  area: true,
};

export function DashboardsPage() {
  const dashboards = useDashboards((s) => s.dashboards);
  const [picker, setPicker] = useState(false);
  const [pickedTemplate, setPickedTemplate] = useState<string | null>(null);

  return (
    <div style={{ padding: "var(--space-5) var(--space-6)" }}>
      <PageHeader
        breadcrumb="Workspace · Acme · Dashboards"
        title="Dashboards"
        description="All dashboards in this workspace. Click a card to open the responsive grid view; click + New to compose from scratch or smart-fill a template."
        actions={
          <Button
            variant="primary"
            iconLeft={<Plus size={14} />}
            onClick={() => setPicker(true)}
            data-testid="new-dashboard"
          >
            New dashboard
          </Button>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        {dashboards.map((d) => (
          <Link
            key={d.id}
            to={`/dashboards/${d.id}`}
            data-testid={`dashboard-card-${d.id}`}
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
                {d.folder ?? "Workspace"}
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
            {d.headline && (
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
                  {d.headline.label}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "var(--space-2)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--text-xl)",
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      color: "var(--color-fg)",
                      fontFamily: "var(--font-mono)",
                      lineHeight: 1,
                    }}
                  >
                    {d.headline.value}
                  </span>
                  {d.headline.deltaDirection === "down" && (
                    <ArrowDown
                      size={11}
                      style={{ color: "var(--color-danger)" }}
                    />
                  )}
                </div>
              </div>
            )}
            {d.spark && (
              <div style={{ height: 60 }}>
                <Chart
                  config={sparkConfig}
                  data={{ rows: d.spark.map((v, i) => ({ i, v })) }}
                  height={60}
                />
              </div>
            )}
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
              <span>{d.ownerInitials}</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>
                {d.widgets.length} widget{d.widgets.length === 1 ? "" : "s"}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {picker && (
        <NewDashboardPicker
          onPick={(templateId) => {
            setPicker(false);
            setPickedTemplate(templateId);
          }}
          onClose={() => setPicker(false)}
        />
      )}
      {pickedTemplate && (
        <SmartFillDialog
          templateId={pickedTemplate}
          onClose={() => setPickedTemplate(null)}
        />
      )}
    </div>
  );
}

function NewDashboardPicker({
  onPick,
  onClose,
}: {
  onPick: (templateId: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="New dashboard"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 30,
        background: "rgba(10, 14, 23, 0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-6)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 720,
          background: "var(--color-bg-elev)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-5)",
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "var(--text-lg)",
                fontWeight: 600,
                color: "var(--color-fg)",
              }}
            >
              New dashboard
            </h2>
            <p
              style={{
                margin: "var(--space-1) 0 0",
                fontSize: "var(--text-sm)",
                color: "var(--color-fg-muted)",
              }}
            >
              Pick a template — Arc smart-fills it with your real columns. Or
              start blank and add widgets one at a time.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-fg-muted)",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "var(--space-3)",
          }}
        >
          {DASHBOARD_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onPick(t.id)}
              data-testid={`picker-template-${t.id}`}
              className="arc-card-lift"
              style={{
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-4)",
                textAlign: "left",
                cursor: "pointer",
                fontFamily: "inherit",
                color: "var(--color-fg)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
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
                  color: "var(--color-primary)",
                }}
              >
                <Sparkles size={11} />
                Smart-fill
              </span>
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
                {t.description}
              </div>
            </button>
          ))}
        </div>

        <div
          style={{
            paddingTop: "var(--space-3)",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Link to="/widgets/new" style={{ textDecoration: "none" }}>
            <Button variant="secondary" onClick={onClose}>
              Or start with a blank widget
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
