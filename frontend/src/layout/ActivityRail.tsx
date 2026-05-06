/**
 * ActivityRail — 56px-wide icon-only vertical nav. Replaces the heavier
 * 240px sidebar so the canvas gets the screen back. Tooltips on hover
 * teach the labels; ⌘K is the discoverable alternative for power users.
 *
 * The active item gets a left-edge gradient bar, not a background pill,
 * so the rail visually retreats when you're not interacting with it.
 */
import {
  BarChart3,
  Code2,
  Database,
  Layers,
  LayoutDashboard,
  type LucideIcon,
  PanelsTopLeft,
  Settings,
  Star,
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface Item {
  icon: LucideIcon;
  label: string;
  href: string;
  end?: boolean;
  starred?: boolean;
}

const PRIMARY: Item[] = [
  { icon: LayoutDashboard, label: "Overview", href: "/", end: true },
  { icon: PanelsTopLeft, label: "Dashboards", href: "/dashboard" },
  { icon: BarChart3, label: "Builder", href: "/builder" },
  { icon: Code2, label: "SQL", href: "/sql" },
  { icon: Database, label: "Data sources", href: "/data-sources" },
  { icon: Layers, label: "Models", href: "/models" },
  { icon: PanelsTopLeft, label: "Embed", href: "/embed", starred: true },
];

const SECONDARY: Item[] = [
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function ActivityRail() {
  return (
    <nav
      aria-label="Primary"
      style={{
        width: 56,
        flexShrink: 0,
        height: "calc(100vh - var(--layout-topbar-h))",
        borderRight: "1px solid var(--color-border)",
        background: "var(--color-bg)",
        padding: "var(--space-3) 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-1)",
        position: "sticky",
        top: "var(--layout-topbar-h)",
      }}
    >
      {PRIMARY.map((item) => (
        <RailItem key={item.label} {...item} />
      ))}
      <div style={{ flex: 1 }} />
      {SECONDARY.map((item) => (
        <RailItem key={item.label} {...item} />
      ))}
      <SelfHostedDot />
    </nav>
  );
}

function RailItem({ icon: Icon, label, href, end, starred }: Item) {
  return (
    <NavLink
      to={href}
      end={end}
      aria-label={label}
      title={label}
      style={({ isActive }) => ({
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        color: isActive ? "var(--color-fg)" : "var(--color-fg-muted)",
        background: isActive ? "var(--color-bg-hover)" : "transparent",
        borderRadius: "var(--radius-md)",
        textDecoration: "none",
        transition:
          "background var(--motion-fast) var(--ease), color var(--motion-fast) var(--ease)",
      })}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: -8,
                top: 8,
                bottom: 8,
                width: 3,
                borderRadius: 2,
                background:
                  "linear-gradient(180deg, var(--color-primary), var(--color-accent))",
              }}
            />
          )}
          <Icon size={18} />
          {starred && (
            <Star
              size={9}
              fill="var(--color-accent)"
              stroke="var(--color-accent)"
              style={{
                position: "absolute",
                top: 6,
                right: 6,
              }}
              aria-hidden
            />
          )}
        </>
      )}
    </NavLink>
  );
}

function SelfHostedDot() {
  return (
    <div
      title="Self-hosted v0.7.3 · License 312 days · Air-gapped"
      aria-label="Self-hosted, license active, air-gapped"
      style={{
        margin: "var(--space-2) 0",
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: "var(--color-success)",
        boxShadow: "0 0 0 3px rgba(22, 163, 74, 0.16)",
      }}
    />
  );
}
