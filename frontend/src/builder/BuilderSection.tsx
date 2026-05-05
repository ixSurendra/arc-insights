import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../ui/Button";

interface Props {
  title: string;
  description?: string;
  onAdd?: () => void;
  addLabel?: string;
  children: ReactNode;
}

export function BuilderSection({
  title,
  description,
  onAdd,
  addLabel = "Add",
  children,
}: Props) {
  return (
    <section
      style={{
        background: "var(--color-bg-elev)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-3) var(--space-4)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "var(--space-3)",
          marginBottom: "var(--space-3)",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--color-fg-muted)",
            }}
          >
            {title}
          </h3>
          {description && (
            <p
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-fg-subtle)",
                margin: "var(--space-1) 0 0",
              }}
            >
              {description}
            </p>
          )}
        </div>
        {onAdd && (
          <Button
            size="sm"
            variant="ghost"
            iconLeft={<Plus size={14} />}
            onClick={onAdd}
          >
            {addLabel}
          </Button>
        )}
      </header>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
        }}
      >
        {children}
      </div>
    </section>
  );
}

export const inputStyle: React.CSSProperties = {
  flex: 1,
  height: 32,
  padding: "0 var(--space-2)",
  background: "var(--color-bg)",
  color: "var(--color-fg)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  fontFamily: "inherit",
  fontSize: "var(--text-sm)",
};

export const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-2)",
};
