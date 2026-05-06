/**
 * DB connector form — Phase 1 connect-data flow.
 *
 * Picker for the four supported drivers + a generic credentials form.
 * Real connection test wires to the backend connectors (P1-01..P1-04)
 * later; for the Phase 1 wizard a successful "Test connection" simulates
 * the backend response so the schema-scan + starter-dashboard flow can
 * run end-to-end against mock data.
 */
import { CheckCircle2, Database, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";
import type { ScannedTable } from "./SchemaScan";

type Driver = "postgres" | "mysql" | "bigquery" | "snowflake";

interface DriverMeta {
  id: Driver;
  label: string;
  defaultPort: number | null;
  blurb: string;
  fields: Array<"host" | "port" | "user" | "password" | "database" | "schema">;
}

const DRIVERS: DriverMeta[] = [
  {
    id: "postgres",
    label: "Postgres",
    defaultPort: 5432,
    blurb: "Standard credentials. SSL on by default; SSH tunnel optional.",
    fields: ["host", "port", "user", "password", "database"],
  },
  {
    id: "mysql",
    label: "MySQL · MariaDB",
    defaultPort: 3306,
    blurb: "Standard credentials. Use a read-only role.",
    fields: ["host", "port", "user", "password", "database"],
  },
  {
    id: "bigquery",
    label: "BigQuery",
    defaultPort: null,
    blurb: "Service-account JSON. We never store the key in plain text.",
    fields: ["database"],
  },
  {
    id: "snowflake",
    label: "Snowflake",
    defaultPort: null,
    blurb: "Key-pair auth. Account locator + warehouse + role + database.",
    fields: ["host", "user", "database", "schema"],
  },
];

interface Props {
  onConnected: (tables: ScannedTable[], driver: Driver, name: string) => void;
}

export function DbConnectorForm({ onConnected }: Props) {
  const [driver, setDriver] = useState<Driver>("postgres");
  const [host, setHost] = useState("");
  const [port, setPort] = useState<string>("");
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [database, setDatabase] = useState("");
  const [schema, setSchema] = useState("public");
  const [name, setName] = useState("warehouse·prod");
  const [testState, setTestState] = useState<
    "idle" | "testing" | "ok" | "error"
  >("idle");

  const meta = DRIVERS.find((d) => d.id === driver)!;

  const onTest = () => {
    setTestState("testing");
    // Mock — real backend test wires later. The 700 ms feels like a real
    // network round-trip without dragging onboarding.
    setTimeout(() => setTestState("ok"), 700);
  };

  const onConnect = () => {
    onConnected(MOCK_TABLES_BY_DRIVER[driver], driver, name || meta.label);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-5)",
      }}
    >
      <div>
        <label
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--color-fg-subtle)",
            display: "block",
            marginBottom: "var(--space-2)",
          }}
        >
          Driver
        </label>
        <div
          role="radiogroup"
          aria-label="Database driver"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--space-2)",
          }}
        >
          {DRIVERS.map((d) => {
            const active = d.id === driver;
            return (
              <button
                key={d.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  setDriver(d.id);
                  if (d.defaultPort) setPort(String(d.defaultPort));
                  setTestState("idle");
                }}
                style={{
                  textAlign: "left",
                  padding: "var(--space-3) var(--space-4)",
                  background: active
                    ? "var(--color-bg-elev)"
                    : "var(--color-bg)",
                  border: active
                    ? "1px solid var(--color-primary)"
                    : "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  color: "var(--color-fg)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    fontSize: "var(--text-sm)",
                    fontWeight: 600,
                  }}
                >
                  <Database size={14} />
                  {d.label}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-fg-muted)",
                    lineHeight: "var(--leading-snug)",
                  }}
                >
                  {d.blurb}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "var(--space-3)",
        }}
      >
        <Field
          label="Connection name"
          value={name}
          onChange={setName}
          placeholder="warehouse·prod"
        />
        {meta.fields.includes("host") && (
          <Field
            label="Host"
            value={host}
            onChange={setHost}
            placeholder="db.internal.acme.com"
          />
        )}
        {meta.fields.includes("port") && (
          <Field
            label="Port"
            value={port}
            onChange={setPort}
            placeholder={meta.defaultPort ? String(meta.defaultPort) : ""}
          />
        )}
        {meta.fields.includes("user") && (
          <Field label="Username" value={user} onChange={setUser} />
        )}
        {meta.fields.includes("password") && (
          <Field
            label="Password"
            value={password}
            onChange={setPassword}
            type="password"
          />
        )}
        {meta.fields.includes("database") && (
          <Field
            label="Database"
            value={database}
            onChange={setDatabase}
            placeholder="analytics"
          />
        )}
        {meta.fields.includes("schema") && (
          <Field label="Schema" value={schema} onChange={setSchema} />
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "var(--space-3)",
          flexWrap: "wrap",
        }}
      >
        <div
          aria-live="polite"
          style={{
            fontSize: "var(--text-sm)",
            color:
              testState === "ok"
                ? "var(--color-success)"
                : testState === "error"
                  ? "var(--color-danger)"
                  : "var(--color-fg-muted)",
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          {testState === "testing" && (
            <>
              <Loader2 size={14} className="arc-spin" /> Testing connection…
            </>
          )}
          {testState === "ok" && (
            <>
              <CheckCircle2 size={14} /> Connection looks good. Click Connect to
              run the schema scan.
            </>
          )}
          {testState === "idle" && (
            <span>Test the connection before saving.</span>
          )}
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Button
            variant="secondary"
            onClick={onTest}
            disabled={testState === "testing"}
          >
            Test connection
          </Button>
          <Button
            variant="primary"
            onClick={onConnect}
            disabled={testState !== "ok"}
          >
            Connect
          </Button>
        </div>
      </div>

      <style>{`
        .arc-spin { animation: arc-spin 1s linear infinite; }
        @keyframes arc-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "password";
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
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        style={{
          padding: "var(--space-2) var(--space-3)",
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          fontFamily: type === "password" ? "var(--font-mono)" : "inherit",
          fontSize: "var(--text-sm)",
          color: "var(--color-fg)",
        }}
      />
    </label>
  );
}

// Mock schema we report after a "successful" test in Phase 1. Real
// connectors return real schemas via P1-01..P1-04; until those routes
// are exposed the wizard runs against this so the rest of the flow
// (narration + starter dashboard) can be exercised.
const MOCK_TABLES_BY_DRIVER: Record<Driver, ScannedTable[]> = {
  postgres: [
    {
      name: "orders",
      rowCount: 248_142,
      columns: [
        { name: "id", type: "integer" },
        { name: "customer_id", type: "integer" },
        { name: "amount", type: "float" },
        { name: "status", type: "string" },
        { name: "country", type: "string" },
        { name: "created_at", type: "datetime" },
      ],
    },
    {
      name: "customers",
      rowCount: 18_503,
      columns: [
        { name: "id", type: "integer" },
        { name: "name", type: "string" },
        { name: "email", type: "string" },
        { name: "country", type: "string" },
        { name: "signed_up_at", type: "datetime" },
      ],
    },
  ],
  mysql: [
    {
      name: "events",
      rowCount: 1_204_558,
      columns: [
        { name: "id", type: "integer" },
        { name: "user_id", type: "integer" },
        { name: "event_type", type: "string" },
        { name: "occurred_at", type: "datetime" },
      ],
    },
  ],
  bigquery: [
    {
      name: "ga_sessions",
      rowCount: 9_840_212,
      columns: [
        { name: "session_id", type: "string" },
        { name: "user_id", type: "string" },
        { name: "channel", type: "string" },
        { name: "country", type: "string" },
        { name: "session_start", type: "datetime" },
      ],
    },
  ],
  snowflake: [
    {
      name: "fact_revenue",
      rowCount: 4_211_988,
      columns: [
        { name: "transaction_id", type: "integer" },
        { name: "account_id", type: "integer" },
        { name: "region", type: "string" },
        { name: "amount_usd", type: "float" },
        { name: "transaction_date", type: "date" },
      ],
    },
  ],
};
