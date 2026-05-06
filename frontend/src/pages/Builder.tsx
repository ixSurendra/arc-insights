import { Save } from "lucide-react";
import { useMemo, useState } from "react";
import { BuilderPreview } from "../builder/BuilderPreview";
import { QueryBuilder } from "../builder/QueryBuilder";
import { SAMPLE_ROWS, SAMPLE_TABLES } from "../builder/sample-schema";
import type { QuerySpec, SchemaTable } from "../builder/types";
import { PageHeader } from "../layout/AppShell";
import { Button } from "../ui/Button";

export function BuilderPage() {
  const [table, setTable] = useState<SchemaTable>(SAMPLE_TABLES[0]!);
  const [spec, setSpec] = useState<QuerySpec>(() => ({
    from: { schema: SAMPLE_TABLES[0]!.schema, table: SAMPLE_TABLES[0]!.name },
    dimensions: [{ column: "region" }],
    measures: [{ column: "amount", agg: "sum" }],
    filters: [{ column: "status", op: "=", value: "completed" }],
    orderBy: [],
    limit: 1000,
  }));

  const sourceRows = useMemo(
    () => SAMPLE_ROWS[`${table.schema}.${table.name}`] ?? [],
    [table],
  );

  return (
    <div style={{ padding: "var(--space-5) var(--space-6)" }}>
      <PageHeader
        breadcrumb="Workspace · Acme · Queries"
        title="New query"
        description="Build a query visually or paste SQL. Sample dataset until P1-01b wires real data sources."
        actions={
          <>
            <Button variant="secondary">Cancel</Button>
            <Button variant="primary" iconLeft={<Save size={14} />}>
              Save
            </Button>
          </>
        }
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(320px, 420px) 1fr",
          gap: "var(--space-5)",
          alignItems: "flex-start",
        }}
      >
        <QueryBuilder
          table={table}
          spec={spec}
          onChange={setSpec}
          onTableChange={setTable}
        />
        <BuilderPreview spec={spec} rows={sourceRows} />
      </div>
    </div>
  );
}
