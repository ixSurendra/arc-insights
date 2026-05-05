/**
 * Wraps echarts-for-react for the four ECharts-rendered chart types
 * (line, bar, pie, scatter). The Chart component dispatches the right
 * adapter; this component only knows how to render an EChartsOption.
 */
import ReactECharts from "echarts-for-react";

interface Props {
  option: Record<string, unknown>;
  height?: number | string;
  /** data-testid passthrough for Playwright assertions. */
  testId?: string;
}

export function EChart({ option, height = 320, testId }: Props) {
  return (
    <div data-testid={testId} style={{ width: "100%", height }}>
      <ReactECharts
        option={option}
        style={{ width: "100%", height: "100%" }}
        notMerge
        lazyUpdate
      />
    </div>
  );
}
