import { Moon, Search, Sun } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";
import {
  applyTheme,
  getInitialTheme,
  toggleTheme,
  type Theme,
} from "../lib/theme";

export function TopBar() {
  const [theme, setLocalTheme] = useState<Theme>(getInitialTheme);

  return (
    <header
      style={{
        height: "var(--layout-topbar-h)",
        display: "flex",
        alignItems: "center",
        gap: "var(--space-4)",
        padding: "0 var(--space-5)",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-bg)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Workspace switcher placeholder */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          fontSize: "var(--text-base)",
          fontWeight: 600,
        }}
      >
        <div
          aria-hidden
          style={{
            width: 24,
            height: 24,
            borderRadius: "var(--radius-sm)",
            background:
              "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
          }}
        />
        Arc Insights
        <span
          style={{
            fontSize: "var(--text-xs)",
            fontWeight: 500,
            color: "var(--color-fg-muted)",
            padding: "2px var(--space-2)",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--color-border)",
            marginLeft: "var(--space-2)",
          }}
        >
          Acme · Production
        </span>
      </div>

      {/* Global search / Cmd+K placeholder */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <button
          type="button"
          aria-label="Search (⌘K)"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            width: 360,
            maxWidth: "100%",
            height: 32,
            padding: "0 var(--space-3)",
            background: "var(--color-bg-subtle)",
            color: "var(--color-fg-muted)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            fontSize: "var(--text-sm)",
            fontFamily: "inherit",
          }}
        >
          <Search size={14} />
          <span>Search dashboards, queries, metrics…</span>
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              padding: "1px 6px",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              background: "var(--color-bg)",
            }}
          >
            ⌘K
          </span>
        </button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        aria-label={
          theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
        onClick={() => {
          const next = toggleTheme(theme);
          applyTheme(next);
          setLocalTheme(next);
        }}
        iconLeft={theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
      >
        {theme === "dark" ? "Light" : "Dark"}
      </Button>
    </header>
  );
}
