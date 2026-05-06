/**
 * Reports composer — Phase 1 flowing-document editor.
 *
 * Renders a report's ordered blocks: headings · paragraphs · widgets
 * (full or half width) · callouts · dividers · images. Click into a
 * prose block to edit inline; click between blocks to insert. Widget
 * blocks pick from AVAILABLE_WIDGETS for now (real widget-library
 * integration when persistence wires in).
 */
import {
  ChevronDown,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Info,
  Plus,
  Sparkles,
  Trash2,
  Type,
} from "lucide-react";
import { useState } from "react";
import { AVAILABLE_WIDGETS, useReports } from "./store";
import type {
  CalloutBlock,
  HeadingBlock,
  ImageBlock,
  ParagraphBlock,
  Report,
  ReportBlock,
  WidgetBlock,
} from "./types";

interface Props {
  report: Report;
}

export function Composer({ report }: Props) {
  const updateBlocks = useReports((s) => s.updateBlocks);
  const setShowAutoSummary = useReports((s) => s.setShowAutoSummary);

  const setBlock = (block: ReportBlock) => {
    const next = report.blocks.map((b) => (b.id === block.id ? block : b));
    updateBlocks(report.id, next);
  };

  const insertAt = (index: number, block: ReportBlock) => {
    const next = [
      ...report.blocks.slice(0, index),
      block,
      ...report.blocks.slice(index),
    ];
    updateBlocks(report.id, next);
  };

  const removeBlock = (id: string) =>
    updateBlocks(
      report.id,
      report.blocks.filter((b) => b.id !== id),
    );

  return (
    <article
      data-testid="report-composer"
      style={{
        maxWidth: 880,
        margin: "0 auto",
        background: "var(--color-bg-elev)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-8) var(--space-10)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
        minHeight: 600,
      }}
    >
      {report.showAutoSummary && (
        <AutoSummary onDismiss={() => setShowAutoSummary(report.id, false)} />
      )}

      <InsertRow onInsert={(b) => insertAt(0, b)} />

      {report.blocks.map((block, i) => (
        <div key={block.id}>
          <BlockRenderer
            block={block}
            onChange={setBlock}
            onRemove={() => removeBlock(block.id)}
          />
          <InsertRow onInsert={(b) => insertAt(i + 1, b)} />
        </div>
      ))}

      <footer
        style={{
          marginTop: "var(--space-6)",
          paddingTop: "var(--space-4)",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "var(--color-fg-subtle)",
          fontFamily: "var(--font-mono)",
        }}
      >
        <span>Acme · {report.folder ?? "Reports"}</span>
        <span>v{report.version} · generated at preview-time</span>
      </footer>
    </article>
  );
}

// ─── Auto summary ──────────────────────────────────────────────────
function AutoSummary({ onDismiss }: { onDismiss: () => void }) {
  return (
    <aside
      data-testid="auto-summary"
      style={{
        padding: "var(--space-4) var(--space-5)",
        background:
          "linear-gradient(180deg, rgba(34, 211, 238, 0.08), rgba(34, 211, 238, 0.02))",
        border: "1px solid rgba(34, 211, 238, 0.4)",
        borderRadius: "var(--radius-md)",
        display: "flex",
        gap: "var(--space-3)",
        alignItems: "flex-start",
      }}
    >
      <Sparkles
        size={16}
        style={{ color: "var(--color-primary)", flexShrink: 0, marginTop: 2 }}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-primary)",
            marginBottom: 4,
          }}
        >
          AI auto-summary
        </div>
        <p
          style={{
            margin: 0,
            fontSize: "var(--text-sm)",
            color: "var(--color-fg)",
            lineHeight: "var(--leading-relaxed)",
          }}
        >
          Revenue grew 14.2% in May, led by EU. Order volume held steady at
          ~9.6k while AOV ticked up 1.3%. One anomaly: EU revenue dropped 11% in
          W19 — flagged for review on the Sales overview dashboard.
        </p>
      </div>
      <button
        type="button"
        aria-label="Dismiss summary"
        onClick={onDismiss}
        style={{
          background: "transparent",
          border: "none",
          color: "var(--color-fg-subtle)",
          cursor: "pointer",
          fontSize: "var(--text-sm)",
          padding: 4,
        }}
      >
        ×
      </button>
    </aside>
  );
}

