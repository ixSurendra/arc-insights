/**
 * AG Grid Community wrapper for the table chart type.
 *
 * Phase 1 uses the default DOM theme. Phase 3's white-label theming
 * (P3-05) will swap to CSS custom properties so embed customers can
 * brand the grid without recompiling.
 */
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridReact } from "ag-grid-react";
import { type AgGridColumn } from "./adapters";

interface Props {
  columnDefs: AgGridColumn[];
  rowData: Array<Record<string, unknown>>;
  height?: number | string;
  testId?: string;
}

export function DataTable({
  columnDefs,
  rowData,
  height = 320,
  testId,
}: Props) {
  return (
    <div
      data-testid={testId}
      className="ag-theme-quartz"
      style={{ width: "100%", height }}
    >
      <AgGridReact
        columnDefs={columnDefs}
        rowData={rowData}
        animateRows={false}
        suppressMenuHide
      />
    </div>
  );
}
