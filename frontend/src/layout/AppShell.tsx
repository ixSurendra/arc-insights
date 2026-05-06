import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface Props {
  children: ReactNode;
  /** Optional contextual right rail — e.g. chart properties when editing. */
  rightRail?: ReactNode;
}

export function AppShell({ children, rightRail }: Props) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-bg-subtle)",
      }}
    >
      <TopBar />
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <Sidebar />
        <main
          style={{
            flex: 1,
            minWidth: 0,
            padding: "var(--space-6)",
            overflowX: "hidden",
          }}
        >
          {children}
        </main>
        {rightRail && (
          <aside
            aria-label="Properties"
            style={{
              width: 320,
              flexShrink: 0,
              borderLeft: "1px solid var(--color-border)",
              background: "var(--color-bg)",
              padding: "var(--space-5)",
            }}
          >
            {rightRail}
          </aside>
        )}
      </div>
    </div>
  );
}

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Trailing actions row (right-aligned). */
  actions?: ReactNode;
  /** Either a string ("Workspace · …") or structured Breadcrumbs. */
  breadcrumb?: ReactNode;
  /** Icon rendered before the title (e.g. a starred dashboard). */
  titleIcon?: ReactNode;
  /** Pill rendered after the title (e.g. folder name "Finance"). */
  tag?: ReactNode;
  /** Status badge rendered after the tag (e.g. "Live · refreshed 12s ago"). */
  status?: ReactNode;
  /** Toolbar row above actions — for device toggle, refresh, etc. */
  toolbar?: ReactNode;
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  titleIcon,
  tag,
  status,
  toolbar,
}: PageHeaderProps) {
  return (
    <header style={{ marginBottom: "var(--space-6)" }}>
      {breadcrumb && (
        <div
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-fg-muted)",
            marginBottom: "var(--space-2)",
          }}
        >
          {breadcrumb}
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "var(--space-4)",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              flexWrap: "wrap",
            }}
          >
            {titleIcon && (
              <span
                style={{ color: "var(--color-accent)", display: "inline-flex" }}
              >
                {titleIcon}
              </span>
            )}
            <h1
              style={{
                fontSize: "var(--text-xl)",
                fontWeight: 600,
                margin: 0,
                color: "var(--color-fg)",
              }}
            >
              {title}
            </h1>
            {tag && (
              <span
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-fg-muted)",
                  fontWeight: 500,
                  padding: "2px var(--space-2)",
                  background: "var(--color-bg-subtle)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                {tag}
              </span>
            )}
            {status}
          </div>
          {description && (
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-fg-muted)",
                margin: "var(--space-2) 0 0",
                maxWidth: 720,
              }}
            >
              {description}
            </p>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            flexShrink: 0,
          }}
        >
          {toolbar && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              {toolbar}
            </div>
          )}
          {actions && (
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
