import { Share2 } from "lucide-react";
import { useState } from "react";
import { DashboardView } from "../dashboard/Dashboard";
import { GlobalFilters } from "../dashboard/GlobalFilters";
import { SAMPLE_DASHBOARD } from "../dashboard/sample-dashboard";
import type { Filter } from "../builder/types";
import { PageHeader } from "../layout/AppShell";
import { Button } from "../ui/Button";

const FILTERABLE_COLUMNS = ["region", "status", "amount", "ts"];

export function DashboardPage() {
  const [filters, setFilters] = useState<Filter[]>(
    SAMPLE_DASHBOARD.globalFilters,
  );

  return (
    <>
      <PageHeader
        breadcrumb="Workspace · Acme · Dashboards"
        title={SAMPLE_DASHBOARD.title}
        description={SAMPLE_DASHBOARD.description}
        actions={
          <>
            <Button variant="secondary" iconLeft={<Share2 size={14} />}>
              Share
            </Button>
            <Button variant="primary">Edit</Button>
          </>
        }
      />
      <GlobalFilters
        filters={filters}
        columns={FILTERABLE_COLUMNS}
        onChange={setFilters}
      />
      <DashboardView
        dashboard={{ ...SAMPLE_DASHBOARD, globalFilters: filters }}
      />
    </>
  );
}
