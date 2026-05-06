import type { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required — accessibility. */
  "aria-label": string;
  children: ReactNode;
  size?: "sm" | "md";
  /** subtle = transparent until hover; outlined = border at rest. */
  variant?: "subtle" | "outlined";
}

const SIZE = { sm: 28, md: 32 } as const;

export function IconButton({
  size = "md",
  variant = "subtle",
  style,
  children,
  ...rest
}: Props) {
  const dim = SIZE[size];
  return (
    <button
      type="button"
      {...rest}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: dim,
        height: dim,
        background:
          variant === "outlined" ? "var(--color-bg-elev)" : "transparent",
        color: "var(--color-fg-muted)",
        border:
          variant === "outlined"
            ? "1px solid var(--color-border)"
            : "1px solid transparent",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        transition:
          "background var(--motion-fast) var(--ease), color var(--motion-fast) var(--ease), border-color var(--motion-fast) var(--ease)",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
