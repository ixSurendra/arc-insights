import { Monitor, Smartphone, Tablet } from "lucide-react";
import { SegmentedControl, type Segment } from "./SegmentedControl";

export type Device = "desktop" | "tablet" | "mobile";

const SEGMENTS: Segment<Device>[] = [
  {
    value: "desktop",
    label: <Monitor size={14} />,
    ariaLabel: "Desktop preview",
  },
  {
    value: "tablet",
    label: <Tablet size={14} />,
    ariaLabel: "Tablet preview",
  },
  {
    value: "mobile",
    label: <Smartphone size={14} />,
    ariaLabel: "Mobile preview",
  },
];

export function DeviceToggle({
  value,
  onChange,
}: {
  value: Device;
  onChange: (next: Device) => void;
}) {
  return (
    <SegmentedControl value={value} segments={SEGMENTS} onChange={onChange} />
  );
}
