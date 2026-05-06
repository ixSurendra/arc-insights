/**
 * Data Model — Phase 1 skeleton.
 *
 * The semantic layer: tables & columns (friendly names, FK display
 * labels, field types, hidden columns), metrics & calculations (named
 * metrics + calculated fields), pre-defined joins, and row-level access
 * policies (definitions only — runtime JWT enforcement lands Phase 2).
 *
 * This page surfaces the three tabs so the structure is visible and
 * navigation is end-to-end. Real model authoring lands with P1-21..P1-25.
 */
import { Database, Layers, Lock, Sigma } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "../layout/AppShell";
import { Card, CardHeader } from "../ui/Card";
import { Empty } from "../ui/Empty";

type Tab = "tables" | "metrics" | "policies";

export function DataModelPage() {
  const [tab, setTab] = useState<Tab>("tables");

  return (
    <div style={{ padding: "var(--space-5) var(--space-6)" }}>
      <PageHeader
        breadcrumb="Workspace · Acme · Data Model"
        title="Data Model"
        description="Teach Arc about your data once. Friendly names, foreign-key labels, named metrics, pre-defined joins, and row-level access rules — all consumed by the visual builder, SQL autocomplete, AI, and embedded views."
      />

      <Card padded={false}>
        <div
          role="tablist"
          aria-label="Data Model sections"
          style={{
            display: "flex",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <TabButton
            active={tab === "tables"}
            onClick={() => setTab("tables")}
            icon={<Database size={14} />}
            label="Tables & columns"
          />
          <TabButton
            active={tab === "metrics"}
            onClick={() => setTab("metrics")}
            icon={<Sigma size={14} />}
            label="Metrics & calculations"
          />
          <TabButton
            active={tab === "policies"}
            onClick={() => setTab("policies")}
            icon={<Lock size={14} />}
            label="Access policies"
          />
        </div>

        <div style={{ padding: "var(--space-4) var(--space-5)" }}>
          {tab === "tables" && (
            <CardHeader
              title="Tables & columns"
              subtitle="Friendly names · FK display labels · field types (currency / percent / date / email / URL / category) · hidden columns. Auto-detected on connect; tenant confirms via this surface. Authoring lands with P1-21."
            />
          )}
          {tab === "metrics" && (
            <CardHeader
              title="Metrics & calculations"
              subtitle="Named metrics (e.g. 'Active Users') with canonical logic, plus calculated fields. No-code builder for count / sum / avg / distinct / ratio, or SQL expression for everything else. Land with P1-22."
            />
          )}
          {tab === "policies" && (
            <CardHeader
              title="Access policies"
              subtitle="Row-level rules per table referencing JWT claims (e.g. customers.tenant_customer_id = $jwt.customer_id). Visual builder + SQL escape hatch. Definitions in Phase 1; runtime enforcement in Phase 2 (P2-07)."
            />
          )}
        </div>

        <Empty
          icon={<Layers size={28} />}
          title="No data model yet"
          description="Connect a data source and Arc will auto-detect a starter model. You'll review and confirm friendly names, foreign keys, and field types here."
        />
      </Card>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-2)",
        padding: "var(--space-3) var(--space-4)",
        background: "transparent",
        border: "none",
        borderBottom: active
          ? "2px solid var(--color-primary)"
          : "2px solid transparent",
        color: active ? "var(--color-fg)" : "var(--color-fg-muted)",
        fontSize: "var(--text-sm)",
        fontWeight: 500,
        fontFamily: "inherit",
        cursor: "pointer",
        marginBottom: -1,
      }}
    >
      {icon}
      {label}
    </button>
  );
}
