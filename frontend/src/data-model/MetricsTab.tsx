/**
 * Data Model — Metrics & calculations tab.
 *
 * Defines named metrics that are referenced everywhere by name. The
 * no-code builder covers count / sum / avg / count_distinct / ratio;
 * the SQL escape hatch handles anything else. Metrics list shows
 * usage count so tenants see which definitions are load-bearing.
 */
import { Plus, Sigma, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { useDataModel } from "./store";
import type {
  FieldType,
  MetricDefinition,
  MetricKind,
  ModelTable,
} from "./types";

const KIND_LABEL: Record<MetricKind, string> = {
  count: "Count",
  sum: "Sum",
  avg: "Average",
  count_distinct: "Count distinct",
  ratio: "Ratio",
  sql: "SQL expression",
};

const FIELD_TYPES: FieldType[] = [
  "integer",
  "float",
  "currency",
  "percent",
  "string",
];

export function MetricsTab() {
  const metrics = useDataModel((s) => s.model.metrics);
  const removeMetric = useDataModel((s) => s.removeMetric);
  const tables = useDataModel((s) => s.model.tables);
  const [editing, setEditing] = useState<MetricDefinition | "new" | null>(null);

  return (
    <div data-testid="metrics-tab">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-3)",
        }}
      >
        <span
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-fg-muted)",
          }}
        >
          {metrics.length} metric{metrics.length === 1 ? "" : "s"} defined ·
          referenced from widgets, AI, and SQL autocomplete
        </span>
        <Button
          variant="primary"
          iconLeft={<Plus size={14} />}
          onClick={() => setEditing("new")}
        >
          New metric
        </Button>
      </div>

      <Card padded={false}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr 0.6fr 0.6fr",
            gap: "var(--space-4)",
            padding: "var(--space-3) var(--space-4)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--color-fg-subtle)",
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-bg-subtle)",
          }}
        >
          <span>Name</span>
          <span>Kind</span>
          <span>Source</span>
          <span>Used in</span>
          <span></span>
        </div>
        {metrics.length === 0 && (
          <div
            style={{
              padding: "var(--space-8)",
              textAlign: "center",
              color: "var(--color-fg-muted)",
            }}
          >
            No metrics yet. Define one to share its logic across every
            dashboard, report, and AI prompt.
          </div>
        )}
        {metrics.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setEditing(m)}
            data-testid={`metric-${m.id}`}
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr 1fr 0.6fr 0.6fr",
              gap: "var(--space-4)",
              padding: "var(--space-3) var(--space-4)",
              alignItems: "center",
              border: "none",
              borderBottom: "1px solid var(--color-border)",
              background: "transparent",
              fontFamily: "inherit",
              color: "var(--color-fg)",
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
            }}
          >
            <span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  fontWeight: 600,
                  fontSize: "var(--text-sm)",
                }}
              >
                <Sigma size={12} style={{ color: "var(--color-primary)" }} />
                {m.name}
              </span>
              {m.description && (
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-fg-muted)",
                    marginTop: 2,
                  }}
                >
                  {m.description}
                </div>
              )}
            </span>
            <span style={{ fontSize: "var(--text-sm)" }}>
              {KIND_LABEL[m.kind]}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--color-fg-muted)",
              }}
            >
              {sourceText(m)}
            </span>
            <span
              style={{
                fontSize: 11,
                color: "var(--color-fg-subtle)",
              }}
            >
              {m.usageCount ?? 0} widget
              {(m.usageCount ?? 0) === 1 ? "" : "s"}
            </span>
            <button
              type="button"
              aria-label={`Delete ${m.name}`}
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete metric "${m.name}"?`)) removeMetric(m.id);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-fg-subtle)",
                cursor: "pointer",
                padding: 4,
                justifySelf: "end",
              }}
            >
              <Trash2 size={12} />
            </button>
          </button>
        ))}
      </Card>

      {editing && (
        <MetricEditor
          metric={editing === "new" ? null : editing}
          tables={tables}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function sourceText(m: MetricDefinition): string {
  if (m.kind === "sql") return m.expression?.slice(0, 32) + "…" || "—";
  if (m.kind === "ratio") {
    return `${m.numerator?.column}/${m.denominator?.column}`;
  }
  return `${m.table}.${m.column}`;
}

function MetricEditor({
  metric,
  tables,
  onClose,
}: {
  metric: MetricDefinition | null;
  tables: ModelTable[];
  onClose: () => void;
}) {
  const upsert = useDataModel((s) => s.upsertMetric);
  const isNew = metric === null;
  const [draft, setDraft] = useState<MetricDefinition>(
    () =>
      metric ?? {
        id: `metric-${Date.now()}`,
        name: "",
        kind: "sum",
        table: tables[0]?.id ?? "",
        column: tables[0]?.columns[0]?.name ?? "",
        fieldType: "integer",
      },
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    upsert(draft);
    onClose();
  };

  const tableObj = tables.find((t) => t.id === draft.table);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isNew ? "New metric" : `Edit ${draft.name}`}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 30,
        background: "rgba(10, 14, 23, 0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-6)",
      }}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
        style={{
          width: "100%",
          maxWidth: 560,
          background: "var(--color-bg-elev)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-5)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
          boxShadow: "var(--shadow-lg)",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "var(--text-lg)",
              fontWeight: 600,
              color: "var(--color-fg)",
            }}
          >
            {isNew ? "New metric" : "Edit metric"}
          </h2>
          <p
            style={{
              margin: "var(--space-1) 0 0",
              fontSize: "var(--text-sm)",
              color: "var(--color-fg-muted)",
            }}
          >
            One canonical definition referenced everywhere. AI uses the name
            instead of re-deriving SQL.
          </p>
        </div>

        <Field label="Name" required>
          <input
            type="text"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            required
            autoFocus
            placeholder="Active customers"
            aria-label="Metric name"
            style={fieldInput}
          />
        </Field>

        <Field label="Description">
          <input
            type="text"
            value={draft.description ?? ""}
            onChange={(e) =>
              setDraft({ ...draft, description: e.target.value })
            }
            placeholder="Used by AI to ground prompts"
            style={fieldInput}
          />
        </Field>

        <Field label="Kind">
          <select
            value={draft.kind}
            onChange={(e) =>
              setDraft({ ...draft, kind: e.target.value as MetricKind })
            }
            style={fieldInput}
          >
            {(
              [
                "count",
                "sum",
                "avg",
                "count_distinct",
                "ratio",
                "sql",
              ] as MetricKind[]
            ).map((k) => (
              <option key={k} value={k}>
                {KIND_LABEL[k]}
              </option>
            ))}
          </select>
        </Field>

        {draft.kind !== "sql" && draft.kind !== "ratio" && tableObj && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--space-3)",
            }}
          >
            <Field label="Table">
              <select
                value={draft.table ?? ""}
                onChange={(e) => setDraft({ ...draft, table: e.target.value })}
                style={fieldInput}
              >
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.friendlyName}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Column">
              <select
                value={draft.column ?? ""}
                onChange={(e) => setDraft({ ...draft, column: e.target.value })}
                style={fieldInput}
              >
                {draft.kind === "count" && (
                  <option value="*">* (any row)</option>
                )}
                {tableObj.columns.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.friendlyName} ({c.name})
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {draft.kind === "ratio" && (
          <RatioFields draft={draft} setDraft={setDraft} tables={tables} />
        )}

        {draft.kind === "sql" && (
          <Field label="SQL expression">
            <textarea
              value={draft.expression ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, expression: e.target.value })
              }
              placeholder="sum(case when status = 'completed' then amount else 0 end)"
              rows={4}
              style={{
                ...fieldInput,
                resize: "vertical",
                fontFamily: "var(--font-mono)",
              }}
            />
          </Field>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-3)",
          }}
        >
          <Field label="Field type">
            <select
              value={draft.fieldType}
              onChange={(e) =>
                setDraft({ ...draft, fieldType: e.target.value as FieldType })
              }
              style={fieldInput}
            >
              {FIELD_TYPES.map((ft) => (
                <option key={ft} value={ft}>
                  {ft}
                </option>
              ))}
            </select>
          </Field>
          <div
            style={{
              alignSelf: "end",
              fontSize: 11,
              color: "var(--color-fg-subtle)",
            }}
          >
            <Sparkles
              size={11}
              style={{
                color: "var(--color-primary)",
                marginRight: 4,
                verticalAlign: "-2px",
              }}
            />
            AI will reference this metric by name in NL queries.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "var(--space-2)",
            paddingTop: "var(--space-2)",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {isNew ? "Create metric" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function RatioFields({
  draft,
  setDraft,
  tables,
}: {
  draft: MetricDefinition;
  setDraft: (m: MetricDefinition) => void;
  tables: ModelTable[];
}) {
  const num = draft.numerator ?? {
    table: tables[0]?.id ?? "",
    column: tables[0]?.columns[0]?.name ?? "",
    agg: "sum" as const,
  };
  const den = draft.denominator ?? {
    table: tables[0]?.id ?? "",
    column: "id",
    agg: "count" as const,
  };
  const numTable = tables.find((t) => t.id === num.table);
  const denTable = tables.find((t) => t.id === den.table);
  return (
    <>
      <Field label="Numerator">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 0.6fr",
            gap: "var(--space-2)",
          }}
        >
          <select
            value={num.table}
            onChange={(e) =>
              setDraft({
                ...draft,
                numerator: { ...num, table: e.target.value },
              })
            }
            style={fieldInput}
            aria-label="Numerator table"
          >
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.friendlyName}
              </option>
            ))}
          </select>
          <select
            value={num.column}
            onChange={(e) =>
              setDraft({
                ...draft,
                numerator: { ...num, column: e.target.value },
              })
            }
            style={fieldInput}
            aria-label="Numerator column"
          >
            {numTable?.columns.map((c) => (
              <option key={c.name} value={c.name}>
                {c.friendlyName}
              </option>
            ))}
          </select>
          <select
            value={num.agg}
            onChange={(e) =>
              setDraft({
                ...draft,
                numerator: { ...num, agg: e.target.value as "sum" | "count" },
              })
            }
            style={fieldInput}
            aria-label="Numerator aggregate"
          >
            <option value="sum">sum</option>
            <option value="count">count</option>
          </select>
        </div>
      </Field>

      <Field label="Denominator">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 0.6fr",
            gap: "var(--space-2)",
          }}
        >
          <select
            value={den.table}
            onChange={(e) =>
              setDraft({
                ...draft,
                denominator: { ...den, table: e.target.value },
              })
            }
            style={fieldInput}
            aria-label="Denominator table"
          >
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.friendlyName}
              </option>
            ))}
          </select>
          <select
            value={den.column}
            onChange={(e) =>
              setDraft({
                ...draft,
                denominator: { ...den, column: e.target.value },
              })
            }
            style={fieldInput}
            aria-label="Denominator column"
          >
            {denTable?.columns.map((c) => (
              <option key={c.name} value={c.name}>
                {c.friendlyName}
              </option>
            ))}
          </select>
          <select
            value={den.agg}
            onChange={(e) =>
              setDraft({
                ...draft,
                denominator: { ...den, agg: e.target.value as "sum" | "count" },
              })
            }
            style={fieldInput}
            aria-label="Denominator aggregate"
          >
            <option value="count">count</option>
            <option value="sum">sum</option>
          </select>
        </div>
      </Field>
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--color-fg-subtle)",
        }}
      >
        {label}
        {required && (
          <span style={{ color: "var(--color-danger)", marginLeft: 4 }}>*</span>
        )}
      </span>
      {children}
    </label>
  );
}

const fieldInput: React.CSSProperties = {
  padding: "var(--space-2) var(--space-3)",
  background: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  fontFamily: "inherit",
  fontSize: "var(--text-sm)",
  color: "var(--color-fg)",
};
