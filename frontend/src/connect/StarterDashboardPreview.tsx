/**
 * Starter dashboard preview — Phase 1.
 *
 * After the schema scan, render the proposed widgets in a grid so the
 * tenant sees a working dashboard within seconds of connecting. Real
 * widget rendering wires when the widget builder + persistence land;
 * here we draw a visual representation good enough to validate the
 * onboarding wow moment.
 */
import {
  ArrowRight,
  BarChart3,
  Hash,
  type LucideIcon,
  MapPin,
  PieChart,
  TrendingUp,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import type { StarterWidget } from "./starter-dashboard";

const ICON: Record<StarterWidget["widgetTypeId"], LucideIcon> = {
  "big-number": Hash,
  "kpi-card": Users,
  line: TrendingUp,
  column: BarChart3,
  bar: BarChart3,
  pie: PieChart,
  donut: PieChart,
  choropleth: MapPin,
  table: BarChart3,
};

interface Props {
  widgets: StarterWidget[];
  sourceName: string;
}

export function StarterDashboardPreview({ widgets, sourceName }: Props) {
  const navigate = useNavigate();

  return (
    <div
      data-testid="starter-dashboard"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-5)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-3)",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-success)",
              marginBottom: 4,
            }}
          >
            ✓ Ready
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: "var(--text-xl)",
              fontWeight: 600,
              color: "var(--color-fg)",
            }}
          >
            {prettify(sourceName)} · starter dashboard
          </h2>
          <p
            style={{
              margin: "var(--space-1) 0 0",
              color: "var(--color-fg-muted)",
              fontSize: "var(--text-sm)",
            }}
          >
            {widgets.length} widgets composed by AI from your schema. Tweak any
            in the builder; or save and start exploring.
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Button variant="secondary" onClick={() => navigate("/data-model")}>
            Review data model
          </Button>
          <Button
            variant="primary"
            iconLeft={<ArrowRight size={14} />}
            onClick={() => navigate("/dashboards/starter")}
          >
            Save and open dashboard
          </Button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gridAutoRows: "minmax(120px, auto)",
          gap: "var(--space-4)",
        }}
      >
        {widgets.map((w) => (
          <WidgetCard key={w.id} widget={w} />
        ))}
      </div>
    </div>
  );
}

function WidgetCard({ widget }: { widget: StarterWidget }) {
  const Icon = ICON[widget.widgetTypeId];
  return (
    <article
      data-testid={`starter-widget-${widget.id}`}
      style={{
        gridColumn: `span ${widget.span.cols}`,
        gridRow: `span ${widget.span.rows}`,
        background: "var(--color-bg-elev)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
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
          background:
            "linear-gradient(90deg, var(--color-primary), transparent 80%)",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          color: "var(--color-fg-subtle)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        <Icon size={12} />
        {widget.widgetTypeId}
      </div>
      <h3
        style={{
          margin: 0,
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          color: "var(--color-fg)",
          lineHeight: "var(--leading-snug)",
        }}
      >
        {widget.title}
      </h3>
      <p
        style={{
          margin: "auto 0 0",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--color-fg-muted)",
          lineHeight: "var(--leading-snug)",
          paddingTop: "var(--space-2)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        {widget.source}
      </p>
    </article>
  );
}

function prettify(s: string): string {
  return s.replace(/[_-]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}
