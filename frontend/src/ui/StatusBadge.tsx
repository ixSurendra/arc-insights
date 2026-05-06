import type { ReactNode } from "react";

interface Props {
  /** "live" pulses; "ok" / "warn" / "danger" / "muted" stay still. */
  tone?: "live" | "ok" | "warn" | "danger" | "muted";
  children: ReactNode;
}

const TONE: Record<NonNullable<Props["tone"]>, string> = {
  live: "var(--color-success)",
  ok: "var(--color-success)",
  warn: "var(--color-warning)",
  danger: "var(--color-danger)",
  muted: "var(--color-fg-subtle)",
};

export function StatusBadge({ tone = "live", children }: Props) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-2)",
        padding: "4px var(--space-3)",
        background: "var(--color-bg-subtle)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-full)",
        fontSize: "var(--text-xs)",
        fontWeight: 500,
        color: "var(--color-fg-muted)",
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: TONE[tone],
          boxShadow: tone === "live" ? `0 0 0 0 ${TONE[tone]}99` : undefined,
          animation:
            tone === "live" ? "arc-pulse 1.6s ease-out infinite" : undefined,
          flexShrink: 0,
        }}
      />
      {children}
      <style>{`
        @keyframes arc-pulse {
          0% { box-shadow: 0 0 0 0 ${TONE[tone]}99; }
          70% { box-shadow: 0 0 0 6px transparent; }
          100% { box-shadow: 0 0 0 0 transparent; }
        }
      `}</style>
    </span>
  );
}
