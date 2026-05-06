/**
 * Three-door entry tabs for the widget builder. The locked spec gives
 * tenants three equal paths into the same configurator: Ask AI · Visual
 * · SQL. Switching doors swaps the data zone (left) only — preview and
 * options stay where they are so chart-type and formatting choices
 * survive a door switch.
 */
import { Code2, Database, Sparkles } from "lucide-react";

export type Door = "ai" | "visual" | "sql";

interface Props {
  active: Door;
  onSelect: (door: Door) => void;
}

const DOORS: Array<{ id: Door; label: string; icon: typeof Sparkles }> = [
  { id: "ai", label: "Ask AI", icon: Sparkles },
  { id: "visual", label: "Visual", icon: Database },
  { id: "sql", label: "SQL", icon: Code2 },
];

export function DoorTabs({ active, onSelect }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Widget builder doors"
      style={{
        display: "inline-flex",
        gap: 2,
        padding: 2,
        background: "var(--color-bg-subtle)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
      }}
    >
      {DOORS.map((d) => {
        const Icon = d.icon;
        const isActive = d.id === active;
        return (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-testid={`door-${d.id}`}
            onClick={() => onSelect(d.id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              background: isActive ? "var(--color-bg)" : "transparent",
              color: isActive
                ? d.id === "ai"
                  ? "var(--color-primary)"
                  : "var(--color-fg)"
                : "var(--color-fg-muted)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              fontFamily: "inherit",
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: isActive ? "var(--shadow-sm)" : "none",
              transition:
                "background var(--motion-fast) var(--ease), color var(--motion-fast) var(--ease)",
            }}
          >
            <Icon size={13} />
            {d.label}
            {isActive && d.id === "ai" && (
              <span
                aria-hidden
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--color-primary)",
                  boxShadow: "0 0 0 3px rgba(34, 211, 238, 0.18)",
                  marginLeft: 2,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
