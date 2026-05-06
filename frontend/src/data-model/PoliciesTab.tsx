/**
 * Data Model — Access policies tab.
 *
 * Row-level rules per table referencing JWT claims. Each policy has
 * one or more rules joined with AND, plus an optional SQL escape
 * hatch. Phase 1 stores definitions only — runtime enforcement at
 * query time wires with P2-07 once embed JWT signing lands.
 */
import { AlertTriangle, Lock, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { useDataModel } from "./store";
import type { AccessPolicy, ModelTable, PolicyOp } from "./types";

const OPS: PolicyOp[] = ["=", "!=", "in", "not_in"];

export function PoliciesTab() {
  const policies = useDataModel((s) => s.model.policies);
  const tables = useDataModel((s) => s.model.tables);
  const claims = useDataModel((s) => s.model.jwtClaims);
  const removePolicy = useDataModel((s) => s.removePolicy);
  const togglePolicyEnabled = useDataModel((s) => s.togglePolicyEnabled);
  const [editing, setEditing] = useState<AccessPolicy | "new" | null>(null);

  return (
    <div data-testid="policies-tab">
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "var(--space-3)",
          gap: "var(--space-3)",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-fg-muted)",
            maxWidth: 600,
          }}
        >
          Row-level rules per table. Defined here in Phase 1; enforced at query
          time once embed JWT signing lands (Phase 2 · P2-07).
          <div
            style={{
              marginTop: "var(--space-2)",
              fontSize: 11,
              color: "var(--color-fg-subtle)",
            }}
          >
            JWT claims expected:{" "}
            {claims.map((c) => (
              <code
                key={c}
                style={{
                  background: "var(--color-bg-subtle)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "1px 6px",
                  marginRight: 4,
                  fontSize: 11,
                }}
              >
                {c}
              </code>
            ))}
          </div>
        </div>
        <Button
          variant="primary"
          iconLeft={<Plus size={14} />}
          onClick={() => setEditing("new")}
        >
          New policy
        </Button>
      </div>

      <Card padded={false}>
        {policies.length === 0 && (
          <div
            style={{
              padding: "var(--space-8)",
              textAlign: "center",
              color: "var(--color-fg-muted)",
            }}
          >
            No policies yet. Without a policy, embedded viewers see every row in
            the table — fine for internal-only data, unsafe for tenant-of-
            tenant analytics.
          </div>
        )}
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {policies.map((p) => (
            <li
              key={p.id}
              data-testid={`policy-${p.id}`}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: "var(--space-3)",
                padding: "var(--space-4)",
                borderBottom: "1px solid var(--color-border)",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-md)",
                  background: p.enabled
                    ? "rgba(52, 211, 153, 0.16)"
                    : "var(--color-bg-subtle)",
                  color: p.enabled
                    ? "var(--color-success)"
                    : "var(--color-fg-subtle)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {p.enabled ? <ShieldCheck size={14} /> : <Lock size={14} />}
              </span>
              <button
                type="button"
                onClick={() => setEditing(p)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-fg)",
                  fontFamily: "inherit",
                  textAlign: "left",
                  padding: 0,
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "var(--text-sm)",
                  }}
                >
                  {tables.find((t) => t.id === p.table)?.friendlyName ??
                    p.table}
                </div>
                {p.description && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--color-fg-muted)",
                      marginTop: 2,
                    }}
                  >
                    {p.description}
                  </div>
                )}
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--color-fg-subtle)",
                    marginTop: 4,
                  }}
                >
                  {summarize(p)}
                </div>
              </button>
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <button
                  type="button"
                  aria-label={p.enabled ? "Disable policy" : "Enable policy"}
                  onClick={() => togglePolicyEnabled(p.id)}
                  style={togglePillStyle(p.enabled)}
                >
                  {p.enabled ? "Enabled" : "Disabled"}
                </button>
                <button
                  type="button"
                  aria-label={`Delete policy ${p.id}`}
                  onClick={() => {
                    if (confirm("Delete policy?")) removePolicy(p.id);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--color-fg-subtle)",
                    cursor: "pointer",
                    padding: 4,
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {!policies.find((p) => p.enabled) && policies.length > 0 && (
        <div
          role="status"
          style={{
            marginTop: "var(--space-3)",
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-2) var(--space-3)",
            background: "rgba(251, 191, 36, 0.10)",
            border: "1px solid rgba(251, 191, 36, 0.4)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-warning)",
            fontSize: "var(--text-sm)",
          }}
        >
          <AlertTriangle size={14} />
          All policies are disabled — embedded viewers will see every row.
        </div>
      )}

      {editing && (
        <PolicyEditor
          policy={editing === "new" ? null : editing}
          tables={tables}
          claims={claims}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function summarize(p: AccessPolicy): string {
  if (p.expression) return p.expression;
  if (p.rules.length === 0) return "(no rules — allows everything)";
  return p.rules
    .map(
      (r) =>
        `${r.column} ${r.op} ${r.claim ? "$jwt." + r.claim : `'${r.literal ?? ""}'`}`,
    )
    .join(" AND ");
}

function togglePillStyle(enabled: boolean): React.CSSProperties {
  return {
    padding: "2px 8px",
    borderRadius: "var(--radius-full)",
    fontSize: 11,
    fontWeight: 600,
    border: "1px solid",
    background: enabled ? "rgba(52, 211, 153, 0.14)" : "var(--color-bg-subtle)",
    color: enabled ? "var(--color-success)" : "var(--color-fg-subtle)",
    borderColor: enabled ? "rgba(52, 211, 153, 0.4)" : "var(--color-border)",
    cursor: "pointer",
    fontFamily: "inherit",
  };
}

function PolicyEditor({
  policy,
  tables,
  claims,
  onClose,
}: {
  policy: AccessPolicy | null;
  tables: ModelTable[];
  claims: string[];
  onClose: () => void;
}) {
  const upsert = useDataModel((s) => s.upsertPolicy);
  const isNew = policy === null;
  const [draft, setDraft] = useState<AccessPolicy>(
    () =>
      policy ?? {
        id: `policy-${Date.now()}`,
        table: tables[0]?.id ?? "",
        rules: [
          {
            column: tables[0]?.columns[0]?.name ?? "",
            op: "=",
            claim: claims[0],
          },
        ],
        enabled: true,
      },
  );
  const [mode, setMode] = useState<"visual" | "expression">(
    draft.expression ? "expression" : "visual",
  );

  const tableObj = tables.find((t) => t.id === draft.table);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsert(draft);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isNew ? "New access policy" : "Edit access policy"}
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
          maxWidth: 580,
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
            {isNew ? "New access policy" : "Edit access policy"}
          </h2>
          <p
            style={{
              margin: "var(--space-1) 0 0",
              fontSize: "var(--text-sm)",
              color: "var(--color-fg-muted)",
            }}
          >
            Restrict which rows of a table embedded viewers see, based on JWT
            claims set by the host app.
          </p>
        </div>

        <Field label="Table">
          <select
            value={draft.table}
            onChange={(e) => setDraft({ ...draft, table: e.target.value })}
            style={fieldInput}
            aria-label="Policy table"
          >
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.friendlyName} ({t.id})
              </option>
            ))}
          </select>
        </Field>

        <Field label="Description">
          <input
            type="text"
            value={draft.description ?? ""}
            onChange={(e) =>
              setDraft({ ...draft, description: e.target.value })
            }
            placeholder="Why this policy exists (audit-friendly)"
            style={fieldInput}
          />
        </Field>

        <div
          role="tablist"
          aria-label="Policy mode"
          style={{ display: "flex", gap: 4 }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "visual"}
            onClick={() => {
              setMode("visual");
              setDraft({ ...draft, expression: undefined });
            }}
            style={modeTabStyle(mode === "visual")}
          >
            Visual rules
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "expression"}
            onClick={() => setMode("expression")}
            style={modeTabStyle(mode === "expression")}
          >
            SQL expression
          </button>
        </div>

        {mode === "visual" && tableObj && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
            }}
          >
            {draft.rules.map((r, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 0.6fr 1fr 0.4fr",
                  gap: "var(--space-2)",
                  alignItems: "center",
                }}
              >
                <select
                  value={r.column}
                  onChange={(e) => {
                    const next = [...draft.rules];
                    next[i] = { ...r, column: e.target.value };
                    setDraft({ ...draft, rules: next });
                  }}
                  style={fieldInput}
                  aria-label={`Rule ${i + 1} column`}
                >
                  {tableObj.columns.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.friendlyName} ({c.name})
                    </option>
                  ))}
                </select>
                <select
                  value={r.op}
                  onChange={(e) => {
                    const next = [...draft.rules];
                    next[i] = { ...r, op: e.target.value as PolicyOp };
                    setDraft({ ...draft, rules: next });
                  }}
                  style={fieldInput}
                  aria-label={`Rule ${i + 1} op`}
                >
                  {OPS.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
                <select
                  value={r.claim ?? ""}
                  onChange={(e) => {
                    const next = [...draft.rules];
                    next[i] = {
                      ...r,
                      claim: e.target.value || undefined,
                      literal: undefined,
                    };
                    setDraft({ ...draft, rules: next });
                  }}
                  style={fieldInput}
                  aria-label={`Rule ${i + 1} claim`}
                >
                  <option value="">— pick JWT claim —</option>
                  {claims.map((c) => (
                    <option key={c} value={c}>
                      $jwt.{c}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const next = draft.rules.filter((_, idx) => idx !== i);
                    setDraft({ ...draft, rules: next });
                  }}
                  aria-label={`Remove rule ${i + 1}`}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-fg-subtle)",
                    borderRadius: "var(--radius-sm)",
                    padding: 4,
                    cursor: "pointer",
                    justifySelf: "end",
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setDraft({
                  ...draft,
                  rules: [
                    ...draft.rules,
                    {
                      column: tableObj.columns[0]?.name ?? "",
                      op: "=",
                      claim: claims[0],
                    },
                  ],
                })
              }
              style={{
                alignSelf: "flex-start",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                background: "transparent",
                border: "1px dashed var(--color-border-strong)",
                borderRadius: "var(--radius-sm)",
                color: "var(--color-primary)",
                fontFamily: "inherit",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Plus size={11} />
              Add rule (AND)
            </button>
          </div>
        )}

        {mode === "expression" && (
          <Field label="SQL expression">
            <textarea
              value={draft.expression ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, expression: e.target.value })
              }
              placeholder="customer_id = $jwt.customer_id AND status != 'deleted'"
              rows={4}
              style={{
                ...fieldInput,
                resize: "vertical",
                fontFamily: "var(--font-mono)",
              }}
            />
          </Field>
        )}

        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            fontSize: "var(--text-sm)",
            color: "var(--color-fg-muted)",
          }}
        >
          <input
            type="checkbox"
            checked={draft.enabled}
            onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
          />
          Enabled
        </label>

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
            {isNew ? "Create policy" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function modeTabStyle(active: boolean): React.CSSProperties {
  return {
    padding: "4px 10px",
    background: active ? "var(--color-bg)" : "var(--color-bg-subtle)",
    border: "1px solid",
    borderColor: active ? "var(--color-primary)" : "var(--color-border)",
    color: active ? "var(--color-fg)" : "var(--color-fg-muted)",
    borderRadius: "var(--radius-md)",
    fontFamily: "inherit",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
  };
}

function Field({
  label,
  children,
}: {
  label: string;
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
