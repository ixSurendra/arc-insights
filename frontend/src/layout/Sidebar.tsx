import {
  BarChart3,
  Database,
  Layers,
  LayoutDashboard,
  Settings,
  type LucideIcon,
  Users,
} from "lucide-react";

interface Item {
  icon: LucideIcon;
  label: string;
  href: string;
  active?: boolean;
}

const ITEMS: Item[] = [
  { icon: LayoutDashboard, label: "Dashboards", href: "/", active: true },
  { icon: BarChart3, label: "Queries", href: "/queries" },
  { icon: Database, label: "Data sources", href: "/data-sources" },
  { icon: Layers, label: "Models", href: "/models" },
  { icon: Users, label: "Team", href: "/team" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  return (
    <nav
      aria-label="Primary"
      style={{
        width: "var(--layout-sidebar-w)",
        flexShrink: 0,
        height: "calc(100vh - var(--layout-topbar-h))",
        borderRight: "1px solid var(--color-border)",
        background: "var(--color-bg)",
        padding: "var(--space-4) var(--space-3)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-1)",
        position: "sticky",
        top: "var(--layout-topbar-h)",
      }}
    >
      {ITEMS.map((item) => (
        <NavItem key={item.label} {...item} />
      ))}
      <div style={{ flex: 1 }} />
      <div
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-fg-subtle)",
          padding: "var(--space-2) var(--space-3)",
        }}
      >
        Phase 1 — Core MVP
      </div>
    </nav>
  );
}

function NavItem({ icon: Icon, label, href, active }: Item) {
  return (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-2) var(--space-3)",
        borderRadius: "var(--radius-md)",
        color: active ? "var(--color-fg)" : "var(--color-fg-muted)",
        background: active ? "var(--color-bg-hover)" : "transparent",
        fontSize: "var(--text-sm)",
        fontWeight: active ? 600 : 500,
        textDecoration: "none",
        transition: "background var(--motion-fast) var(--ease)",
      }}
    >
      <Icon size={16} />
      {label}
    </a>
  );
}
