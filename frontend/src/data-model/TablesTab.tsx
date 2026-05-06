/**
 * Data Model — Tables & columns tab.
 *
 * Two-pane layout: table list on the left, selected-table detail on
 * the right with one row per column. Inline editing of friendly names,
 * field types, FK target + label column, and the hide flag. The "AI
 * suggest" button reruns the synthetic auto-detect for now; real
 * detection lands on the connect-data backend wiring.
 */
import { Database, Eye, EyeOff, Sparkles } from "lucide-react";
import { useState } from "react";
import { Card } from "../ui/Card";
import { useDataModel } from "./store";
import type { FieldType, ModelColumn, ModelTable } from "./types";

const FIELD_TYPES: FieldType[] = [
  "string",
  "integer",
  "float",
  "currency",
  "percent",
  "date",
  "datetime",
  "boolean",
  "email",
  "url",
  "category",
  "json",
];

export function TablesTab() {
  const tables = useDataModel((s) => s.model.tables);
  const [selectedId, setSelectedId] = useState<string>(
    () => tables[0]?.id ?? "",
  );
  const selected = tables.find((t) => t.id === selectedId) ?? tables[0];

  return (
    <div
      data-testid="tables-tab"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(220px, 280px) 1fr",
        gap: "var(--space-4)",
      }}
    >
      <TableList
        tables={tables}
        selectedId={selected?.id ?? ""}
        onSelect={setSelectedId}
      />
      {selected ? (
        <TableDetail table={selected} />
      ) : (
        <Card>
          <div
            style={{
              padding: "var(--space-8)",
              textAlign: "center",
              color: "var(--color-fg-muted)",
            }}
          >
            No tables in the model. Connect a data source to auto-detect.
          </div>
        </Card>
      )}
    </div>
  );
}

function TableList({
  tables,
  selectedId,
  onSelect,
}: {
  tables: ModelTable[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <Card padded={false}>
      <div
        style={{
          padding: "var(--space-3) var(--space-4)",
          borderBottom: "1px solid var(--color-border)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--color-fg-subtle)",
        }}
      >
        Tables · {tables.length}
      </div>
      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {tables.map((t) => {
          const active = t.id === selectedId;
          const hiddenCount = t.columns.filter((c) => c.hidden).length;
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => onSelect(t.id)}
                data-testid={`table-${t.id}`}
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  alignItems: "flex-start",
                  padding: "var(--space-3) var(--space-4)",
                  background: active ? "var(--color-bg-hover)" : "transparent",
                  border: "none",
                  borderLeft: active
                    ? "2px solid var(--color-primary)"
                    : "2px solid transparent",
                  color: "var(--color-fg)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    fontSize: "var(--text-sm)",
                    fontWeight: 600,
                  }}
                >
                  <Database size={12} />
                  {t.friendlyName}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--color-fg-subtle)",
                  }}
                >
                  {t.id}
                </span>
                <span style={{ fontSize: 11, color: "var(--color-fg-muted)" }}>
                  {t.columns.length} columns
                  {hiddenCount > 0 ? ` · ${hiddenCount} hidden` : ""}
                  {t.rowCount ? ` · ${t.rowCount.toLocaleString()} rows` : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function TableDetail({ table }: { table: ModelTable }) {
  const setTableFriendlyName = useDataModel((s) => s.setTableFriendlyName);
  return (
    <Card padded={false}>
      <header
        style={{
          padding: "var(--space-4) var(--space-5)",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-3)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <input
            type="text"
            aria-label="Table friendly name"
            data-testid="table-friendly-name"
            value={table.friendlyName}
            onChange={(e) => setTableFriendlyName(table.id, e.target.value)}
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: "var(--text-lg)",
              fontWeight: 600,
              color: "var(--color-fg)",
              fontFamily: "inherit",
            }}
          />
          <div
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--color-fg-subtle)",
            }}
          >
            {table.id}
          </div>
        </div>
        <button
          type="button"
          aria-label="AI-suggest improvements"
          style={{
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
          <Sparkles size={11} />
          Re-suggest with AI
        </button>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1.2fr 1.4fr 1.2fr 0.5fr",
          gap: "var(--space-4)",
          padding: "var(--space-3) var(--space-5)",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--color-fg-subtle)",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-bg-subtle)",
        }}
      >
        <span>Friendly name</span>
        <span>Field type</span>
        <span>Foreign key → label</span>
        <span>Column (raw)</span>
        <span>Hidden</span>
      </div>

      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {table.columns.map((c) => (
          <ColumnRow key={c.name} tableId={table.id} column={c} />
        ))}
      </ul>
    </Card>
  );
}

