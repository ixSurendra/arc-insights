import { ChevronDown } from "lucide-react";

interface Props {
  workspace: string;
  environment: string;
  branch?: string;
  status?: "live" | "idle";
  onClick?: () => void;
}

export function WorkspacePill({
  workspace,
  environment,
  branch,
  status = "live",
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-2)",
        height: 32,
        padding: "0 var(--space-3)",
        background: "var(--color-bg-elev)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-full)",
        fontFamily: "inherit",
        fontSize: "var(--text-sm)",
        fontWeight: 500,
        color: "var(--color-fg)",
        cursor: "pointer",
        transition: "background var(--motion-fast) var(--ease)",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background:
            status === "live"
              ? "var(--color-success)"
              : "var(--color-fg-subtle)",
        }}
      />
      <span>{workspace}</span>
      <span style={{ color: "var(--color-fg-subtle)" }}>·</span>
      <span style={{ color: "var(--color-fg-muted)" }}>{environment}</span>
      {branch && (
        <>
          <span style={{ color: "var(--color-fg-subtle)" }}>/</span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--color-fg-muted)",
            }}
          >
            {branch}
          </span>
        </>
      )}
      <ChevronDown
        size={12}
        aria-hidden
        style={{ color: "var(--color-fg-subtle)", marginLeft: 2 }}
      />
    </button>
  );
}
