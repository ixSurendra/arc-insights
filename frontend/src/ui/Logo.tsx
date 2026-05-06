/**
 * The Arc Insights logomark — a crescent shape evoking an "arc". Pure
 * SVG, sized via the `size` prop. Color follows currentColor so it can
 * pick up theme tokens via `style={{ color: 'var(--color-primary)' }}`.
 */
interface Props {
  size?: number;
  /** "mark" = just the crescent. "wordmark" = mark + 'Arc Insights'. */
  variant?: "mark" | "wordmark";
}

export function Logo({ size = 24, variant = "mark" }: Props) {
  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="arcLogoGrad" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="100%" stopColor="var(--color-accent)" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5c5.247 0 9.5 4.253 9.5 9.5s-4.253 9.5-9.5 9.5c-2.082 0-4.008-.671-5.575-1.808a7.5 7.5 0 0 0 0-15.384A9.45 9.45 0 0 1 12 2.5z"
        fill="url(#arcLogoGrad)"
      />
    </svg>
  );

  if (variant === "mark") return mark;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-2)",
      }}
    >
      {mark}
      <span
        style={{
          fontSize: "var(--text-md)",
          fontWeight: 600,
          color: "var(--color-fg)",
          letterSpacing: "-0.01em",
        }}
      >
        Arc{" "}
        <span style={{ color: "var(--color-fg-muted)", fontWeight: 500 }}>
          Insights
        </span>
      </span>
    </span>
  );
}
