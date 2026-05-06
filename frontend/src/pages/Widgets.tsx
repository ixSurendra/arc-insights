/**
 * Widgets — top-level library of saved widgets (questions). Phase 1
 * skeleton shows the locked widget catalog (18 charts + 3 containers)
 * grouped by category. Real saved-widget storage and search lands with
 * P1-29; for now the page exists so navigation and the picker preview
 * can be exercised end-to-end.
 */
import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../layout/AppShell";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  type WidgetCategory,
  type WidgetType,
  widgetsByCategory,
} from "../widgets/catalog";

export function WidgetsPage() {
  const grouped = widgetsByCategory();
  const total = Object.values(grouped).reduce((n, list) => n + list.length, 0);

  return (
    <div style={{ padding: "var(--space-5) var(--space-6)" }}>
      <PageHeader
        breadcrumb="Workspace · Acme · Widgets"
        title="Widgets"
        description={`Saved questions you can drop into any dashboard or report. ${total} widget types available; saved-widget storage and search land with P1-29.`}
        actions={
          <Link to="/widgets/new" style={{ textDecoration: "none" }}>
            <Button variant="primary" iconLeft={<Plus size={14} />}>
              New widget
            </Button>
          </Link>
        }
      />

      <Card padded={false} style={{ marginBottom: "var(--space-5)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            padding: "var(--space-3) var(--space-4)",
            borderBottom: "1px solid var(--color-border)",
            color: "var(--color-fg-subtle)",
          }}
        >
          <Search size={14} />
          <span style={{ fontSize: "var(--text-sm)" }}>
            Search saved widgets — coming with P1-29
          </span>
        </div>
      </Card>

      {CATEGORY_ORDER.map((cat) => (
        <CategorySection key={cat} category={cat} widgets={grouped[cat]} />
      ))}
    </div>
  );
}

function CategorySection({
  category,
  widgets,
}: {
  category: WidgetCategory;
  widgets: WidgetType[];
}) {
  if (widgets.length === 0) return null;
  return (
    <section style={{ marginBottom: "var(--space-8)" }}>
      <h2
        style={{
          margin: "0 0 var(--space-3)",
          fontSize: "var(--text-md)",
          fontWeight: 600,
          color: "var(--color-fg)",
          letterSpacing: "-0.005em",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
        }}
      >
        {CATEGORY_LABEL[category]}
        <span
          style={{
            fontSize: "var(--text-xs)",
            fontWeight: 500,
            color: "var(--color-fg-subtle)",
          }}
        >
          {widgets.length}
        </span>
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "var(--space-3)",
        }}
      >
        {widgets.map((w) => (
          <WidgetTypeTile key={w.id} widget={w} />
        ))}
      </div>
    </section>
  );
}

function WidgetTypeTile({ widget }: { widget: WidgetType }) {
  return (
    <Link
      to={`/widgets/new?type=${widget.id}`}
      className="arc-card-lift"
      style={{
        background: "var(--color-bg-elev)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
        color: "inherit",
        textDecoration: "none",
      }}
    >
      <div
        style={{
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          color: "var(--color-fg)",
        }}
      >
        {widget.label}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--color-fg-muted)",
          lineHeight: "var(--leading-snug)",
        }}
      >
        {widget.description}
      </div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-fg-subtle)",
          marginTop: "auto",
          paddingTop: "var(--space-2)",
        }}
      >
        {widget.id}
      </div>
    </Link>
  );
}
