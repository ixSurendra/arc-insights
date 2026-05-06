/**
 * Data Model — Phase 1 authoring surface for the semantic layer.
 *
 * Three tabs: Tables & columns · Metrics & calculations · Access
 * policies. State lives in `useDataModel` (in-memory Zustand) — real
 * persistence wires in P1-21..P1-25 once the Drizzle migration and
 * REST routes are exposed by the backend.
 */
import { CheckCircle2, Database, Lock, Sigma } from "lucide-react";
import { useState } from "react";
import { MetricsTab } from "../data-model/MetricsTab";
import { PoliciesTab } from "../data-model/PoliciesTab";
import { useDataModel } from "../data-model/store";
import { TablesTab } from "../data-model/TablesTab";
import { PageHeader } from "../layout/AppShell";
import { Button } from "../ui/Button";

type Tab = "tables" | "metrics" | "policies";

export function DataModelPage() {
  const [tab, setTab] = useState<Tab>("tables");
  const pendingReview = useDataModel((s) => s.model.pendingReview);
  const confirmReview = useDataModel((s) => s.confirmReview);
  const tableCount = useDataModel((s) => s.model.tables.length);
  const metricCount = useDataModel((s) => s.model.metrics.length);
  const policyCount = useDataModel((s) => s.model.policies.length);

  return (
    <div style={{ padding: "var(--space-5) var(--space-6)" }}>
      <PageHeader
        breadcrumb="Workspace · Acme · Data Model"
        title="Data Model"
        description="Teach Arc about your data once. Friendly names, foreign-key labels, named metrics, pre-defined joins, and row-level access rules — all consumed by the visual builder, SQL autocomplete, AI, and embedded views."
        actions={
          pendingReview ? (
            <Button
              variant="primary"
              iconLeft={<CheckCircle2 size={14} />}
              onClick={confirmReview}
              data-testid="confirm-review"
            >
              Confirm review
            </Button>
          ) : (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: "var(--text-sm)",
                color: "var(--color-success)",
              }}
            >
              <CheckCircle2 size={14} />
              Reviewed
            </span>
          )
        }
      />

      {pendingReview && (
        <div
          role="status"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-2) var(--space-3)",
            marginBottom: "var(--space-4)",
            background: "rgba(34, 211, 238, 0.08)",
            border: "1px solid rgba(34, 211, 238, 0.4)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-primary)",
            fontSize: "var(--text-sm)",
          }}
        >
          <span>
            Auto-detected from your last connect. Review the friendly names,
            foreign keys, and metrics, then confirm.
          </span>
        </div>
      )}

      <div
        role="tablist"
        aria-label="Data Model sections"
        style={{
          display: "flex",
          gap: 2,
          padding: 2,
          background: "var(--color-bg-subtle)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          marginBottom: "var(--space-4)",
          width: "max-content",
        }}
      >
        <TabButton
          active={tab === "tables"}
          onClick={() => setTab("tables")}
          icon={<Database size={13} />}
          label="Tables & columns"
          count={tableCount}
          testId="data-model-tab-tables"
        />
        <TabButton
          active={tab === "metrics"}
          onClick={() => setTab("metrics")}
          icon={<Sigma size={13} />}
          label="Metrics & calculations"
          count={metricCount}
          testId="data-model-tab-metrics"
        />
        <TabButton
          active={tab === "policies"}
          onClick={() => setTab("policies")}
          icon={<Lock size={13} />}
          label="Access policies"
          count={policyCount}
          testId="data-model-tab-policies"
        />
      </div>

      {tab === "tables" && <TablesTab />}
      {tab === "metrics" && <MetricsTab />}
      {tab === "policies" && <PoliciesTab />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
  testId,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
  testId: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      data-testid={testId}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        background: active ? "var(--color-bg)" : "transparent",
        color: active ? "var(--color-fg)" : "var(--color-fg-muted)",
        border: "none",
        borderRadius: "var(--radius-sm)",
        fontFamily: "inherit",
        fontSize: "var(--text-sm)",
        fontWeight: 500,
        cursor: "pointer",
        boxShadow: active ? "var(--shadow-sm)" : "none",
        transition:
          "background var(--motion-fast) var(--ease), color var(--motion-fast) var(--ease)",
      }}
    >
      {icon}
      {label}
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          padding: "1px 5px",
          background: active
            ? "var(--color-bg-subtle)"
            : "var(--color-bg-hover)",
          borderRadius: "var(--radius-full)",
          color: "var(--color-fg-muted)",
        }}
      >
        {count}
      </span>
    </button>
  );
}
