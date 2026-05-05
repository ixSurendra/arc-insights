/**
 * Big-number card. Just text, no charting library.
 */
import { type BigNumberView } from "./adapters";

interface Props {
  view: BigNumberView;
  title?: string;
  testId?: string;
}

export function BigNumber({ view, title, testId }: Props) {
  return (
    <div
      data-testid={testId}
      style={{
        padding: "1.5rem",
        background: "white",
        borderRadius: 8,
        border: "1px solid #E5E9F0",
        textAlign: "center",
      }}
    >
      {title && (
        <div
          style={{
            fontSize: "0.85rem",
            color: "#677",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {title}
        </div>
      )}
      <div
        style={{
          fontSize: "2.5rem",
          fontWeight: 600,
          color: "#1F3A5F",
          marginTop: title ? "0.5rem" : 0,
        }}
      >
        {view.display}
      </div>
      {view.delta !== undefined && (
        <div
          style={{
            fontSize: "0.95rem",
            color: "#5C7CA6",
            marginTop: "0.25rem",
          }}
        >
          Δ {view.delta}
        </div>
      )}
    </div>
  );
}
