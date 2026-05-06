import { Play, Share2, Sparkles } from "lucide-react";
import { useState } from "react";
import { NotebookView } from "../notebook/Notebook";
import { SAMPLE_NOTEBOOK } from "../notebook/sample-notebook";
import { Button } from "../ui/Button";
import { StatusBadge } from "../ui/StatusBadge";

export function DashboardPage() {
  const [running, setRunning] = useState(false);

  const onRunAll = () => {
    setRunning(true);
    setTimeout(() => setRunning(false), 800);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "calc(100vh - var(--layout-topbar-h))",
      }}
    >
      <NotebookHeader running={running} onRunAll={onRunAll} />
      <NotebookView notebook={SAMPLE_NOTEBOOK} />
    </div>
  );
}

function NotebookHeader({
  running,
  onRunAll,
}: {
  running: boolean;
  onRunAll: () => void;
}) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 5,
        background:
          "linear-gradient(180deg, var(--color-bg) 75%, transparent 100%)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--color-border)",
        padding: "var(--space-5) var(--space-6) var(--space-4)",
        marginBottom: "var(--space-5)",
      }}
    >
      <div
        style={{
          maxWidth: 920,
          margin: "0 auto",
          padding: "0 var(--space-3)",
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
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--color-fg-subtle)",
              marginBottom: "var(--space-2)",
            }}
          >
            <span>Notebook</span>
            <span aria-hidden style={{ opacity: 0.5 }}>
              ·
            </span>
            <span>{SAMPLE_NOTEBOOK.author}</span>
            <span aria-hidden style={{ opacity: 0.5 }}>
              ·
            </span>
            <StatusBadge tone={running ? "warn" : "live"}>
              {running ? "Running…" : "Live · refreshed 12s ago"}
            </StatusBadge>
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: "var(--text-2xl)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              background:
                "linear-gradient(180deg, var(--color-fg), var(--color-fg-muted))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {SAMPLE_NOTEBOOK.title}
          </h1>
          {SAMPLE_NOTEBOOK.description && (
            <p
              style={{
                margin: "var(--space-2) 0 0",
                fontSize: "var(--text-md)",
                color: "var(--color-fg-muted)",
                maxWidth: 720,
              }}
            >
              {SAMPLE_NOTEBOOK.description}
            </p>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            flexShrink: 0,
          }}
        >
          <Button variant="ghost" iconLeft={<Sparkles size={14} />}>
            Magic
          </Button>
          <Button variant="secondary" iconLeft={<Share2 size={14} />}>
            Share
          </Button>
          <Button
            variant="primary"
            iconLeft={<Play size={14} />}
            onClick={onRunAll}
          >
            Run all
          </Button>
        </div>
      </div>
    </header>
  );
}
