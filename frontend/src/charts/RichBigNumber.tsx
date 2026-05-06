/**
 * RichBigNumber — the upgraded dashboard variant of the big-number card.
 *
 * Adds eyebrow label, delta pill with directional arrow, inline sparkline,
 * and a three-up sub-stats row. Used by the dashboard 'total revenue' card
 * to match the SaaS-grade reference design. The simpler `BigNumber` in
 * ./BigNumber.tsx remains for the builder live preview and table chart
 * type.
 */
import { ArrowDown, ArrowUp } from "lucide-react";
import { useMemo } from "react";

interface SubStat {
  label: string;
  value: string;
}

interface Props {
  eyebrow?: string;
  /** Heading above the big number, e.g. "Total revenue". */
  label: string;
  /** Pre-formatted big number, e.g. "$405k". */
  value: string;
  /** Pre-formatted delta, e.g. "+14.2%". `direction` controls colors + arrow. */
  delta?: string;
  deltaDirection?: "up" | "down" | "flat";
  deltaSuffix?: string;
  /** Numeric series to plot as an inline sparkline. */
  sparkline?: number[];
  /** Three sub-stats rendered in a row beneath. */
  subStats?: SubStat[];
  testId?: string;
}

export function RichBigNumber({
  eyebrow,
  label,
  value,
  delta,
  deltaDirection = "flat",
  deltaSuffix,
  sparkline,
  subStats,
  testId,
}: Props) {
  return (
    <div
      data-testid={testId}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      {eyebrow && (
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--color-fg-subtle)",
          }}
        >
          {eyebrow}
        </div>
      )}
      <div
        style={{
          fontSize: "var(--text-md)",
          fontWeight: 500,
          color: "var(--color-fg-muted)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "var(--space-3)",
        }}
      >
        <div
          style={{
            fontSize: 44,
            lineHeight: 1,
            fontWeight: 700,
            color: "var(--color-fg)",
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </div>
        {sparkline && sparkline.length > 1 && (
          <Sparkline values={sparkline} direction={deltaDirection} />
        )}
      </div>
      {delta && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          <DeltaPill direction={deltaDirection} value={delta} />
          {deltaSuffix && (
            <span
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-fg-muted)",
              }}
            >
              {deltaSuffix}
            </span>
          )}
        </div>
      )}
      {subStats && subStats.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${subStats.length}, minmax(0, 1fr))`,
            gap: "var(--space-3)",
            marginTop: "var(--space-2)",
            paddingTop: "var(--space-3)",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          {subStats.map((s) => (
            <div key={s.label}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--color-fg-subtle)",
                  marginBottom: 2,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: "var(--text-md)",
                  fontWeight: 600,
                  color: "var(--color-fg)",
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DeltaPill({
  direction,
  value,
}: {
  direction: "up" | "down" | "flat";
  value: string;
}) {
  const tone =
    direction === "up"
      ? { bg: "rgba(22, 163, 74, 0.12)", fg: "var(--color-success)" }
      : direction === "down"
        ? { bg: "rgba(220, 38, 38, 0.12)", fg: "var(--color-danger)" }
        : { bg: "var(--color-bg-subtle)", fg: "var(--color-fg-muted)" };
  const Icon = direction === "down" ? ArrowDown : ArrowUp;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px var(--space-2)",
        borderRadius: "var(--radius-full)",
        background: tone.bg,
        color: tone.fg,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {direction !== "flat" && <Icon size={12} />}
      {value}
    </span>
  );
}

function Sparkline({
  values,
  direction,
}: {
  values: number[];
  direction: "up" | "down" | "flat";
}) {
  const { d, w, h } = useMemo(() => {
    const w = 100;
    const h = 32;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const step = w / (values.length - 1);
    const points = values.map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });
    return {
      d: `M ${points.join(" L ")}`,
      w,
      h,
    };
  }, [values]);

  const stroke =
    direction === "down" ? "var(--color-danger)" : "var(--color-success)";
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      style={{ flexShrink: 0 }}
      aria-hidden
    >
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
