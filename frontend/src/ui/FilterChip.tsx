import { Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Filter, FilterOp } from "../builder/types";

const OP_SYMBOL: Record<FilterOp, string> = {
  "=": "=",
  "!=": "≠",
  "<": "<",
  "<=": "≤",
  ">": ">",
  ">=": "≥",
  in: "in",
  not_in: "not in",
  is_null: "is null",
  is_not_null: "is not null",
  like: "like",
};

const OPS: FilterOp[] = [
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

interface Props {
  filter: Filter;
  columns: string[];
  onChange: (next: Filter) => void;
  onRemove: () => void;
  /** Open in edit mode immediately (used for newly-added chips). */
  startEditing?: boolean;
}

export function FilterChip({
  filter,
  columns,
  onChange,
  onRemove,
  startEditing = false,
}: Props) {
  const [editing, setEditing] = useState(startEditing);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click-outside.
  useEffect(() => {
    if (!editing) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setEditing(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [editing]);

  if (!editing) {
    return (
      <ChipDisplay
        filter={filter}
        onClick={() => setEditing(true)}
        onRemove={onRemove}
      />
    );
  }

  return (
    <div ref={ref} style={{ display: "inline-flex" }}>
      <ChipEditor
        filter={filter}
        columns={columns}
        onChange={onChange}
        onClose={() => setEditing(false)}
      />
    </div>
  );
}

function ChipDisplay({
  filter,
  onClick,
  onRemove,
}: {
  filter: Filter;
  onClick: () => void;
  onRemove: () => void;
}) {
  const noValue = filter.op === "is_null" || filter.op === "is_not_null";
  const valueDisplay = Array.isArray(filter.value)
    ? filter.value.join(", ")
    : filter.value === undefined || filter.value === null
      ? ""
      : String(filter.value);
  return (
    <span
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0,
        background: "var(--color-bg-elev)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-full)",
        padding: 0,
        height: 28,
        fontSize: "var(--text-sm)",
        cursor: "pointer",
        overflow: "hidden",
        transition: "border-color var(--motion-fast) var(--ease)",
      }}
    >
      <span
        style={{
          padding: "0 var(--space-2) 0 var(--space-3)",
          color: "var(--color-fg)",
          fontWeight: 500,
        }}
      >
        {filter.column}
      </span>
      <span
        style={{
          padding: "0 var(--space-2)",
          color: "var(--color-fg-muted)",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
        }}
      >
        {OP_SYMBOL[filter.op]}
      </span>
      {!noValue && (
        <span
          style={{
            padding: "0 var(--space-2)",
            color: "var(--color-fg)",
            fontWeight: 500,
            maxWidth: 220,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {valueDisplay || (
            <em style={{ color: "var(--color-fg-subtle)" }}>—</em>
          )}
        </span>
      )}
      <button
        type="button"
        aria-label="Remove filter"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          width: 28,
          border: "none",
          borderLeft: "1px solid var(--color-border)",
          background: "transparent",
          color: "var(--color-fg-muted)",
          cursor: "pointer",
          transition: "background var(--motion-fast) var(--ease)",
        }}
      >
        <X size={12} />
      </button>
    </span>
  );
}

const inputStyle: React.CSSProperties = {
  height: 28,
  padding: "0 var(--space-2)",
  background: "var(--color-bg)",
  color: "var(--color-fg)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  fontFamily: "inherit",
  fontSize: "var(--text-sm)",
};

const ChipEditor = ({
  filter,
  columns,
  onChange,
  onClose,
}: {
  filter: Filter;
  columns: string[];
  onChange: (next: Filter) => void;
  onClose: () => void;
}) => {
  const noValue = filter.op === "is_null" || filter.op === "is_not_null";
  const isMulti = filter.op === "in" || filter.op === "not_in";
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: "var(--color-bg-elev)",
        border: "1px solid var(--color-primary)",
        borderRadius: "var(--radius-md)",
        padding: 2,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <select
        style={{ ...inputStyle, width: 110 }}
        value={filter.column}
        onChange={(e) => onChange({ ...filter, column: e.target.value })}
      >
        {columns.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        style={{ ...inputStyle, width: 90 }}
        value={filter.op}
        onChange={(e) => {
          const nextOp = e.target.value as FilterOp;
          const nextValue =
            nextOp === "is_null" || nextOp === "is_not_null"
              ? undefined
              : nextOp === "in" || nextOp === "not_in"
                ? []
                : "";
          onChange({ ...filter, op: nextOp, value: nextValue });
        }}
      >
        {OPS.map((op) => (
          <option key={op} value={op}>
            {OP_SYMBOL[op]}
          </option>
        ))}
      </select>
      {!noValue && (
        <input
          style={{ ...inputStyle, width: 160 }}
          placeholder={isMulti ? "comma-separated" : "value"}
          value={
            Array.isArray(filter.value)
              ? filter.value.join(", ")
              : filter.value === undefined || filter.value === null
                ? ""
                : String(filter.value)
          }
          onChange={(e) => {
            const raw = e.target.value;
            const next = isMulti
              ? raw
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              : raw;
            onChange({ ...filter, value: next });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") onClose();
          }}
        />
      )}
      <button
        type="button"
        aria-label="Done"
        onClick={onClose}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          border: "none",
          background: "var(--color-primary)",
          color: "var(--color-primary-fg)",
          borderRadius: "var(--radius-sm)",
          cursor: "pointer",
        }}
      >
        <Check size={14} />
      </button>
    </div>
  );
};
