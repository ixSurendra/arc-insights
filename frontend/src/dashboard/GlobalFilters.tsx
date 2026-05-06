import { Filter as FilterIcon, Plus } from "lucide-react";
import { useState } from "react";
import type { Filter } from "../builder/types";
import { FilterChip } from "../ui/FilterChip";

interface Props {
  filters: Filter[];
  /** Available column names from the dashboard's source tables. */
  columns: string[];
  onChange: (next: Filter[]) => void;
}

export function GlobalFilters({ filters, columns, onChange }: Props) {
  // Track the index of a chip that was just added so it opens in edit mode.
  const [pendingEditIdx, setPendingEditIdx] = useState<number | null>(null);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
        padding: "var(--space-2) var(--space-3)",
        background: "var(--color-bg-elev)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        marginBottom: "var(--space-5)",
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--color-fg-muted)",
          paddingRight: "var(--space-2)",
          borderRight: "1px solid var(--color-border)",
          marginRight: "var(--space-1)",
        }}
      >
        <FilterIcon size={12} />
        Filters
      </span>
      {filters.map((f, i) => (
        <FilterChip
          key={i}
          filter={f}
          columns={columns}
          startEditing={pendingEditIdx === i}
          onChange={(next) => {
            onChange(filters.map((g, j) => (j === i ? next : g)));
            setPendingEditIdx(null);
          }}
          onRemove={() => onChange(filters.filter((_, j) => j !== i))}
        />
      ))}
      <button
        type="button"
        onClick={() => {
          const next: Filter = {
            column: columns[0] ?? "",
            op: "=",
            value: "",
          };
          onChange([...filters, next]);
          setPendingEditIdx(filters.length);
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "0 var(--space-3)",
          height: 28,
          background: "transparent",
          border: "1px dashed var(--color-border-strong)",
          color: "var(--color-fg-muted)",
          borderRadius: "var(--radius-full)",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: "var(--text-sm)",
        }}
      >
        <Plus size={12} />
        Add filter
      </button>
      {filters.length > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          style={{
            marginLeft: "auto",
            background: "transparent",
            border: "none",
            color: "var(--color-info)",
            fontSize: "var(--text-sm)",
            fontWeight: 500,
            cursor: "pointer",
            padding: "0 var(--space-2)",
          }}
        >
          Clear all
        </button>
      )}
    </div>
  );
}
