/**
 * Cell — the chrome around any single notebook cell. Renders the
 * left-edge type chip, drag handle, run-status dot, hover action menu,
 * body, and optional footer (source · cost · refreshed).
 *
 * The body is type-specific (text / SQL / chart / big number) and
 * rendered by sibling components; this just paints the frame.
 */
import { GripVertical, MoreHorizontal, Play } from "lucide-react";
import type { ReactNode } from "react";
import type { CellType, NotebookCell } from "./types";

const CELL_LABEL: Record<CellType, string> = {
  text: "Markdown",
  sql: "SQL",
  chart: "Chart",
  big_number: "Big Number",
};

const CELL_COLOR_VAR: Record<CellType, string> = {
  text: "var(--color-cell-markdown)",
  sql: "var(--color-cell-sql)",
  chart: "var(--color-cell-chart)",
  big_number: "var(--color-cell-chart)",
};

interface Props {
  cell: NotebookCell;
  /** Heading of the cell — defaults to type label if no title set. */
  children: ReactNode;
  /** Optional inline run button (SQL cells, chart cells). */
  onRun?: () => void;
  testId?: string;
}

export function Cell({ cell, children, onRun, testId }: Props) {
  const accent = CELL_COLOR_VAR[cell.type];

  return (
    <article
      data-testid={testId ?? `cell-${cell.id}`}
      data-cell-type={cell.type}
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "var(--layout-cell-gutter) 1fr",
        background: "var(--color-bg-elev)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        marginBottom: "var(--space-4)",
        transition: "border-color var(--motion-fast) var(--ease)",
      }}
    >
      {/* Left runner: drag handle + type chip + run state */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-3)",
          padding: "var(--space-3) 0",
          borderRight: "1px solid var(--color-border)",
          background: "var(--color-bg)",
          borderTopLeftRadius: "var(--radius-lg)",
          borderBottomLeftRadius: "var(--radius-lg)",
        }}
      >
        <GripVertical
          size={14}
          style={{
            color: "var(--color-fg-subtle)",
            cursor: "grab",
          }}
          aria-label="Drag to reorder"
        />
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2px 6px",
            background: `${accent}1f`,
            color: accent,
            borderRadius: "var(--radius-sm)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            whiteSpace: "nowrap",
            lineHeight: 1,
          }}
        >
          {CELL_LABEL[cell.type]}
        </span>
        <StatusDot status={cell.status} accent={accent} />
        {onRun && (
          <button
            type="button"
            aria-label="Run cell"
            onClick={onRun}
            style={{
              width: 28,
              height: 28,
              border: "none",
              background: "transparent",
              color: accent,
              borderRadius: "50%",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background var(--motion-fast) var(--ease)",
            }}
          >
            <Play size={14} fill="currentColor" />
          </button>
        )}
      </div>

      {/* Right: title row + body */}
      <div style={{ minWidth: 0, padding: "var(--space-4) var(--space-5)" }}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--space-3)",
            marginBottom: cell.title ? "var(--space-3)" : 0,
          }}
        >
          {cell.title && (
            <h3
              style={{
                margin: 0,
                fontSize: "var(--text-md)",
                fontWeight: 600,
                color: "var(--color-fg)",
              }}
            >
              {cell.title}
            </h3>
          )}
          <button
            type="button"
            aria-label="Cell actions"
            style={{
              marginLeft: "auto",
              width: 24,
              height: 24,
              border: "none",
              background: "transparent",
              color: "var(--color-fg-subtle)",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MoreHorizontal size={14} />
          </button>
        </header>

        <div style={{ minWidth: 0 }}>{children}</div>

        {(cell.refreshedLabel || cell.cost !== undefined || cell.source) && (
          <footer
            style={{
              marginTop: "var(--space-3)",
              paddingTop: "var(--space-2)",
              borderTop: "1px solid var(--color-border)",
              fontSize: 11,
              color: "var(--color-fg-subtle)",
              display: "flex",
              gap: "var(--space-3)",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {cell.refreshedLabel && <span>{cell.refreshedLabel}</span>}
            {cell.source && (
              <>
                <span
                  aria-hidden
                  style={{ color: "var(--color-border-strong)" }}
                >
                  ·
                </span>
                <span style={{ fontFamily: "var(--font-mono)" }}>
                  {cell.source}
                </span>
              </>
            )}
            {cell.cost !== undefined && (
              <>
                <span
                  aria-hidden
                  style={{ color: "var(--color-border-strong)" }}
                >
                  ·
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-success)",
                  }}
                >
                  $
                  {cell.cost < 0.01
                    ? cell.cost.toFixed(3)
                    : cell.cost.toFixed(2)}
                </span>
              </>
            )}
            {cell.status === "ok" && (
              <span
                style={{
                  marginLeft: "auto",
                  color: "var(--color-success)",
                  fontWeight: 500,
                }}
              >
                cache hit
              </span>
            )}
          </footer>
        )}
      </div>
    </article>
  );
}

function StatusDot({
  status,
  accent,
}: {
  status?: NotebookCell["status"];
  accent: string;
}) {
  const color =
    status === "running"
      ? accent
      : status === "error"
        ? "var(--color-danger)"
        : status === "stale"
          ? "var(--color-warning)"
          : "var(--color-success)";
  return (
    <span
      aria-hidden
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        boxShadow: status === "running" ? `0 0 0 4px ${accent}33` : undefined,
      }}
    />
  );
}
