import { Moon, Search, Shield, Sun } from "lucide-react";
import { useState } from "react";
import {
  applyTheme,
  getInitialTheme,
  toggleTheme,
  type Theme,
} from "../lib/theme";
import { IconButton } from "../ui/IconButton";
import { Logo } from "../ui/Logo";
import { UserAvatar } from "./UserAvatar";
import { WorkspacePill } from "./WorkspacePill";

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
      <Logo variant="wordmark" size={22} />
      <WorkspacePill workspace="Acme" environment="Production" branch="main" />

      {/* Global search / Cmd+K placeholder */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <button
          type="button"
          aria-label="Search (⌘K)"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            width: 420,
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
          <span>Search dashboards, queries, metrics, columns…</span>
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

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
        }}
      >
        <IconButton aria-label="Security & audit" size="sm">
          <Shield size={14} />
        </IconButton>
        <IconButton
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          size="sm"
          onClick={() => {
            const next = toggleTheme(theme);
            applyTheme(next);
            setLocalTheme(next);
          }}
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </IconButton>
        <UserAvatar initials="AM" />
      </div>
    </header>
  );
}
