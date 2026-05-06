/**
 * Cmd+K command palette using cmdk.
 *
 * Mounted once in AppShell; opens on ⌘K (or Ctrl+K on Linux/Windows) from
 * anywhere in the app. UX-SPEC §1 mandates this — the keyboard-first
 * promise was decorative until now. Surfaces three groups:
 *
 *   - Navigate: jump to any top-level route
 *   - Actions: theme toggle, new dashboard, etc.
 *   - Soon™: AI Q&A (Phase 5) and recent dashboards (P1-10) hook here
 */
import { Command } from "cmdk";
import {
  BarChart3,
  Code2,
  Database,
  LayoutDashboard,
  Moon,
  PanelsTopLeft,
  Plus,
  Settings,
  Sun,
} from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { applyTheme, getInitialTheme, toggleTheme } from "../lib/theme";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: Props) {
  const navigate = useNavigate();

  // Esc closes; intercepted globally so the palette can be invoked from
  // anywhere without each page wiring its own listener.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const go = (href: string) => {
    onClose();
    navigate(href);
  };

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(4px)",
        zIndex: 100,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "12vh",
      }}
    >
      <Command
        label="Command palette"
        loop
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 600,
          maxWidth: "calc(100vw - var(--space-6))",
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden",
        }}
      >
        <Command.Input
          placeholder="Type a command or search…"
          autoFocus
          style={{
            width: "100%",
            height: 48,
            padding: "0 var(--space-5)",
            border: "none",
            borderBottom: "1px solid var(--color-border)",
            background: "transparent",
            color: "var(--color-fg)",
            fontFamily: "inherit",
            fontSize: "var(--text-md)",
            outline: "none",
          }}
        />
        <Command.List
          style={{
            maxHeight: 360,
            overflowY: "auto",
            padding: "var(--space-2)",
          }}
        >
          <Command.Empty
            style={{
              padding: "var(--space-6)",
              textAlign: "center",
              color: "var(--color-fg-muted)",
              fontSize: "var(--text-sm)",
            }}
          >
            No matches.
          </Command.Empty>

          <Group heading="Navigate">
            <Item
              icon={LayoutDashboard}
              label="Overview"
              onSelect={() => go("/")}
            />
            <Item
              icon={PanelsTopLeft}
              label="Dashboards"
              onSelect={() => go("/dashboard")}
            />
            <Item
              icon={BarChart3}
              label="Builder"
              onSelect={() => go("/builder")}
            />
            <Item icon={Code2} label="SQL editor" onSelect={() => go("/sql")} />
            <Item
              icon={Database}
              label="Data sources"
              onSelect={() => go("/data-sources")}
            />
            <Item
              icon={Settings}
              label="Settings"
              onSelect={() => go("/settings")}
            />
          </Group>

          <Group heading="Actions">
            <Item
              icon={Plus}
              label="New dashboard"
              onSelect={() => go("/builder")}
              hint="P1-10 — wires to save flow soon"
            />
            <Item
              icon={Plus}
              label="Connect a data source"
              onSelect={() => go("/data-sources")}
              hint="P1-01b"
            />
            <ThemeToggleItem onSelect={onClose} />
          </Group>
        </Command.List>
      </Command>
    </div>
  );
}

function Group({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <Command.Group heading={heading} style={{ fontSize: "var(--text-xs)" }}>
      <style>{`
        [cmdk-group-heading] {
          padding: var(--space-3) var(--space-3) var(--space-1);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-fg-subtle);
        }
        [cmdk-item] {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          color: var(--color-fg);
          cursor: pointer;
          user-select: none;
        }
        [cmdk-item][data-selected="true"] {
          background: var(--color-bg-hover);
        }
      `}</style>
      {children}
    </Command.Group>
  );
}

function Item({
  icon: Icon,
  label,
  onSelect,
  hint,
}: {
  icon: typeof LayoutDashboard;
  label: string;
  onSelect: () => void;
  hint?: string;
}) {
  return (
    <Command.Item value={label} onSelect={onSelect}>
      <Icon size={16} style={{ color: "var(--color-fg-muted)" }} />
      <span style={{ flex: 1 }}>{label}</span>
      {hint && (
        <span
          style={{
            fontSize: 11,
            color: "var(--color-fg-subtle)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {hint}
        </span>
      )}
    </Command.Item>
  );
}

function ThemeToggleItem({ onSelect }: { onSelect: () => void }) {
  const current = getInitialTheme();
  const next = current === "dark" ? "light" : "dark";
  const Icon = current === "dark" ? Sun : Moon;
  return (
    <Command.Item
      value={`Switch to ${next} mode`}
      onSelect={() => {
        const result = toggleTheme(current);
        applyTheme(result);
        onSelect();
      }}
    >
      <Icon size={16} style={{ color: "var(--color-fg-muted)" }} />
      <span style={{ flex: 1 }}>Switch to {next} mode</span>
    </Command.Item>
  );
}
