import { Eye, RotateCw, Share2, Star } from "lucide-react";
import { useState } from "react";
import type { Filter } from "../builder/types";
import { DashboardView } from "../dashboard/Dashboard";
import { GlobalFilters } from "../dashboard/GlobalFilters";
import { SAMPLE_DASHBOARD } from "../dashboard/sample-dashboard";
import { PageHeader } from "../layout/AppShell";
import { Breadcrumbs } from "../ui/Breadcrumbs";
import { Button } from "../ui/Button";
import { DeviceToggle, type Device } from "../ui/DeviceToggle";
import { IconButton } from "../ui/IconButton";
import { SegmentedControl, type Segment } from "../ui/SegmentedControl";
import { StatusBadge } from "../ui/StatusBadge";

const FILTERABLE_COLUMNS = ["region", "status", "amount", "ts", "channel"];

type Mode = "view" | "edit";
const MODE_SEGMENTS: Segment<Mode>[] = [
  {
    value: "view",
    label: (
      <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
        <Eye size={12} /> View
      </span>
    ),
  },
  { value: "edit", label: "Edit" },
];

export function DashboardPage() {
  const [filters, setFilters] = useState<Filter[]>(
    SAMPLE_DASHBOARD.globalFilters,
  );
  const [device, setDevice] = useState<Device>("desktop");
  const [mode, setMode] = useState<Mode>("view");

  return (
    <>
      <PageHeader
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: "Workspace", href: "/" },
              { label: "Dashboards", href: "/dashboard" },
              { label: "Finance" },
              { label: SAMPLE_DASHBOARD.title },
            ]}
          />
        }
        titleIcon={<Star size={18} fill="currentColor" />}
        title={SAMPLE_DASHBOARD.title}
        tag="Finance"
        status={<StatusBadge tone="live">Live · refreshed 12s ago</StatusBadge>}
        description={SAMPLE_DASHBOARD.description}
        toolbar={
          <>
            <DeviceToggle value={device} onChange={setDevice} />
            <IconButton aria-label="Refresh" size="sm">
              <RotateCw size={14} />
            </IconButton>
          </>
        }
        actions={
          <>
            <Button variant="secondary" iconLeft={<Share2 size={14} />}>
              Share
            </Button>
            <SegmentedControl
              value={mode}
              segments={MODE_SEGMENTS}
              onChange={setMode}
            />
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
