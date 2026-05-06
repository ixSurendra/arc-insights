/**
 * CSV upload — Phase 1 connect-data flow.
 *
 * Drag-drop or file picker → parse with the tiny client-side parser →
 * preview first 20 rows with inferred column types → tenant confirms
 * the table name → emits a ScannedTable for the schema-scan step.
 *
 * Real ingestion (storage as a workspace-DB table) lands with P1-16
 * via a backend route; for Phase 1 we keep the parsed rows in memory
 * so the rest of the wizard can demonstrate the end-to-end flow.
 */
import { CheckCircle2, FileSpreadsheet, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "../ui/Button";
import { type ColumnType, parseCsv } from "./csv";
import type { ScannedTable } from "./SchemaScan";

interface Props {
  onParsed: (
    table: ScannedTable,
    sampleRows: Array<Record<string, string>>,
  ) => void;
}

export function CsvUpload({ onParsed }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<{
    fileName: string;
    columns: string[];
    rows: Array<Record<string, string>>;
    types: Record<string, ColumnType>;
  } | null>(null);
  const [tableName, setTableName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("That doesn't look like a CSV. Drop a `.csv` file.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("CSV is over 50 MB — split or use a connector instead.");
      return;
    }
    try {
      const text = await file.text();
      const result = parseCsv(text, 1000);
      if (result.columns.length === 0) {
        setError("Couldn't read any columns from the file.");
        return;
      }
      const inferredName = file.name
        .replace(/\.csv$/i, "")
        .replace(/[^a-z0-9_]+/gi, "_")
        .toLowerCase();
      setTableName(inferredName);
      setParsed({
        fileName: file.name,
        columns: result.columns,
        rows: result.rows,
        types: result.types,
      });
    } catch (err) {
      setError(`Failed to parse: ${(err as Error).message}`);
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) void handleFile(f);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void handleFile(f);
  };

  const onConfirm = () => {
    if (!parsed) return;
    const safeName = tableName.trim() || "imported_csv";
    onParsed(
      {
        name: safeName,
        rowCount: parsed.rows.length,
        columns: parsed.columns.map((c) => ({
          name: c,
          type: parsed.types[c] ?? "string",
        })),
      },
      parsed.rows,
    );
  };

  if (!parsed) {
    return (
      <div>
        <div
          role="button"
          tabIndex={0}
          aria-label="Drop a CSV file or click to choose"
          data-testid="csv-dropzone"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-3)",
            padding: "var(--space-12) var(--space-6)",
            border: "2px dashed",
            borderColor: isDragging
              ? "var(--color-primary)"
              : "var(--color-border-strong)",
            borderRadius: "var(--radius-lg)",
            background: isDragging
              ? "rgba(34, 211, 238, 0.05)"
              : "var(--color-bg-elev)",
            cursor: "pointer",
            transition:
              "border-color var(--motion-fast) var(--ease), background var(--motion-fast) var(--ease)",
          }}
        >
          <Upload size={32} style={{ color: "var(--color-primary)" }} />
          <div
            style={{
              fontSize: "var(--text-md)",
              fontWeight: 600,
              color: "var(--color-fg)",
            }}
          >
            Drop a CSV here or click to choose
          </div>
          <div style={{ fontSize: 12, color: "var(--color-fg-muted)" }}>
            We parse on the client to preview · 50 MB max for the upload step
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={onChange}
            aria-label="CSV file"
            style={{ display: "none" }}
          />
        </div>
        {error && (
          <p
            role="alert"
            style={{
              marginTop: "var(--space-3)",
              fontSize: "var(--text-sm)",
              color: "var(--color-danger)",
            }}
          >
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      data-testid="csv-preview"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          padding: "var(--space-3) var(--space-4)",
          background: "rgba(52, 211, 153, 0.08)",
          border: "1px solid rgba(52, 211, 153, 0.3)",
          borderRadius: "var(--radius-md)",
          color: "var(--color-success)",
          fontSize: "var(--text-sm)",
        }}
      >
        <CheckCircle2 size={16} />
        <span>
          Parsed{" "}
          <strong style={{ fontFamily: "var(--font-mono)" }}>
            {parsed.fileName}
          </strong>{" "}
          — {parsed.columns.length} columns,{" "}
          {parsed.rows.length.toLocaleString()} rows
        </span>
      </div>

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
          Table name
        </span>
        <input
          type="text"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          aria-label="Table name"
          style={{
            width: "100%",
            padding: "var(--space-2) var(--space-3)",
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-sm)",
            color: "var(--color-fg)",
          }}
        />
      </label>

      <div
        style={{
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          overflow: "auto",
          maxHeight: 280,
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "var(--text-sm)",
          }}
        >
          <thead
            style={{
              position: "sticky",
              top: 0,
              background: "var(--color-bg-subtle)",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <tr>
              {parsed.columns.map((c) => (
                <th
                  key={c}
                  style={{
                    padding: "var(--space-2) var(--space-3)",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "var(--color-fg)",
                  }}
                >
                  <div>{c}</div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      color: "var(--color-fg-subtle)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {parsed.types[c]}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parsed.rows.slice(0, 20).map((r, i) => (
              <tr
                key={i}
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                {parsed.columns.map((c) => (
                  <td
                    key={c}
                    style={{
                      padding: "var(--space-2) var(--space-3)",
                      color: "var(--color-fg-muted)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r[c]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "var(--space-2)",
        }}
      >
        <Button variant="secondary" onClick={() => setParsed(null)}>
          Choose another file
        </Button>
        <Button
          variant="primary"
          iconLeft={<FileSpreadsheet size={14} />}
          onClick={onConfirm}
        >
          Import as `{tableName || "imported_csv"}`
        </Button>
      </div>
    </div>
  );
}
