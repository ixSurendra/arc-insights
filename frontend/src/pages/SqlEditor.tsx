import { Play, Save } from "lucide-react";
import { useState } from "react";
import { Chart } from "../charts/Chart";
import { SAMPLE_ROWS } from "../builder/sample-schema";
import { PageHeader } from "../layout/AppShell";
import { SqlEditor } from "../sql/SqlEditor";
import { Button } from "../ui/Button";
import { Card, CardHeader } from "../ui/Card";
import { Empty } from "../ui/Empty";

const SAMPLE_SQL = `-- Sample query against public.orders
SELECT region, SUM(amount) AS revenue
FROM public.orders
WHERE status = 'completed'
GROUP BY region
ORDER BY revenue DESC
LIMIT 100;
`;

export function SqlEditorPage() {
  const [sql, setSql] = useState<string>(SAMPLE_SQL);
  const [result, setResult] = useState<Array<Record<string, unknown>> | null>(
    null,
  );

  const onRun = () => {
    // Real execution against a connector lands with P1-01b. For now we
    // surface the sample rows so the result panel is meaningfully
    // populated and the table chart proves the round-trip works.
    setResult(SAMPLE_ROWS["public.orders"] ?? []);
  };

  return (
    <div style={{ padding: "var(--space-5) var(--space-6)" }}>
      <PageHeader
        breadcrumb="Workspace · Acme · Queries"
        title="SQL editor"
        description="Run raw SQL against a connected data source. Real execution lands with P1-01b — for now the result panel returns sample data so the round-trip is testable."
        actions={
          <>
            <Button variant="secondary" iconLeft={<Save size={14} />}>
              Save
            </Button>
            <Button
              variant="primary"
              iconLeft={<Play size={14} />}
              onClick={onRun}
            >
              Run
            </Button>
          </>
        }
      />

      <Card style={{ marginBottom: "var(--space-5)" }}>
        <CardHeader
          title="Editor"
          subtitle="SQL · Postgres dialect · Monaco editor (light/dark follows topbar toggle)"
        />
        <SqlEditor value={sql} onChange={setSql} />
      </Card>

      <Card padded={false}>
        <div style={{ padding: "var(--space-4) var(--space-5)" }}>
          <CardHeader
            title="Result"
            subtitle={
              result === null
                ? "Click Run to populate"
                : `${result.length} row${result.length === 1 ? "" : "s"}`
            }
          />
        </div>
        {result === null ? (
          <Empty
            title="No result yet"
            description="Click Run to execute the query above. Real connector execution lands with P1-01b."
          />
        ) : result.length === 0 ? (
          <Empty title="Query returned 0 rows" />
        ) : (
          <div style={{ padding: "0 var(--space-5) var(--space-5)" }}>
            <Chart
              config={{ type: "table" }}
              data={{ rows: result }}
              testId="sql-result-table"
              height={320}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
