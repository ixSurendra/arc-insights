/**
 * Ask-AI door for the widget builder. Phase 1 mock: shows the input,
 * captures the question, simulates AI work with a brief delay, then
 * fires `onApply` with a "translated" QuerySpec the visual builder
 * can edit. Real conversational thread + Ollama call land in the AI
 * chunk; this hooks the contract so the surface is in place.
 */
import { Loader2, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import type { QuerySpec, SchemaTable } from "./types";

interface Props {
  table: SchemaTable;
  onApply: (spec: QuerySpec, naturalQuestion: string) => void;
}

const EXAMPLES = [
  "Total amount by region for last 90 days",
  "Top 10 customers by lifetime value",
  "Daily orders trend for Q2",
];

export function AskAIPanel({ table, onApply }: Props) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [reasoning, setReasoning] = useState<string | null>(null);

  const submit = (text: string) => {
    if (!text.trim()) return;
    setQ(text);
    setBusy(true);
    setReasoning(`Looking at \`${table.schema}.${table.name}\`…`);
    setTimeout(() => {
      setReasoning(
        `Picking dimensions and a measure that match: "${text.slice(0, 80)}"`,
      );
    }, 500);
    setTimeout(() => {
      const spec: QuerySpec = {
        from: { schema: table.schema, table: table.name },
        dimensions: [{ column: pickDim(table) }],
        measures: [{ column: pickMeasure(table), agg: "sum" }],
        filters: [],
        orderBy: [],
        limit: 1000,
      };
      onApply(spec, text);
      setBusy(false);
      setReasoning(null);
    }, 1100);
  };

  return (
    <section
      aria-label="Ask AI"
      style={{
        background: "var(--color-bg-elev)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-5)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        minHeight: 340,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          color: "var(--color-primary)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        <Sparkles size={12} /> Ask AI
      </div>

      <h2
        style={{
          margin: 0,
          fontSize: "var(--text-lg)",
          fontWeight: 600,
          color: "var(--color-fg)",
          lineHeight: "var(--leading-tight)",
        }}
      >
        Describe the widget you want
      </h2>
      <p
        style={{
          margin: 0,
          fontSize: "var(--text-sm)",
          color: "var(--color-fg-muted)",
          maxWidth: 480,
        }}
      >
        AI returns a draft widget on{" "}
        <strong style={{ fontFamily: "var(--font-mono)" }}>
          {table.schema}.{table.name}
        </strong>
        . You can refine in the Visual or SQL doors.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(q);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          padding: "var(--space-2) var(--space-3)",
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
        }}
      >
        <Sparkles size={14} style={{ color: "var(--color-primary)" }} />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. Total amount by region for last 90 days"
          aria-label="Ask AI"
          data-testid="ask-ai-input"
          disabled={busy}
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: "var(--text-md)",
            color: "var(--color-fg)",
            fontFamily: "inherit",
            minWidth: 0,
          }}
        />
        <button
          type="submit"
          disabled={busy || !q.trim()}
          aria-label="Generate widget"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 10px",
            background: "var(--color-primary)",
            color: "var(--color-primary-fg)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            fontFamily: "inherit",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            cursor: busy ? "default" : "pointer",
            opacity: busy ? 0.7 : 1,
          }}
        >
          {busy ? (
            <Loader2 size={12} className="arc-spin" />
          ) : (
            <Send size={12} />
          )}
          {busy ? "Thinking…" : "Generate"}
        </button>
      </form>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          flexWrap: "wrap",
          fontSize: 11,
          color: "var(--color-fg-subtle)",
        }}
      >
        <span style={{ letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Try
        </span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => submit(ex)}
            disabled={busy}
            style={{
              border: "1px dashed var(--color-border)",
              background: "transparent",
              padding: "2px 8px",
              borderRadius: "var(--radius-full)",
              color: "var(--color-fg-muted)",
              fontFamily: "inherit",
              fontSize: 11,
              cursor: busy ? "default" : "pointer",
            }}
          >
            {ex}
          </button>
        ))}
      </div>

      {reasoning && (
        <div
          aria-live="polite"
          style={{
            marginTop: "var(--space-2)",
            padding: "var(--space-3)",
            background: "var(--color-bg-subtle)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--color-fg-muted)",
          }}
        >
          {reasoning}
        </div>
      )}

      <style>{`
        .arc-spin { animation: arc-spin 1s linear infinite; }
        @keyframes arc-spin { to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
}

function pickDim(t: SchemaTable): string {
  const cat = t.columns.find((c) => c.inferredKind === "string");
  return cat?.name ?? t.columns[0]!.name;
}

function pickMeasure(t: SchemaTable): string {
  const num = t.columns.find((c) => c.inferredKind === "number");
  return num?.name ?? "*";
}
