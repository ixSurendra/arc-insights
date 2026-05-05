import type { CSSProperties } from "react";
import "./skeleton.css";

interface Props {
  width?: number | string;
  height?: number | string;
  radius?: string;
  style?: CSSProperties;
}

export function Skeleton({
  width = "100%",
  height = "1em",
  radius = "var(--radius-sm)",
  style,
}: Props) {
  return (
    <div
      className="arc-skeleton"
      style={{
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
    />
  );
}

/** Skeleton shaped like a chart card — matches what's loading. */
export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        height,
        padding: "var(--space-3)",
      }}
    >
      <Skeleton width={140} height={14} />
      <Skeleton width="100%" height="100%" radius="var(--radius-md)" />
    </div>
  );
}
