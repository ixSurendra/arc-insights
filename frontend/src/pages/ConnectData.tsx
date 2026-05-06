/**
 * Connect data — Phase 1 onboarding wizard.
 *
 * Drives the locked brand-new-tenant flow: pick DB or CSV → fill the
 * form / parse the file → AI narrates the schema scan → starter
 * dashboard previews. The "I'll do this later" link drops the tenant
 * straight on Home.
 *
 * Routes:
 *   /data-sources/new            → tile picker
 *   /data-sources/new?type=db    → DB connector form
 *   /data-sources/new?type=csv   → CSV upload
 *
 * After a connection is established the same page transitions through
 * scan → preview without changing the URL — keeps the wizard in one
 * coherent surface and lets the back button return to the picker.
 */
import { ArrowLeft, Database, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CsvUpload } from "../connect/CsvUpload";
import { DbConnectorForm } from "../connect/DbConnectorForm";
import { type ScannedTable, SchemaScan } from "../connect/SchemaScan";
import {
  generateStarterDashboard,
  type StarterWidget,
} from "../connect/starter-dashboard";
import { StarterDashboardPreview } from "../connect/StarterDashboardPreview";
import { PageHeader } from "../layout/AppShell";

type Mode = "pick" | "db" | "csv" | "scanning" | "ready";

export function ConnectDataPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initial = (searchParams.get("type") as Mode | null) ?? "pick";
  const [mode, setMode] = useState<Mode>(
    initial === "db" || initial === "csv" ? initial : "pick",
  );
  const [tables, setTables] = useState<ScannedTable[]>([]);
  const [sourceName, setSourceName] = useState<string>("");
  const [starterWidgets, setStarterWidgets] = useState<StarterWidget[]>([]);

  const goBack = () => {
    setMode("pick");
    setTables([]);
    setSourceName("");
    setStarterWidgets([]);
    setSearchParams({});
  };

  const onConnected = (
    scanned: ScannedTable[],
    _driver: string,
    name: string,
  ) => {
    setTables(scanned);
    setSourceName(name);
    setMode("scanning");
  };

  const onCsvParsed = (
    table: ScannedTable,
    _rows: Array<Record<string, string>>,
  ) => {
    setTables([table]);
    setSourceName(table.name);
    setMode("scanning");
  };

  const onScanComplete = () => {
    setStarterWidgets(generateStarterDashboard(tables));
    setMode("ready");
  };

  return (
    <div style={{ padding: "var(--space-5) var(--space-6)" }}>
      <PageHeader
        breadcrumb="Workspace · Acme · Data Sources · New"
        title={
          mode === "pick"
            ? "Connect data"
            : mode === "db"
              ? "Connect a database"
              : mode === "csv"
                ? "Upload a CSV"
                : mode === "scanning"
                  ? "Scanning your data"
                  : "Your starter dashboard"
        }
        description={
          mode === "pick"
            ? "Two ways in. Connect a database for live, refreshable data, or upload a CSV for one-off exploration. AI handles the rest."
            : mode === "db"
              ? "Test the connection first. We never store passwords in plain text — Phase 2 wires the encrypted secrets store."
              : mode === "csv"
                ? "Drop a file. We parse on the client to preview, then import. 50 MB max for the upload step."
                : mode === "scanning"
                  ? "Reading tables, columns, and relationships. Composing a starter dashboard."
                  : "Six widgets generated from your schema. Tweak any in the builder, or save and explore."
        }
        actions={
          mode !== "pick" ? (
            <button
              type="button"
              onClick={goBack}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "transparent",
                border: "none",
                color: "var(--color-fg-muted)",
                cursor: "pointer",
                fontSize: "var(--text-sm)",
                fontFamily: "inherit",
              }}
            >
              <ArrowLeft size={14} />
              Start over
            </button>
          ) : (
            <Link
              to="/"
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-fg-muted)",
                textDecoration: "none",
              }}
            >
              I&apos;ll do this later →
            </Link>
          )
        }
      />

      {mode === "pick" && (
        <Picker
          onPick={(m) => {
            setMode(m);
            setSearchParams({ type: m });
          }}
        />
      )}

      {mode === "db" && <DbConnectorForm onConnected={onConnected} />}

      {mode === "csv" && <CsvUpload onParsed={onCsvParsed} />}

      {mode === "scanning" && (
        <SchemaScan tables={tables} onComplete={onScanComplete} />
      )}

      {mode === "ready" && (
        <StarterDashboardPreview
          widgets={starterWidgets}
          sourceName={sourceName}
        />
      )}
    </div>
  );
}

function Picker({ onPick }: { onPick: (mode: "db" | "csv") => void }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "var(--space-4)",
        marginTop: "var(--space-4)",
      }}
    >
      <Tile
        icon={<Database size={28} />}
        title="Connect a database"
        blurb="Postgres · MySQL · BigQuery · Snowflake. Read-only credentials. SSH tunnel optional."
        onClick={() => onPick("db")}
        testId="picker-db"
      />
      <Tile
        icon={<FileSpreadsheet size={28} />}
        title="Upload a CSV"
        blurb="Drag-drop or pick a file. We infer column types and preview before importing."
        onClick={() => onPick("csv")}
        testId="picker-csv"
      />
    </div>
  );
}

function Tile({
  icon,
  title,
  blurb,
  onClick,
  testId,
}: {
  icon: React.ReactNode;
  title: string;
  blurb: string;
  onClick: () => void;
  testId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className="arc-card-lift"
      style={{
        background: "var(--color-bg-elev)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-8) var(--space-6)",
        textAlign: "left",
        cursor: "pointer",
        fontFamily: "inherit",
        color: "var(--color-fg)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      <span
        style={{
          width: 56,
          height: 56,
          borderRadius: "var(--radius-lg)",
          background:
            "linear-gradient(135deg, rgba(34, 211, 238, 0.16), rgba(56, 189, 248, 0.10))",
          color: "var(--color-primary)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </span>
      <div
        style={{
          fontSize: "var(--text-lg)",
          fontWeight: 600,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--color-fg-muted)",
          lineHeight: "var(--leading-snug)",
          maxWidth: 360,
        }}
      >
        {blurb}
      </div>
    </button>
  );
}
