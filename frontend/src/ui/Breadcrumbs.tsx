import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

export interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  items: Crumb[];
}

export function Breadcrumbs({ items }: Props) {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
        fontSize: "var(--text-xs)",
        color: "var(--color-fg-muted)",
      }}
    >
      {items.map((c, i) => {
        const isLast = i === items.length - 1;
        return (
          <Fragment key={`${c.label}-${i}`}>
            {c.href && !isLast ? (
              <a
                href={c.href}
                style={{
                  color: "var(--color-fg-muted)",
                  textDecoration: "none",
                }}
              >
                {c.label}
              </a>
            ) : (
              <span
                style={{
                  color: isLast ? "var(--color-fg)" : "var(--color-fg-muted)",
                  fontWeight: isLast ? 500 : 400,
                }}
              >
                {c.label}
              </span>
            )}
            {!isLast && (
              <ChevronRight
                size={12}
                aria-hidden
                style={{ color: "var(--color-fg-subtle)" }}
              />
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
