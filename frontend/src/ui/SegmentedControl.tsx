import type { ReactNode } from "react";

export interface Segment<T extends string> {
  value: T;
  label: ReactNode;
  ariaLabel?: string;
}

interface Props<T extends string> {
  value: T;
  segments: Segment<T>[];
  onChange: (next: T) => void;
}

export function SegmentedControl<T extends string>({
  value,
  segments,
  onChange,
}: Props<T>) {
  return (
    <div
      role="tablist"
      style={{
        display: "inline-flex",
        gap: 2,
        padding: 2,
        background: "var(--color-bg-subtle)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
      }}
    >
      {segments.map((s) => {
        const active = s.value === value;
        return (
          <button
            key={s.value}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={s.ariaLabel}
            onClick={() => onChange(s.value)}
            style={{
              border: "none",
              background: active ? "var(--color-bg)" : "transparent",
              color: active ? "var(--color-fg)" : "var(--color-fg-muted)",
              fontFamily: "inherit",
              fontSize: "var(--text-xs)",
              fontWeight: active ? 600 : 500,
              padding: "4px var(--space-3)",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              boxShadow: active ? "var(--shadow-sm)" : "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              transition: "background var(--motion-fast) var(--ease)",
            }}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
