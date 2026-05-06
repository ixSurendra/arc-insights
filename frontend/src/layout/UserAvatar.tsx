/**
 * Initials avatar — 28px circle with a 2-color gradient background.
 * Phase 2 will replace the gradient with the user's uploaded image
 * when available.
 */
interface Props {
  initials: string;
  size?: number;
  onClick?: () => void;
}

export function UserAvatar({ initials, size = 28, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Account · ${initials}`}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background:
          "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
        color: "var(--color-primary-fg)",
        fontFamily: "inherit",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.02em",
        border: "1px solid var(--color-border)",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {initials.slice(0, 2).toUpperCase()}
    </button>
  );
}