function ColumnRow({
  tableId,
  column,
}: {
  tableId: string;
  column: ModelColumn;
}) {
  const setColumn = useDataModel((s) => s.setColumn);
  const toggleColumnHidden = useDataModel((s) => s.toggleColumnHidden);
  const tables = useDataModel((s) => s.model.tables);
  const fkTables = tables.filter((t) => t.id !== tableId);

  const update = (patch: Partial<ModelColumn>) =>
    setColumn(tableId, { ...column, ...patch });

  return (
    <li
      data-testid={`column-${column.name}`}
      style={{
        display: "grid",
        gridTemplateColumns: "1.5fr 1.2fr 1.4fr 1.2fr 0.5fr",
        gap: "var(--space-4)",
        padding: "var(--space-3) var(--space-5)",
        alignItems: "center",
        borderBottom: "1px solid var(--color-border)",
        opacity: column.hidden ? 0.6 : 1,
      }}
    >
      <input
        type="text"
        value={column.friendlyName}
        onChange={(e) => update({ friendlyName: e.target.value })}
        aria-label={`Friendly name for ${column.name}`}
        style={inputStyle}
      />
      <select
        value={column.fieldType}
        onChange={(e) => update({ fieldType: e.target.value as FieldType })}
        aria-label={`Field type for ${column.name}`}
        style={inputStyle}
      >
        {FIELD_TYPES.map((ft) => (
          <option key={ft} value={ft}>
            {ft}
          </option>
        ))}
      </select>
      <FkPicker
        column={column}
        fkTables={fkTables}
        tables={tables}
        onChange={(fkTo) => update({ fkTo })}
      />
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "var(--color-fg-muted)",
        }}
      >
        {column.name}
      </span>
      <button
        type="button"
        aria-label={column.hidden ? "Show column" : "Hide column"}
        title={column.hidden ? "Show column" : "Hide column"}
        onClick={() => toggleColumnHidden(tableId, column.name)}
        style={{
          width: 28,
          height: 28,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid var(--color-border)",
          background: column.hidden
            ? "var(--color-bg-subtle)"
            : "var(--color-bg)",
          borderRadius: "var(--radius-sm)",
          color: column.hidden
            ? "var(--color-fg-subtle)"
            : "var(--color-fg-muted)",
          cursor: "pointer",
        }}
      >
        {column.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
      </button>
    </li>
  );
}

function FkPicker({
  column,
  fkTables,
  tables,
  onChange,
}: {
  column: ModelColumn;
  fkTables: ModelTable[];
  tables: ModelTable[];
  onChange: (fk: ModelColumn["fkTo"]) => void;
}) {
  const fkTable = column.fkTo
    ? tables.find((t) => t.id === column.fkTo!.table)
    : null;
  return (
    <div style={{ display: "flex", gap: "var(--space-2)" }}>
      <select
        value={column.fkTo?.table ?? ""}
        onChange={(e) => {
          const id = e.target.value;
          if (!id) return onChange(undefined);
          const target = tables.find((t) => t.id === id);
          const labelCol =
            target?.columns.find(
              (c) =>
                c.name === "name" || c.name === "title" || c.name === "label",
            )?.name ??
            target?.columns[0]?.name ??
            "";
          onChange({ table: id, labelColumn: labelCol });
        }}
        aria-label={`Foreign key target for ${column.name}`}
        style={{ ...inputStyle, flex: 1 }}
      >
        <option value="">— not a foreign key</option>
        {fkTables.map((t) => (
          <option key={t.id} value={t.id}>
            {t.friendlyName}
          </option>
        ))}
      </select>
      {column.fkTo && fkTable && (
        <select
          value={column.fkTo.labelColumn}
          onChange={(e) =>
            onChange({ ...column.fkTo!, labelColumn: e.target.value })
          }
          aria-label={`Label column for ${column.name}`}
          style={{ ...inputStyle, flex: 1 }}
        >
          {fkTable.columns.map((c) => (
            <option key={c.name} value={c.name}>
              {c.friendlyName} ({c.name})
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "4px 8px",
  background: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  fontFamily: "inherit",
  fontSize: "var(--text-sm)",
  color: "var(--color-fg)",
};
