/**
 * Widget builder — Phase 1.
 *
 * Three doors at the top (Ask AI · Visual · SQL) feed a shared 3-zone
 * configurator: data on the left, live preview in the middle, options
 * on the right. Saving opens a small dialog (name · description ·
 * folder) and routes back to the widget library on success.
 *
 * Real persistence (P1-29 widget library + storage) lands in a follow-
 * up. The Ask-AI door uses a mock until the AI chunk wires Ollama.
 */
import { ArrowLeft, Save, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AskAIPanel } from "../builder/AskAIPanel";
import { BuilderPreview } from "../builder/BuilderPreview";
import { type Door, DoorTabs } from "../builder/DoorTabs";
import { QueryBuilder } from "../builder/QueryBuilder";
import { SAMPLE_ROWS, SAMPLE_TABLES } from "../builder/sample-schema";
import type { QuerySpec, SchemaTable } from "../builder/types";
import { WidgetOptionsPanel } from "../builder/WidgetOptionsPanel";
import { PageHeader } from "../layout/AppShell";
import { SqlEditor } from "../sql/SqlEditor";
import { Button } from "../ui/Button";

const DEFAULT_SPEC = (table: SchemaTable): QuerySpec => ({
  from: { schema: table.schema, table: table.name },
  dimensions: [{ column: "region" }],
  measures: [{ column: "amount", agg: "sum" }],
  filters: [{ column: "status", op: "=", value: "completed" }],
  orderBy: [],
  limit: 1000,
});

export function BuilderPage() {
  const [search] = useSearchParams();
  const initialDoor = (search.get("door") as Door | null) ?? "visual";
  const initialPrompt = search.get("q") ?? undefined;
  const [door, setDoor] = useState<Door>(
    initialDoor === "ai" || initialDoor === "visual" || initialDoor === "sql"
      ? initialDoor
      : "visual",
  );
  const [table, setTable] = useState<SchemaTable>(SAMPLE_TABLES[0]!);
  const [spec, setSpec] = useState<QuerySpec>(() => DEFAULT_SPEC(table));
  const [sql, setSql] = useState<string>(
    `-- SQL door — paste any query against ${table.schema}.${table.name}.\n`,
  );
  const [chartTypeId, setChartTypeId] = useState<string>("table");
  const [saveOpen, setSaveOpen] = useState(false);

  const sourceRows = useMemo(
    () => SAMPLE_ROWS[`${table.schema}.${table.name}`] ?? [],
    [table],
  );

  const onTableChange = (next: SchemaTable) => {
    setTable(next);
    setSpec(DEFAULT_SPEC(next));
  };

  return (
    <div style={{ padding: "var(--space-5) var(--space-6)" }}>
      <PageHeader
        breadcrumb={
          <Link
            to="/widgets"
            style={{
              color: "var(--color-fg-muted)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <ArrowLeft size={12} /> Widgets
          </Link>
        }
        title="New widget"
        description="Three doors — Ask AI, Visual, or SQL — feed the same configurator. Live preview updates as you change anything; right panel is for visual options."
        toolbar={<DoorTabs active={door} onSelect={setDoor} />}
        actions={
          <>
            <Link to="/widgets" style={{ textDecoration: "none" }}>
              <Button variant="secondary">Cancel</Button>
            </Link>
            <Button
              variant="primary"
              iconLeft={<Save size={14} />}
              onClick={() => setSaveOpen(true)}
            >
              Save widget
            </Button>
          </>
        }
      />

      <div
        data-testid="builder-3zone"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(320px, 380px) 1fr minmax(280px, 340px)",
          gap: "var(--space-4)",
          alignItems: "flex-start",
        }}
      >
        {/* ─── Left zone: data ─── */}
        <div data-testid="builder-data-zone">
          {door === "visual" && (
            <QueryBuilder
              table={table}
              spec={spec}
              onChange={setSpec}
              onTableChange={onTableChange}
            />
          )}
          {door === "sql" && (
            <div
              style={{
                background: "var(--color-bg-elev)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-3)",
              }}
            >
              <SqlEditor value={sql} onChange={setSql} />
            </div>
          )}
          {door === "ai" && (
            <AskAIPanel
              table={table}
              initialPrompt={initialPrompt}
              onApply={(generated, _question) => {
                setSpec(generated);
                setDoor("visual");
              }}
            />
          )}
        </div>

        {/* ─── Middle zone: live preview ─── */}
        <div data-testid="builder-preview-zone">
          <BuilderPreview
            spec={spec}
            rows={sourceRows}
            onChartTypeChange={setChartTypeId}
          />
        </div>

        {/* ─── Right zone: options ─── */}
        <div data-testid="builder-options-zone">
          <WidgetOptionsPanel chartTypeId={chartTypeId} />
        </div>
      </div>

      {saveOpen && (
        <SaveWidgetDialog
          chartTypeId={chartTypeId}
          onClose={() => setSaveOpen(false)}
        />
      )}
    </div>
  );
}

function SaveWidgetDialog({
  chartTypeId,
  onClose,
}: {
  chartTypeId: string;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [folder, setFolder] = useState("My widgets");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Phase 1: persistence stub. The real save lands with P1-29 widget
    // library + storage. For now we close the dialog and bounce to the
    // library so the flow is visible end-to-end.
    onClose();
    navigate("/widgets");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Save widget"
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
          maxWidth: 480,
          background: "var(--color-bg-elev)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-5)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "var(--space-3)",
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
              Save widget
            </h2>
            <p
              style={{
                margin: "var(--space-1) 0 0",
                fontSize: "var(--text-sm)",
                color: "var(--color-fg-muted)",
              }}
            >
              Reusable across dashboards and reports — edit once, update
              everywhere.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              color: "var(--color-fg-muted)",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <X size={16} />
          </button>
        </div>

        <Field label="Name" required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Revenue by region"
            required
            autoFocus
            aria-label="Widget name"
            style={fieldInput}
          />
        </Field>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Used by AI search and the widget library — write what this answers."
            rows={2}
            aria-label="Description"
            style={{ ...fieldInput, resize: "vertical", minHeight: 56 }}
          />
        </Field>

        <Field label="Folder">
          <input
            type="text"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            aria-label="Folder"
            style={fieldInput}
          />
        </Field>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "var(--space-2)",
            paddingTop: "var(--space-2)",
            borderTop: "1px solid var(--color-border)",
            fontSize: 11,
            color: "var(--color-fg-subtle)",
          }}
        >
          <span>Type · {chartTypeId}</span>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              iconLeft={<Save size={14} />}
              type="submit"
            >
              Save
            </Button>
          </div>
        </div>
      </form>
    </div>
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
