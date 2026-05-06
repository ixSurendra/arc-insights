/**
 * Smart-fill dialog — Phase 1.
 *
 * Tenant picks a template → this modal opens with the heuristic
 * mapping pre-filled. Each role row shows the suggested column with
 * the heuristic reasoning and a dropdown of eligible columns the
 * tenant can switch to. "Generate" applies the mapping, persists the
 * new dashboard to the dashboards store, and routes to its view.
 *
 * Required-but-unresolved roles block generation until the tenant
 * picks a column. Optional roles can stay null and the dependent
 * widget gets dropped from the output.
 */
import { ArrowRight, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDataModel } from "../data-model/store";
import { useDashboards } from "../dashboards/store";
import { Button } from "../ui/Button";
import { applyMapping } from "./apply-mapping";
import { getTemplate } from "./dashboard-templates";
import { eligibleColumns, suggestMapping } from "./smart-fill";
import type { RoleMapping } from "./types";

interface Props {
  templateId: string;
  onClose: () => void;
}

export function SmartFillDialog({ templateId, onClose }: Props) {
  const template = getTemplate(templateId);
  const tables = useDataModel((s) => s.model.tables);
  const upsertDashboard = useDashboards((s) => s.upsert);
  const navigate = useNavigate();

  const initial = useMemo(() => {
    if (!template) return null;
    return suggestMapping(template, { tables });
  }, [template, tables]);

  const [mapping, setMapping] = useState<RoleMapping | null>(
    initial?.mapping ?? null,
  );
  const reasoning = initial?.reasoning ?? {};

  if (!template || !mapping) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        style={overlayStyle}
        onClick={onClose}
      >
        <div onClick={(e) => e.stopPropagation()} style={dialogStyle}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2 style={titleStyle}>Smart-fill</h2>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              style={closeStyle}
            >
              <X size={16} />
            </button>
          </div>
          <p style={{ color: "var(--color-fg-muted)" }}>
            Template not found or no data model is available yet.
          </p>
        </div>
      </div>
    );
  }

  const primary = tables.find((t) => t.id === mapping.primaryTable);
  const requiredRoles = template.fieldRoles.filter((r) => !r.optional);
  const unresolved = requiredRoles.filter((r) => !mapping.bindings[r.id]);
  const canGenerate = unresolved.length === 0 && !!primary;

  const onChangeBinding = (roleId: string, columnName: string | null) => {
    setMapping((m) => {
      if (!m) return m;
      const next: RoleMapping = {
        ...m,
        bindings: {
          ...m.bindings,
          [roleId]: columnName ? { tableId: m.primaryTable, columnName } : null,
        },
      };
      return next;
    });
  };

  const onGenerate = () => {
    if (!canGenerate) return;
    const dashboard = applyMapping(templateId, mapping, {
      title: template.title,
      folder: template.folder,
      ownerInitials: "AM",
    });
    if (!dashboard) return;
    upsertDashboard(dashboard);
    onClose();
    navigate(`/dashboards/${dashboard.id}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Smart-fill ${template.title}`}
      onClick={onClose}
      style={overlayStyle}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          onGenerate();
        }}
        style={dialogStyle}
      >
        <header
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "var(--space-3)",
          }}
        >
          <div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-primary)",
                marginBottom: 4,
              }}
            >
              <Sparkles size={11} />
              Smart-fill
            </span>
            <h2 style={titleStyle}>{template.title}</h2>
            <p
              style={{
                margin: "var(--space-1) 0 0",
                fontSize: "var(--text-sm)",
                color: "var(--color-fg-muted)",
                maxWidth: 540,
              }}
            >
              {template.description} Confirm or override the column mappings
              below — Arc generates a real dashboard wired to your data.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={closeStyle}
          >
            <X size={16} />
          </button>
        </header>

        {!primary && (
          <div role="alert" style={errorBox}>
            No tables in your Data Model — connect a data source or upload a CSV
            first.
          </div>
        )}

        {primary && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "var(--space-2) var(--space-3)",
              background: "var(--color-bg-subtle)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: 12,
              color: "var(--color-fg-muted)",
            }}
          >
            <span>
              Primary table:{" "}
              <strong
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-fg)",
                }}
              >
                {primary.id}
              </strong>{" "}
              · {primary.columns.length} columns
              {primary.rowCount
                ? ` · ${primary.rowCount.toLocaleString()} rows`
                : ""}
            </span>
            <span>{template.widgets.length} widgets to generate</span>
          </div>
        )}

        <div
          data-testid="role-mapping"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
          }}
        >
          {template.fieldRoles.map((role) => {
            const bind = mapping.bindings[role.id];
            const eligible = primary ? eligibleColumns(role, primary) : [];
            const isUnresolved = !role.optional && !bind && eligible.length > 0;
            const reason = reasoning[role.id];

            return (
              <div
                key={role.id}
                data-testid={`role-${role.id}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.4fr 1.4fr",
                  gap: "var(--space-3)",
                  alignItems: "flex-start",
                  padding: "var(--space-3)",
                  border: "1px solid",
                  borderColor: isUnresolved
                    ? "rgba(248, 113, 113, 0.4)"
                    : "var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  background: isUnresolved
                    ? "rgba(248, 113, 113, 0.04)"
                    : "var(--color-bg)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: 600,
                      color: "var(--color-fg)",
                    }}
                  >
                    {role.label}
                    {role.optional && (
                      <span
                        style={{
                          marginLeft: 6,
                          fontSize: 10,
                          fontWeight: 500,
                          color: "var(--color-fg-subtle)",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        optional
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--color-fg-muted)",
                      marginTop: 2,
                    }}
                  >
                    {role.hint}
                  </div>
                  {reason && bind && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--color-fg-subtle)",
                        marginTop: 6,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      <Sparkles
                        size={10}
                        style={{
                          color: "var(--color-primary)",
                          marginRight: 4,
                          verticalAlign: "-1px",
                        }}
                      />
                      {reason}
                    </div>
                  )}
                  {isUnresolved && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--color-danger)",
                        marginTop: 6,
                      }}
                    >
                      Pick a column to continue.
                    </div>
                  )}
                </div>

                <select
                  value={bind?.columnName ?? ""}
                  onChange={(e) =>
                    onChangeBinding(role.id, e.target.value || null)
                  }
                  aria-label={`Column for ${role.label}`}
                  data-testid={`role-select-${role.id}`}
                  disabled={!primary}
                  style={selectStyle}
                >
                  {role.optional && (
                    <option value="">— skip this role —</option>
                  )}
                  {!role.optional && !bind && (
                    <option value="">— pick a column —</option>
                  )}
                  {eligible.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.friendlyName} ({c.name}) · {c.fieldType}
                    </option>
                  ))}
                  {eligible.length === 0 && (
                    <option value="" disabled>
                      No eligible columns
                    </option>
                  )}
                </select>
              </div>
            );
          })}
        </div>

        <footer
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "var(--space-3)",
            borderTop: "1px solid var(--color-border)",
            gap: "var(--space-3)",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "var(--color-fg-subtle)",
            }}
          >
            {unresolved.length === 0
              ? `Ready to generate ${template.widgets.length} widgets.`
              : `${unresolved.length} required role${
                  unresolved.length === 1 ? "" : "s"
                } still need a column.`}
          </span>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              iconLeft={<ArrowRight size={14} />}
              disabled={!canGenerate}
              data-testid="smart-fill-generate"
            >
              Generate dashboard
            </Button>
          </div>
        </footer>
      </form>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 30,
  background: "rgba(10, 14, 23, 0.65)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "var(--space-6)",
};

const dialogStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 720,
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
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "var(--text-lg)",
  fontWeight: 600,
  color: "var(--color-fg)",
};

const closeStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "var(--color-fg-muted)",
  cursor: "pointer",
  padding: 4,
};

const errorBox: React.CSSProperties = {
  padding: "var(--space-3)",
  background: "rgba(248, 113, 113, 0.08)",
  border: "1px solid rgba(248, 113, 113, 0.3)",
  color: "var(--color-danger)",
  fontSize: "var(--text-sm)",
  borderRadius: "var(--radius-md)",
};

const selectStyle: React.CSSProperties = {
  padding: "var(--space-2) var(--space-3)",
  background: "var(--color-bg-elev)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  fontFamily: "inherit",
  fontSize: "var(--text-sm)",
  color: "var(--color-fg)",
  width: "100%",
};
