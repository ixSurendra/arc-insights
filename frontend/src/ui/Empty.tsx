import type { ReactNode } from "react";

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function Empty({ icon, title, description, action }: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "var(--space-10) var(--space-6)",
        color: "var(--color-fg-muted)",
      }}
    >
      {icon && (
        <div
          style={{
            color: "var(--color-fg-subtle)",
            marginBottom: "var(--space-3)",
          }}
        >
          {icon}
        </div>
      )}
      <div
        style={{
          fontSize: "var(--text-md)",
          fontWeight: 600,
          color: "var(--color-fg)",
        }}
      >
        {title}
      </div>
      {description && (
        <div
          style={{
            fontSize: "var(--text-sm)",
            marginTop: "var(--space-2)",
            maxWidth: 360,
          }}
        >
          {description}
        </div>
      )}
      {action && <div style={{ marginTop: "var(--space-4)" }}>{action}</div>}
    </div>
  );
}