// ─── Insert row ────────────────────────────────────────────────────
function InsertRow({ onInsert }: { onInsert: (block: ReportBlock) => void }) {
  const [open, setOpen] = useState(false);
  const id = () => `blk-${Math.random().toString(36).slice(2, 9)}`;

  const items: Array<{
    id: ReportBlock["type"] | "h2" | "h3";
    label: string;
    icon: typeof Plus;
    create: () => ReportBlock;
  }> = [
    {
      id: "heading",
      label: "Heading 1",
      icon: Heading1,
      create: (): HeadingBlock => ({
        id: id(),
        type: "heading",
        level: 1,
        text: "Heading",
      }),
    },
    {
      id: "h2",
      label: "Heading 2",
      icon: Heading2,
      create: (): HeadingBlock => ({
        id: id(),
        type: "heading",
        level: 2,
        text: "Heading",
      }),
    },
    {
      id: "h3",
      label: "Heading 3",
      icon: Heading3,
      create: (): HeadingBlock => ({
        id: id(),
        type: "heading",
        level: 3,
        text: "Heading",
      }),
    },
    {
      id: "paragraph",
      label: "Paragraph",
      icon: Type,
      create: (): ParagraphBlock => ({
        id: id(),
        type: "paragraph",
        text: "Type here…",
      }),
    },
    {
      id: "widget",
      label: "Widget",
      icon: Plus,
      create: (): WidgetBlock => {
        const w = AVAILABLE_WIDGETS[0]!;
        return {
          id: id(),
          type: "widget",
          widgetId: w.id,
          widgetTitle: w.title,
          widgetTypeId: w.typeId,
          span: "full",
        };
      },
    },
    {
      id: "callout",
      label: "Callout",
      icon: Info,
      create: (): CalloutBlock => ({
        id: id(),
        type: "callout",
        tone: "info",
        text: "Important note",
      }),
    },
    {
      id: "image",
      label: "Image",
      icon: ImageIcon,
      create: (): ImageBlock => ({
        id: id(),
        type: "image",
        url: "",
        caption: "",
      }),
    },
    {
      id: "divider",
      label: "Divider",
      icon: Plus,
      create: () => ({ id: id(), type: "divider" }),
    },
  ];

  return (
    <div
      data-testid="insert-row"
      style={{
        display: "flex",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <button
        type="button"
        aria-label="Insert block"
        data-testid="insert-block-trigger"
        onClick={() => setOpen((o) => !o)}
        className="arc-insert-trigger"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "2px 8px",
          background: open ? "var(--color-primary)" : "var(--color-bg-subtle)",
          color: open ? "var(--color-primary-fg)" : "var(--color-fg-subtle)",
          border: "1px solid",
          borderColor: open ? "var(--color-primary)" : "var(--color-border)",
          borderRadius: "var(--radius-full)",
          fontSize: 11,
          fontFamily: "inherit",
          fontWeight: 600,
          cursor: "pointer",
          opacity: open ? 1 : 0.7,
        }}
      >
        <Plus size={11} />
        Insert
      </button>
      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: 26,
            zIndex: 5,
            background: "var(--color-bg-elev)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            padding: "var(--space-2)",
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(140px, 1fr))",
            gap: 2,
            minWidth: 320,
          }}
        >
          {items.map((it) => (
            <button
              key={it.id}
              type="button"
              role="menuitem"
              data-testid={`insert-${it.id}`}
              onClick={() => {
                onInsert(it.create());
                setOpen(false);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "var(--space-2) var(--space-3)",
                background: "transparent",
                border: "none",
                borderRadius: "var(--radius-sm)",
                color: "var(--color-fg)",
                fontFamily: "inherit",
                fontSize: "var(--text-sm)",
                cursor: "pointer",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-bg-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <it.icon size={13} style={{ color: "var(--color-fg-muted)" }} />
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Block renderer ────────────────────────────────────────────────
function BlockRenderer({
  block,
  onChange,
  onRemove,
}: {
  block: ReportBlock;
  onChange: (b: ReportBlock) => void;
  onRemove: () => void;
}) {
  return (
    <div
      data-testid={`block-${block.id}`}
      style={{ position: "relative", display: "flex", gap: "var(--space-2)" }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        {block.type === "heading" && (
          <HeadingEditor block={block} onChange={onChange} />
        )}
        {block.type === "paragraph" && (
          <ParagraphEditor block={block} onChange={onChange} />
        )}
        {block.type === "widget" && (
          <WidgetTile block={block} onChange={onChange} />
        )}
        {block.type === "callout" && (
          <CalloutEditor block={block} onChange={onChange} />
        )}
        {block.type === "image" && (
          <ImageEditor block={block} onChange={onChange} />
        )}
        {block.type === "divider" && (
          <hr
            style={{
              border: "none",
              borderTop: "1px solid var(--color-border)",
              margin: "var(--space-3) 0",
            }}
          />
        )}
      </div>
      <button
        type="button"
        aria-label="Remove block"
        onClick={onRemove}
        className="arc-block-remove"
        style={{
          flexShrink: 0,
          width: 24,
          height: 24,
          background: "transparent",
          border: "none",
          color: "var(--color-fg-subtle)",
          cursor: "pointer",
          opacity: 0.5,
          transition: "opacity var(--motion-fast) var(--ease)",
        }}
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

function HeadingEditor({
  block,
  onChange,
}: {
  block: HeadingBlock;
  onChange: (b: ReportBlock) => void;
}) {
  const fontSize =
    block.level === 1
      ? "var(--text-2xl)"
      : block.level === 2
        ? "var(--text-xl)"
        : "var(--text-lg)";
  return (
    <input
      type="text"
      value={block.text}
      onChange={(e) => onChange({ ...block, text: e.target.value })}
      aria-label={`Heading ${block.level}`}
      data-testid="heading-input"
      style={{
        width: "100%",
        background: "transparent",
        border: "none",
        outline: "none",
        fontFamily: "inherit",
        fontSize,
        fontWeight: 700,
        letterSpacing: "-0.02em",
        color: "var(--color-fg)",
        padding: "var(--space-2) 0",
      }}
    />
  );
}

function ParagraphEditor({
  block,
  onChange,
}: {
  block: ParagraphBlock;
  onChange: (b: ReportBlock) => void;
}) {
  return (
    <textarea
      value={block.text}
      onChange={(e) => onChange({ ...block, text: e.target.value })}
      aria-label="Paragraph"
      rows={Math.max(2, Math.ceil(block.text.length / 80))}
      style={{
        width: "100%",
        background: "transparent",
        border: "none",
        outline: "none",
        fontFamily: "inherit",
        fontSize: "var(--text-md)",
        color: "var(--color-fg)",
        lineHeight: "var(--leading-relaxed)",
        resize: "vertical",
        padding: "var(--space-2) 0",
      }}
    />
  );
}

function CalloutEditor({
  block,
  onChange,
}: {
  block: CalloutBlock;
  onChange: (b: ReportBlock) => void;
}) {
  const tone = TONE[block.tone];
  return (
    <div
      style={{
        display: "flex",
        gap: "var(--space-3)",
        padding: "var(--space-3) var(--space-4)",
        background: tone.bg,
        border: `1px solid ${tone.border}`,
        borderRadius: "var(--radius-md)",
        color: tone.fg,
      }}
    >
      <select
        value={block.tone}
        onChange={(e) =>
          onChange({ ...block, tone: e.target.value as CalloutBlock["tone"] })
        }
        aria-label="Callout tone"
        style={{
          fontSize: 11,
          fontFamily: "inherit",
          background: "transparent",
          border: `1px solid ${tone.border}`,
          color: "inherit",
          borderRadius: "var(--radius-sm)",
          padding: "0 6px",
          height: 22,
          marginTop: 2,
        }}
      >
        <option value="info">info</option>
        <option value="warn">warn</option>
        <option value="success">ok</option>
        <option value="danger">danger</option>
      </select>
      <textarea
        value={block.text}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        aria-label="Callout text"
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          fontFamily: "inherit",
          fontSize: "var(--text-sm)",
          color: "inherit",
          lineHeight: "var(--leading-relaxed)",
          resize: "vertical",
        }}
      />
    </div>
  );
}

function ImageEditor({
  block,
  onChange,
}: {
  block: ImageBlock;
  onChange: (b: ReportBlock) => void;
}) {
  return (
    <div
      style={{
        background: "var(--color-bg-subtle)",
        border: "1px dashed var(--color-border-strong)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      <input
        type="url"
        value={block.url}
        onChange={(e) => onChange({ ...block, url: e.target.value })}
        placeholder="Image URL"
        aria-label="Image URL"
        style={inputStyle}
      />
      <input
        type="text"
        value={block.caption ?? ""}
        onChange={(e) => onChange({ ...block, caption: e.target.value })}
        placeholder="Caption (optional)"
        aria-label="Image caption"
        style={inputStyle}
      />
      {block.url && (
        <img
          src={block.url}
          alt={block.caption ?? ""}
          style={{
            maxWidth: "100%",
            borderRadius: "var(--radius-sm)",
          }}
        />
      )}
    </div>
  );
}

function WidgetTile({
  block,
  onChange,
}: {
  block: WidgetBlock;
  onChange: (b: ReportBlock) => void;
}) {
  return (
    <div
      data-testid={`widget-block-${block.id}`}
      style={{
        background: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-3)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-2)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-fg-subtle)",
          }}
        >
          Widget · {block.widgetTypeId}
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <select
            value={block.widgetId}
            onChange={(e) => {
              const w = AVAILABLE_WIDGETS.find((x) => x.id === e.target.value);
              if (!w) return;
              onChange({
                ...block,
                widgetId: w.id,
                widgetTitle: w.title,
                widgetTypeId: w.typeId,
              });
            }}
            aria-label="Choose widget"
            style={inputStyle}
          >
            {AVAILABLE_WIDGETS.map((w) => (
              <option key={w.id} value={w.id}>
                {w.title}
              </option>
            ))}
          </select>
          <select
            value={block.span}
            onChange={(e) =>
              onChange({
                ...block,
                span: e.target.value as "full" | "half",
              })
            }
            aria-label="Width"
            style={{ ...inputStyle, width: 80 }}
          >
            <option value="full">Full</option>
            <option value="half">Half</option>
          </select>
        </div>
      </div>
      <div
        style={{
          height: block.span === "full" ? 200 : 140,
          background:
            "linear-gradient(135deg, rgba(34, 211, 238, 0.08), rgba(56, 189, 248, 0.04))",
          border: "1px dashed var(--color-border-strong)",
          borderRadius: "var(--radius-sm)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-fg-muted)",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
        }}
      >
        {block.widgetTitle}
      </div>
    </div>
  );
}

const TONE: Record<
  CalloutBlock["tone"],
  { bg: string; fg: string; border: string }
> = {
  info: {
    bg: "rgba(34, 211, 238, 0.08)",
    fg: "var(--color-primary)",
    border: "rgba(34, 211, 238, 0.4)",
  },
  warn: {
    bg: "rgba(251, 191, 36, 0.08)",
    fg: "var(--color-warning)",
    border: "rgba(251, 191, 36, 0.4)",
  },
  success: {
    bg: "rgba(52, 211, 153, 0.08)",
    fg: "var(--color-success)",
    border: "rgba(52, 211, 153, 0.4)",
  },
  danger: {
    bg: "rgba(248, 113, 113, 0.08)",
    fg: "var(--color-danger)",
    border: "rgba(248, 113, 113, 0.4)",
  },
};

const inputStyle: React.CSSProperties = {
  padding: "2px 6px",
  background: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  fontFamily: "inherit",
  fontSize: "var(--text-sm)",
  color: "var(--color-fg)",
};

// Suppress unused warning for ChevronDown (kept for future menu polish).
void ChevronDown;
