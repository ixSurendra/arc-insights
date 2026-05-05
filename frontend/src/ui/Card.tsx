import type { CSSProperties, ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Adds extra padding for content-heavy cards. */
  padded?: boolean;
  /** Removes the border for nested or inline use. */
  flat?: boolean;
  style?: CSSProperties;
  /** data-testid passthrough. */
  testId?: string;
}

export function Card({ children, padded = true, flat, style, testId }: Props) {
  return (
    <div
      data-testid={testId}
      style={{
        background: "var(--color-bg-elev)",
        border: flat ? "none" : "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: padded ? "var(--space-5)" : 0,
        boxShadow: flat ? "none" : "var(--shadow-sm)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "var(--space-4)",
        marginBottom: "var(--space-4)",
      }}
    >
      <div>
        <div style={{ fontSize: "var(--text-md)", fontWeight: 600 }}>
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-fg-muted)",
              marginTop: "var(--space-1)",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
      {actions && (
        <div style={{ display: "flex", gap: "var(--space-2)" }}>{actions}</div>
      )}
    </div>
  );
}
