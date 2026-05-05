import { Plus, Trash2, X } from "lucide-react";
import { inputStyle, rowStyle } from "../builder/BuilderSection";
import type { Filter, FilterOp } from "../builder/types";
import { Button } from "../ui/Button";

interface Props {
  filters: Filter[];
  /** Available column names from the dashboard's source tables. */
  columns: string[];
  onChange: (next: Filter[]) => void;
}

const FILTER_OPS: FilterOp[] = [
  "=",
  "!=",
  "<",
  "<=",
  ">",
  ">=",
  "in",
  "not_in",
  "is_null",
  "is_not_null",
  "like",
];

export function GlobalFilters({ filters, columns, onChange }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-3) var(--space-4)",
        background: "var(--color-bg-elev)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        marginBottom: "var(--space-5)",
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          fontSize: "var(--text-xs)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "var(--color-fg-muted)",
        }}
      >
        Filters
      </span>
      {filters.length === 0 && (
        <span
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-fg-subtle)",
          }}
        >
          None — every row passes through.
        </span>
      )}
      {filters.map((f, i) => {
        const noValue = f.op === "is_null" || f.op === "is_not_null";
        const isMulti = f.op === "in" || f.op === "not_in";
        return (
          <div key={i} style={{ ...rowStyle, gap: "var(--space-1)" }}>
            <select
              style={{ ...inputStyle, flex: "0 0 130px" }}
              value={f.column}
              onChange={(e) =>
                onChange(
                  filters.map((g, j) =>
                    j === i ? { ...g, column: e.target.value } : g,
                  ),
                )
              }
            >
              {columns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              style={{ ...inputStyle, flex: "0 0 90px" }}
              value={f.op}
              onChange={(e) => {
                const nextOp = e.target.value as FilterOp;
                const nextValue =
                  nextOp === "is_null" || nextOp === "is_not_null"
                    ? undefined
                    : nextOp === "in" || nextOp === "not_in"
                      ? []
                      : "";
                onChange(
                  filters.map((g, j) =>
                    j === i ? { ...g, op: nextOp, value: nextValue } : g,
                  ),
                );
              }}
            >
              {FILTER_OPS.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
            {!noValue && (
              <input
                style={{ ...inputStyle, flex: "0 0 160px" }}
                placeholder={isMulti ? "comma-separated" : "value"}
                value={
                  Array.isArray(f.value)
                    ? f.value.join(", ")
                    : f.value === undefined || f.value === null
                      ? ""
                      : String(f.value)
                }
                onChange={(e) => {
                  const raw = e.target.value;
                  const next = isMulti
                    ? raw
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    : raw;
                  onChange(
                    filters.map((g, j) =>
                      j === i ? { ...g, value: next } : g,
                    ),
                  );
                }}
              />
            )}
            <button
              type="button"
              aria-label="Remove filter"
              onClick={() => onChange(filters.filter((_, j) => j !== i))}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-fg-muted)",
                cursor: "pointer",
                padding: "var(--space-1)",
                display: "flex",
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
      <Button
        size="sm"
        variant="ghost"
        iconLeft={<Plus size={14} />}
        onClick={() =>
          onChange([
            ...filters,
            { column: columns[0] ?? "", op: "=", value: "" },
          ])
        }
      >
        Add filter
      </Button>
      {filters.length > 0 && (
        <Button
          size="sm"
          variant="ghost"
          iconLeft={<Trash2 size={14} />}
          onClick={() => onChange([])}
          style={{ marginLeft: "auto" }}
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
