/**
 * Settings — Phase 1 minimal surface. Three tiles for now:
 *   • AI provider (read-only — driven by backend env in Phase 1; the
 *     Settings → AI editor lands in Phase 2 with per-tenant config)
 *   • Branding (placeholder — sourced from `tenant-service` in Phase 2)
 *   • Local data (reset every Arc Zustand slice in localStorage —
 *     useful when the seed has drifted or a demo needs to start clean)
 */
import { Database, Eraser, Palette, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "../layout/AppShell";
import { resetAllArcStorage } from "../lib/persist";
import { Button } from "../ui/Button";
import { Card, CardHeader } from "../ui/Card";

interface AIHealth {
  configured: boolean;
  provider: string | null;
  baseUrl: string | null;
  modelHigh: string | null;
  modelBalanced: string | null;
  modelFast: string | null;
}

export function SettingsPage() {
  const [health, setHealth] = useState<AIHealth | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/v1/ai/health")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setHealth(data);
      })
      .catch(() => {
        if (!cancelled) setHealth(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const onReset = () => {
    if (
      !confirm(
        "Reset every Arc workspace slice in this browser? Dashboards, widgets, the data model, and reports will revert to seed data. The page will reload.",
      )
    )
      return;
    resetAllArcStorage();
    window.location.reload();
  };

  return (
    <div style={{ padding: "var(--space-5) var(--space-6)" }}>
      <PageHeader
        breadcrumb="Workspace · Acme · Settings"
        title="Settings"
        description="Phase 1 ships a minimal Settings surface. Per-tenant AI provider config, branding, and member management land in Phase 2 once the ix-copilot foundation integration is wired."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        <Card>
          <CardHeader
            title="AI provider"
            subtitle="Read-only in Phase 1 — sourced from backend/.env.local. Per-tenant overrides land in Phase 2."
          />
          {health ? (
            <dl
              style={{
                margin: "var(--space-3) 0 0",
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                rowGap: 6,
                columnGap: "var(--space-3)",
                fontSize: "var(--text-sm)",
              }}
            >
              <dt style={dtStyle}>Status</dt>
              <dd style={ddStyle}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    color: health.configured
                      ? "var(--color-success)"
                      : "var(--color-warning)",
                  }}
                >
                  <Sparkles size={12} />
                  {health.configured ? "Configured" : "Not configured"}
                </span>
              </dd>
              <dt style={dtStyle}>Provider</dt>
              <dd style={ddStyle}>{health.provider ?? "—"}</dd>
              <dt style={dtStyle}>Base URL</dt>
              <dd style={ddStyle}>{health.baseUrl ?? "—"}</dd>
              <dt style={dtStyle}>High-quality model</dt>
              <dd style={ddStyle}>{health.modelHigh ?? "—"}</dd>
              <dt style={dtStyle}>Balanced model</dt>
              <dd style={ddStyle}>{health.modelBalanced ?? "—"}</dd>
              <dt style={dtStyle}>Fast model</dt>
              <dd style={ddStyle}>{health.modelFast ?? "—"}</dd>
            </dl>
          ) : (
            <p
              style={{
                margin: "var(--space-3) 0 0",
                color: "var(--color-fg-muted)",
                fontSize: "var(--text-sm)",
              }}
            >
              Backend AI health check unreachable.
            </p>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Branding"
            subtitle="Read-only in Phase 1. Per-tenant branding (logo, primary/secondary colors) is sourced from ix-copilot's tenant-service in Phase 2."
          />
          <div
            style={{
              marginTop: "var(--space-3)",
              display: "flex",
              gap: "var(--space-3)",
              alignItems: "center",
            }}
          >
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-md)",
                background:
                  "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-primary-fg)",
              }}
            >
              <Palette size={18} />
            </span>
            <div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>
                Acme · default theme
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--color-fg-muted)",
                }}
              >
                Pastel chart palette · cyan UI accent
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Local data"
            subtitle="Dashboards, widgets, the data model, and reports are kept in this browser's localStorage during Phase 1. Reset to revert to the seed."
          />
          <div
            style={{
              marginTop: "var(--space-3)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                fontSize: 11,
                color: "var(--color-fg-subtle)",
              }}
            >
              <Database size={12} />
              Stored under the <code>arc-v1:</code> key prefix
            </div>
            <Button
              variant="danger"
              iconLeft={<Eraser size={14} />}
              onClick={onReset}
              data-testid="reset-workspace"
            >
              Reset workspace state
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

const dtStyle: React.CSSProperties = {
  color: "var(--color-fg-subtle)",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const ddStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  color: "var(--color-fg)",
};
