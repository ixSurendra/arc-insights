/**
 * Umbrella chart component. Switches on config.type and renders the
 * appropriate concrete component. The visual builder (P1-05) and any
 * embed consumer (Phase 3) talk to this surface, not the per-type
 * components.
 */
import {
  toAgGridColumns,
  toBarOption,
  toBigNumber,
  toLineOption,
  toPieOption,
  toScatterOption,
} from "./adapters";
import { BigNumber } from "./BigNumber";
import { DataTable } from "./DataTable";
import { EChart } from "./EChart";
import { type ChartConfig, type ChartData } from "./types";

interface Props {
  config: ChartConfig;
  data: ChartData;
  height?: number | string;
  /** data-testid passthrough so Playwright can find each chart. */
  testId?: string;
}

export function Chart({ config, data, height, testId }: Props) {
  switch (config.type) {
    case "line":
      return (
        <EChart
          option={toLineOption(config, data)}
          height={height}
          testId={testId}
        />
      );
    case "bar":
      return (
        <EChart
          option={toBarOption(config, data)}
          height={height}
          testId={testId}
        />
      );
    case "pie":
      return (
        <EChart
          option={toPieOption(config, data)}
          height={height}
          testId={testId}
        />
      );
    case "scatter":
      return (
        <EChart
          option={toScatterOption(config, data)}
          height={height}
          testId={testId}
        />
      );
    case "big_number":
      return (
        <BigNumber
          view={toBigNumber(config, data)}
          title={config.title}
          testId={testId}
        />
      );
    case "table":
      return (
        <DataTable
          columnDefs={toAgGridColumns(config, data)}
          rowData={data.rows}
          height={height}
          testId={testId}
        />
      );
  }
}
