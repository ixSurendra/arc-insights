import { Trash2 } from "lucide-react";
import { useMemo } from "react";
import { Button } from "../ui/Button";
import { BuilderSection, inputStyle, rowStyle } from "./BuilderSection";
import { SAMPLE_TABLES } from "./sample-schema";
import type {
  Aggregate,
  Dimension,
  Filter,
  FilterOp,
  Granularity,
  Measure,
  Order,
  QuerySpec,
  SchemaTable,
} from "./types";

const AGGREGATES: Aggregate[] = [
  "sum",
  "count",
  "count_distinct",
  "avg",
  "min",
  "max",
];
const GRANULARITIES: Array<
  { value: ""; label: string } | { value: Granularity; label: string }
> = [
  { value: "", label: "raw" },
  { value: "day", label: "day" },
  { value: "week", label: "week" },
  { value: "month", label: "month" },
  { value: "quarter", label: "quarter" },
  { value: "year", label: "year" },
];
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

interface Props {
  table: SchemaTable;
  spec: QuerySpec;
  onChange: (next: QuerySpec) => void;
  onTableChange: (next: SchemaTable) => void;
}

export function QueryBuilder({ table, spec, onChange, onTableChange }: Props) {
  const columns = table.columns;
  const numericColumns = useMemo(
    () =>
      columns.filter((c) =>
        ["number", "boolean", "datetime"].includes(c.inferredKind),
      ),
    [columns],
  );

  // ─── Helpers ──────────────────────────────────────────────────────
  const updateDim = (idx: number, patch: Partial<Dimension>) => {
    onChange({
      ...spec,
      dimensions: spec.dimensions.map((d, i) =>
        i === idx ? { ...d, ...patch } : d,
      ),
    });
  };
  const updateMeasure = (idx: number, patch: Partial<Measure>) => {
    onChange({
      ...spec,
      measures: spec.measures.map((m, i) =>
        i === idx ? { ...m, ...patch } : m,
      ),
    });
  };
  const updateFilter = (idx: number, patch: Partial<Filter>) => {
    onChange({
      ...spec,
      filters: spec.filters.map((f, i) => (i === idx ? { ...f, ...patch } : f)),
    });
  };
  const updateOrder = (idx: number, patch: Partial<Order>) => {
    onChange({
      ...spec,
      orderBy: spec.orderBy.map((o, i) => (i === idx ? { ...o, ...patch } : o)),
    });
  };
  const removeAt = <K extends keyof QuerySpec>(field: K, idx: number) => {
    onChange({
      ...spec,
      [field]: (spec[field] as unknown[]).filter((_, i) => i !== idx),
    } as QuerySpec);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
      }}
    >
      {/* Table picker */}
      <BuilderSection title="From">
        <div style={rowStyle}>
          <select
            style={inputStyle}
            value={`${table.schema}.${table.name}`}
            onChange={(e) => {
              const [schema, name] = e.target.value.split(".");
              const next = SAMPLE_TABLES.find(
                (t) => t.schema === schema && t.name === name,
              );
              if (next) {
                onTableChange(next);
                onChange({
                  ...spec,
                  from: { schema: next.schema, table: next.name },
                  dimensions: [],
                  measures: [],
                  filters: [],
                  orderBy: [],
                });
              }
            }}
          >
            {SAMPLE_TABLES.map((t) => (
              <option
                key={`${t.schema}.${t.name}`}
                value={`${t.schema}.${t.name}`}
              >
                {t.schema}.{t.name}
              </option>
            ))}
          </select>
        </div>
      </BuilderSection>

      {/* Dimensions */}
      <BuilderSection
        title="Dimensions"
        description="Group rows by these columns. Datetime columns can be bucketed."
        onAdd={() =>
          onChange({
            ...spec,
            dimensions: [...spec.dimensions, { column: columns[0]!.name }],
          })
        }
      >
        {spec.dimensions.length === 0 && (
          <Hint>No dimensions yet — Add one or leave empty for ungrouped.</Hint>
        )}
        {spec.dimensions.map((d, i) => {
          const col = columns.find((c) => c.name === d.column);
          const isDatetime = col?.inferredKind === "datetime";
          return (
            <div key={i} style={rowStyle}>
              <select
                style={inputStyle}
                value={d.column}
                onChange={(e) => updateDim(i, { column: e.target.value })}
              >
                {columns.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              {isDatetime && (
                <select
                  style={{ ...inputStyle, flex: "0 0 110px" }}
                  value={d.granularity ?? ""}
                  onChange={(e) =>
                    updateDim(i, {
                      granularity: e.target.value
                        ? (e.target.value as Granularity)
                        : undefined,
                    })
                  }
                >
                  {GRANULARITIES.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              )}
              <RemoveButton onClick={() => removeAt("dimensions", i)} />
            </div>
          );
        })}
      </BuilderSection>

      {/* Measures */}
      <BuilderSection
        title="Measures"
        description="Aggregate columns. count(*) is the only valid wildcard."
        onAdd={() =>
          onChange({
            ...spec,
            measures: [
              ...spec.measures,
              {
                column: numericColumns[0]?.name ?? "*",
                agg: numericColumns[0] ? "sum" : "count",
              },
            ],
          })
        }
      >
        {spec.measures.length === 0 && (
          <Hint>No measures — the query returns rows unaggregated.</Hint>
        )}
        {spec.measures.map((m, i) => (
          <div key={i} style={rowStyle}>
            <select
              style={{ ...inputStyle, flex: "0 0 130px" }}
              value={m.agg}
              onChange={(e) =>
                updateMeasure(i, { agg: e.target.value as Aggregate })
              }
            >
              {AGGREGATES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <select
              style={inputStyle}
              value={m.column}
              onChange={(e) => updateMeasure(i, { column: e.target.value })}
            >
              <option value="*">* (count only)</option>
              {columns.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <RemoveButton onClick={() => removeAt("measures", i)} />
          </div>
        ))}
      </BuilderSection>

      {/* Filters */}
      <BuilderSection
        title="Filters"
        description="Predicates are AND-ed together."
        onAdd={() =>
          onChange({
            ...spec,
            filters: [
              ...spec.filters,
              { column: columns[0]!.name, op: "=", value: "" },
            ],
          })
        }
      >
        {spec.filters.length === 0 && (
          <Hint>No filters — all rows pass through.</Hint>
        )}
        {spec.filters.map((f, i) => {
          const noValue = f.op === "is_null" || f.op === "is_not_null";
          const isMulti = f.op === "in" || f.op === "not_in";
          return (
            <div key={i} style={rowStyle}>
              <select
                style={{ ...inputStyle, flex: "0 0 130px" }}
                value={f.column}
                onChange={(e) => updateFilter(i, { column: e.target.value })}
              >
                {columns.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                style={{ ...inputStyle, flex: "0 0 110px" }}
                value={f.op}
                onChange={(e) => {
                  const nextOp = e.target.value as FilterOp;
                  const nextValue =
                    nextOp === "is_null" || nextOp === "is_not_null"
                      ? undefined
                      : nextOp === "in" || nextOp === "not_in"
                        ? []
                        : "";
                  updateFilter(i, { op: nextOp, value: nextValue });
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
                  style={inputStyle}
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
                    updateFilter(i, { value: next });
                  }}
                />
              )}
              <RemoveButton onClick={() => removeAt("filters", i)} />
            </div>
          );
        })}
      </BuilderSection>

      {/* Order by */}
      <BuilderSection
        title="Order"
        onAdd={() =>
          onChange({
            ...spec,
            orderBy: [
              ...spec.orderBy,
              { column: columns[0]!.name, direction: "asc" },
            ],
          })
        }
      >
        {spec.orderBy.length === 0 && <Hint>Result order is unspecified.</Hint>}
        {spec.orderBy.map((o, i) => (
          <div key={i} style={rowStyle}>
            <select
              style={inputStyle}
              value={o.column}
              onChange={(e) => updateOrder(i, { column: e.target.value })}
            >
              {columns.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              style={{ ...inputStyle, flex: "0 0 90px" }}
              value={o.direction}
              onChange={(e) =>
                updateOrder(i, {
                  direction: e.target.value as "asc" | "desc",
                })
              }
            >
              <option value="asc">asc</option>
              <option value="desc">desc</option>
            </select>
            <RemoveButton onClick={() => removeAt("orderBy", i)} />
          </div>
        ))}
      </BuilderSection>

      {/* Limit */}
      <BuilderSection title="Limit">
        <div style={rowStyle}>
          <input
            style={{ ...inputStyle, flex: "0 0 120px" }}
            type="number"
            min={1}
            max={10000}
            value={spec.limit}
            onChange={(e) => {
              const n = Number(e.target.value);
              onChange({
                ...spec,
                limit: Number.isFinite(n)
                  ? Math.min(10000, Math.max(1, n))
                  : 1000,
              });
            }}
          />
          <span
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-fg-muted)",
            }}
          >
            max 10,000
          </span>
        </div>
      </BuilderSection>
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "var(--text-xs)",
        color: "var(--color-fg-subtle)",
        fontStyle: "italic",
      }}
    >
      {children}
    </div>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={onClick}
      aria-label="Remove"
      style={{ flex: "0 0 auto", padding: "0 var(--space-2)" }}
    >
      <Trash2 size={14} />
    </Button>
  );
}
