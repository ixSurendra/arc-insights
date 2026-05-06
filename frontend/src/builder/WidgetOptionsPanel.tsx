/**
 * Widget options panel — Phase 1 right zone of the builder.
 *
 * Houses the 10 collapsible option sections from the locked spec:
 * Title · Legend · Widget filters · Theme · Number formatting · Axis
 * options · Conditional formatting · Goals · Sort · Empty state ·
 * Tooltip. Real authoring lands incrementally; this is the structure
 * the builder snaps onto so Phase 1 ships with the right ergonomics.
 */
import { ChevronDown, Sparkles } from "lucide-react";
import { type ReactNode, useState } from "react";

interface Props {
  /** Currently selected chart type id (e.g. "bar"). */
  chartTypeId: string;
}

interface SectionState {
  open: boolean;
}

const SECTIONS: Array<{
  id: string;
  label: string;
  /** A short hint shown when the section is collapsed and empty. */
  hint: string;
}> = [
  { id: "title", label: "Title", hint: "Show / hide · custom text" },
  { id: "legend", label: "Legend", hint: "Show / hide · position" },
  {
    id: "widget-filters",
    label: "Widget filters",
    hint: "Filters that apply only to this widget",
  },
  { id: "theme", label: "Theme override", hint: "Palette · background · font" },
  {
    id: "format",
    label: "Number formatting",
    hint: "Currency · percent · decimals · abbreviate",
  },
  { id: "axis", label: "Axis options", hint: "Labels · scale · tick density" },
  {
    id: "cond",
    label: "Conditional formatting",
    hint: "Color rules on thresholds",
  },
  { id: "goals", label: "Goals & reference lines", hint: "Targets" },
  { id: "sort", label: "Sort order", hint: "Asc / desc · by which column" },
  { id: "empty", label: "Empty state", hint: "What to show on 0 rows" },
  { id: "tooltip", label: "Tooltip", hint: "Fields · custom format" },
];

export function WidgetOptionsPanel({ chartTypeId }: Props) {
  const [openMap, setOpenMap] = useState<Record<string, SectionState>>(() => ({
    title: { open: true },
  }));

  const toggle = (id: string) =>
    setOpenMap((prev) => ({
      ...prev,
      [id]: { open: !(prev[id]?.open ?? false) },
    }));

  return (
    <aside
      aria-label="Widget options"
      style={{
        background: "var(--color-bg-elev)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-3)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-1)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--space-2) var(--space-3)",
          marginBottom: "var(--space-1)",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-fg-subtle)",
          }}
        >
          Visualization · {chartTypeId}
        </span>
        <button
          type="button"
          aria-label="AI-suggest improvements"
          title="Ask AI to suggest improvements"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: "transparent",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            padding: "2px 6px",
            color: "var(--color-primary)",
            fontFamily: "inherit",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Sparkles size={11} />
          Suggest
        </button>
      </header>

      {SECTIONS.map((s) => (
        <Section
          key={s.id}
          label={s.label}
          hint={s.hint}
          open={openMap[s.id]?.open ?? false}
          onToggle={() => toggle(s.id)}
        >
          <PlaceholderControl section={s.id} />
        </Section>
      ))}
    </aside>
  );
}

function Section({
  label,
  hint,
  open,
  onToggle,
  children,
}: {
  label: string;
  hint: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background: open ? "var(--color-bg)" : "transparent",
        borderRadius: "var(--radius-md)",
        border: "1px solid",
        borderColor: open ? "var(--color-border)" : "transparent",
        transition: "border-color var(--motion-fast) var(--ease)",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-2)",
          padding: "var(--space-2) var(--space-3)",
          background: "transparent",
          border: "none",
          color: "var(--color-fg)",
          fontFamily: "inherit",
          fontSize: "var(--text-sm)",
          fontWeight: 500,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span>{label}</span>
          {!open && (
            <span style={{ fontSize: 11, color: "var(--color-fg-subtle)" }}>
              {hint}
            </span>
          )}
        </span>
        <ChevronDown
          size={14}
          style={{
            color: "var(--color-fg-subtle)",
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform var(--motion-fast) var(--ease)",
            flexShrink: 0,
          }}
        />
      </button>
      {open && (
        <div style={{ padding: "0 var(--space-3) var(--space-3)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

function PlaceholderControl({ section }: { section: string }) {
  // Minimal authoring stub per section — Phase 1 just needs the structure
  // so the builder reads as the locked spec. Real controls land per task.
  if (section === "title") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            fontSize: "var(--text-sm)",
            color: "var(--color-fg-muted)",
          }}
        >
          <input type="checkbox" defaultChecked /> Show title
        </label>
        <input
          type="text"
          placeholder="Title (optional)"
          aria-label="Widget title"
          style={{
            padding: "var(--space-2) var(--space-3)",
            background: "var(--color-bg-elev)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-sm)",
            fontFamily: "inherit",
            color: "var(--color-fg)",
          }}
        />
        <button
          type="button"
          style={{
            alignSelf: "flex-start",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: "transparent",
            border: "1px dashed var(--color-border-strong)",
            borderRadius: "var(--radius-sm)",
            padding: "2px 8px",
            color: "var(--color-primary)",
            fontFamily: "inherit",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Sparkles size={11} /> Auto-name
        </button>
      </div>
    );
  }
  return (
    <p
      style={{
        margin: 0,
        fontSize: 12,
        color: "var(--color-fg-subtle)",
        lineHeight: "var(--leading-snug)",
      }}
    >
      Lands in a follow-up — see ROADMAP P1-27.
    </p>
  );
}
