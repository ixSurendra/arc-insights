/**
 * ChartCard — the chrome around a single chart on a dashboard.
 *
 * Eyebrow + title row, optional cost + menu on the right, the chart
 * body, and a meta footer (last refreshed · source · cache hit). The
 * Card primitive in ../ui is for general content; charts get their
 * own surface so the visual rhythm stays tight.
 */
import { MoreHorizontal } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { IconButton } from "../ui/IconButton";

interface Props {
  /** Small-caps subtitle row, e.g. "TIME SERIES · USD". */
  eyebrow?: string;
  title: string;
  /** Optional series legend rendered inline next to the title. */
  legend?: ReactNode;
  /** Per-query cost — rendered as a chip on the right (e.g. 0.004 → "$ $0.004"). */
  cost?: number;
  /** Footer line — "Refreshed 12s ago · warehouse·prod · cache hit". */
  meta?: string;
  /** Right-side icon menu trigger. */
  onMenu?: () => void;
  /** data-testid passthrough. */
  testId?: string;
  /** The chart body. */
  children: ReactNode;
  style?: CSSProperties;
}

export function ChartCard({
  eyebrow,
  title,
  legend,
  cost,
  meta,
  onMenu,
  testId,
  children,
  style,
}: Props) {
  return (
    <section
      data-testid={testId}
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--color-bg-elev)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
        ...style,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "var(--space-3)",
          padding: "var(--space-4) var(--space-5) 0",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          {eyebrow && (
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--color-fg-subtle)",
                marginBottom: "var(--space-1)",
              }}
            >
              {eyebrow}
            </div>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              flexWrap: "wrap",
            }}
          >
            <h3
              style={{
                fontSize: "var(--text-md)",
                fontWeight: 600,
                margin: 0,
                color: "var(--color-fg)",
              }}
            >
              {title}
            </h3>
            {legend && <div style={{ minWidth: 0 }}>{legend}</div>}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            flexShrink: 0,
          }}
        >
          {typeof cost === "number" && <CostChip cost={cost} />}
          {onMenu && (
            <IconButton aria-label="More" size="sm" onClick={onMenu}>
              <MoreHorizontal size={14} />
            </IconButton>
          )}
        </div>
      </header>

      <div style={{ padding: "var(--space-3) var(--space-5)", minWidth: 0 }}>
        {children}
      </div>

      {meta && (
        <footer
          style={{
            padding: "var(--space-2) var(--space-5) var(--space-3)",
            fontSize: 11,
            color: "var(--color-fg-subtle)",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          {meta}
        </footer>
      )}
    </section>
  );
}

function CostChip({ cost }: { cost: number }) {
  const display = cost < 0.01 ? `$${cost.toFixed(3)}` : `$${cost.toFixed(2)}`;
  return (
    <span
      title={`Estimated query cost: ${display}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: "var(--color-bg-subtle)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "2px var(--space-2)",
        fontSize: 11,
        fontFamily: "var(--font-mono)",
        color: "var(--color-fg-muted)",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ color: "var(--color-success)" }}>$</span>
      {display}
    </span>
  );
}

/** Tiny inline legend — pairs each series name with a colored dot. */
export function ChartLegend({
  items,
}: {
  items: Array<{ name: string; color: string }>;
}) {
  return (
    <ul
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-3)",
        margin: 0,
        padding: 0,
        listStyle: "none",
        fontSize: 12,
        color: "var(--color-fg-muted)",
      }}
    >
      {items.map((it) => (
        <li
          key={it.name}
          style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
        >
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: it.color,
              display: "inline-block",
            }}
          />
          {it.name}
        </li>
      ))}
    </ul>
  );
}
