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
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface Item {
  icon: LucideIcon;
  label: string;
  href: string;
  end?: boolean;
  /** Optional count badge (e.g. "126" next to Dashboards). */
  count?: number;
  /** Show a gold ★ next to the label for ★-marked features (Embed). */
  starred?: boolean;
}

interface Section {
  heading?: string;
  items: Item[];
}

const SECTIONS: Section[] = [
  {
    items: [
      { icon: LayoutDashboard, label: "Overview", href: "/", end: true },
      {
        icon: PanelsTopLeft,
        label: "Dashboards",
        href: "/dashboard",
        count: 126,
      },
      { icon: BarChart3, label: "Builder", href: "/builder" },
      { icon: Code2, label: "SQL", href: "/sql" },
    ],
  },
  {
    heading: "Data",
    items: [
      {
        icon: Database,
        label: "Data sources",
        href: "/data-sources",
        count: 5,
      },
      { icon: Layers, label: "Models", href: "/models" },
      {
        icon: PanelsTopLeft,
        label: "Embed",
        href: "/embed",
        starred: true,
      },
    ],
  },
  {
    heading: "Workspace",
    items: [
      { icon: Users, label: "Team", href: "/team" },
      { icon: Settings, label: "Settings", href: "/settings" },
    ],
  },
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
        position: "sticky",
        top: "var(--layout-topbar-h)",
        overflowY: "auto",
      }}
    >
      {SECTIONS.map((section, i) => (
        <div
          key={section.heading ?? `section-${i}`}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            marginBottom: "var(--space-4)",
          }}
        >
          {section.heading && (
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--color-fg-subtle)",
                padding: "var(--space-2) var(--space-3) var(--space-1)",
              }}
            >
              {section.heading}
            </div>
          )}
          {section.items.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <SelfHostedFooter />
    </nav>
  );
}

function NavItem({ icon: Icon, label, href, end, count, starred }: Item) {
  return (
    <NavLink
      to={href}
      end={end}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-2) var(--space-3)",
        borderRadius: "var(--radius-md)",
        color: isActive ? "var(--color-fg)" : "var(--color-fg-muted)",
        background: isActive ? "var(--color-bg-hover)" : "transparent",
        fontSize: "var(--text-sm)",
        fontWeight: isActive ? 600 : 500,
        textDecoration: "none",
        transition: "background var(--motion-fast) var(--ease)",
      })}
    >
      <Icon size={16} />
      <span style={{ flex: 1, minWidth: 0 }}>{label}</span>
      {starred && (
        <Star
          size={12}
          fill="var(--color-accent)"
          stroke="var(--color-accent)"
          aria-label="Strategic feature"
        />
      )}
      {typeof count === "number" && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "var(--color-fg-subtle)",
            background: "var(--color-bg-subtle)",
            padding: "1px 6px",
            borderRadius: "var(--radius-full)",
          }}
        >
          {count}
        </span>
      )}
    </NavLink>
  );
}

function SelfHostedFooter() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "var(--space-3)",
        background: "var(--color-bg-subtle)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        fontSize: 11,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-2)",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontWeight: 600,
            color: "var(--color-fg)",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--color-success)",
            }}
          />
          Self-hosted
        </span>
        <span style={{ color: "var(--color-fg-subtle)" }}>v0.7.3</span>
      </div>
      <div style={{ color: "var(--color-fg-muted)" }}>
        License · 312 days left
      </div>
      <div style={{ color: "var(--color-fg-subtle)" }}>
        Air-gapped · telemetry off
      </div>
    </div>
  );
}
