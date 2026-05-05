import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

const SIZE: Record<Size, { padding: string; font: string; height: number }> = {
  sm: {
    padding: "0 var(--space-3)",
    font: "var(--text-sm)",
    height: 28,
  },
  md: {
    padding: "0 var(--space-4)",
    font: "var(--text-base)",
    height: 36,
  },
  lg: {
    padding: "0 var(--space-5)",
    font: "var(--text-md)",
    height: 44,
  },
};

const VARIANT: Record<Variant, React.CSSProperties> = {
  primary: {
    background: "var(--color-primary)",
    color: "var(--color-primary-fg)",
    border: "1px solid var(--color-primary)",
  },
  secondary: {
    background: "var(--color-bg-elev)",
    color: "var(--color-fg)",
    border: "1px solid var(--color-border)",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-fg)",
    border: "1px solid transparent",
  },
  danger: {
    background: "var(--color-danger)",
    color: "#fff",
    border: "1px solid var(--color-danger)",
  },
};

export function Button({
  variant = "secondary",
  size = "md",
  iconLeft,
  iconRight,
  children,
  style,
  ...rest
}: Props) {
  const s = SIZE[size];
  return (
    <button
      {...rest}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-2)",
        padding: s.padding,
        height: s.height,
        fontSize: s.font,
        fontWeight: 500,
        fontFamily: "inherit",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        transition:
          "background var(--motion-fast) var(--ease), border-color var(--motion-fast) var(--ease), color var(--motion-fast) var(--ease)",
        ...VARIANT[variant],
        ...style,
      }}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
