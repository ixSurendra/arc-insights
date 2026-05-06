/**
 * Schema scan with AI narration — Phase 1.
 *
 * Streams a sequence of narration lines with a typing-style reveal so
 * the tenant sees AI doing real work during onboarding. The narration
 * source is deterministic in Phase 1 (constructed from the parsed
 * schema). The dedicated AI chunk replaces the synthetic stream with a
 * real Ollama Cloud call.
 */
import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { aiEnabled, streamSchemaNarration } from "../lib/ai";
import type { ColumnType } from "./csv";

export interface ScannedTable {
  name: string;
  rowCount?: number;
  columns: Array<{
    name: string;
    type: ColumnType;
  }>;
}

interface Props {
  tables: ScannedTable[];
  /** Fired once all narration lines have streamed in. */
  onComplete?: () => void;
}

export function SchemaScan({ tables, onComplete }: Props) {
  const fallbackLines = buildNarration(tables);
  const [streamedLines, setStreamedLines] = useState<string[] | null>(null);
  const [streamingDone, setStreamingDone] = useState(false);
  const [visible, setVisible] = useState(0);
  const completedRef = useRef(false);

  // Try real AI streaming when enabled; on any failure, fall back.
  useEffect(() => {
    if (!aiEnabled()) return;
    const ctrl = new AbortController();
    let buffer = "";
    let cancelled = false;
    (async () => {
      try {
        const gen = streamSchemaNarration(
          tables.map((t) => ({
            name: t.name,
            rowCount: t.rowCount,
            columns: t.columns.map((c) => ({ name: c.name, type: c.type })),
          })),
          ctrl.signal,
        );
        const all: string[] = [];
        for await (const chunk of gen) {
          if (cancelled) return;
          buffer += chunk;
          // Split on newlines: each completed line becomes a new entry.
          const parts = buffer.split("\n");
          buffer = parts.pop() ?? "";
          for (const p of parts) {
            const trimmed = p.trim();
            if (!trimmed) continue;
            all.push(trimmed);
            setStreamedLines([...all]);
          }
        }
        if (cancelled) return;
        if (buffer.trim()) {
          all.push(buffer.trim());
          setStreamedLines([...all]);
        }
        if (all.length > 0) {
          setStreamingDone(true);
        }
      } catch {
        /* fall back below */
      }
    })();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [tables]);

  // If we got AI lines, drive the reveal off them. Otherwise the
  // deterministic timer below paces the fallback narration.
  const usingAI = streamedLines !== null;
  const lines = usingAI ? streamedLines! : fallbackLines;

  useEffect(() => {
    if (usingAI) {
      if (streamingDone && !completedRef.current) {
        completedRef.current = true;
        const t = setTimeout(() => onComplete?.(), 800);
        return () => clearTimeout(t);
      }
      return;
    }
    if (visible >= lines.length) {
      if (!completedRef.current) {
        completedRef.current = true;
        const t = setTimeout(() => onComplete?.(), 800);
        return () => clearTimeout(t);
      }
      return;
    }
    const delay = lines[visible]?.startsWith("•") ? 360 : 600;
    const t = setTimeout(() => setVisible((v) => v + 1), delay);
    return () => clearTimeout(t);
  }, [visible, lines, onComplete, usingAI, streamingDone]);

  return (
    <div
      style={{
        background: "var(--color-bg-elev)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-5) var(--space-6)",
        minHeight: 240,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          marginBottom: "var(--space-4)",
          color: "var(--color-primary)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        <Sparkles size={12} />
        AI · scanning your schema
      </div>

      <ul
        aria-live="polite"
        aria-busy={usingAI ? !streamingDone : visible < lines.length}
        style={{
          margin: 0,
          padding: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          color: "var(--color-fg)",
          lineHeight: "var(--leading-snug)",
        }}
      >
        {lines.slice(0, usingAI ? lines.length : visible).map((l, i) => (
          <li
            key={`${i}-${l}`}
            style={{
              animation: "arc-fade-up 280ms var(--ease) both",
              color: l.startsWith("•")
                ? "var(--color-fg-muted)"
                : "var(--color-fg)",
            }}
          >
            {l}
          </li>
        ))}
        {(usingAI ? !streamingDone : visible < lines.length) && (
          <li style={{ color: "var(--color-fg-subtle)" }}>
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: 8,
                height: 14,
                background: "var(--color-primary)",
                animation: "arc-cursor-blink 0.9s steps(2) infinite",
                verticalAlign: "middle",
              }}
            />
          </li>
        )}
      </ul>

      <style>{`
        @keyframes arc-cursor-blink {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function buildNarration(tables: ScannedTable[]): string[] {
  if (tables.length === 0) {
    return ["Nothing to scan yet — upload a CSV or connect a database."];
  }

  const lines: string[] = [];
  const tableCount = tables.length;
  lines.push(
    `Found ${tableCount} ${tableCount === 1 ? "table" : "tables"}. Reading column types and relationships…`,
  );

  for (const t of tables) {
    const dt = t.columns.filter(
      (c) => c.type === "date" || c.type === "datetime",
    );
    const num = t.columns.filter(
      (c) => c.type === "integer" || c.type === "float",
    );
    const geo = t.columns.filter((c) => isGeographic(c.name));
    const cat = t.columns.filter(
      (c) => c.type === "string" && !isGeographic(c.name),
    );

    const intro = `\`${t.name}\` · ${t.columns.length} columns${
      t.rowCount ? ` · ${t.rowCount.toLocaleString()} rows` : ""
    }`;
    lines.push(intro);

    if (dt.length) {
      lines.push(
        `• Date column \`${dt[0]?.name}\` — looks like a time axis. Trend chart candidate.`,
      );
    }
    if (num.length) {
      lines.push(
        `• Numeric \`${num[0]?.name}\` — measure for sums and averages.`,
      );
    }
    if (geo.length) {
      lines.push(
        `• Geographic \`${geo[0]?.name}\` — choropleth map candidate.`,
      );
    }
    if (cat.length) {
      lines.push(
        `• Categorical \`${cat[0]?.name}\` — top-N bar chart candidate.`,
      );
    }
  }

  lines.push("Composing your starter dashboard…");
  return lines;
}

function isGeographic(name: string): boolean {
  return /country|region|state|city|province|territory/i.test(name);
}
