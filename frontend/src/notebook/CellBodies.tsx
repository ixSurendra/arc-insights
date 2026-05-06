/**
 * Per-type cell-body renderers. Each returns the children passed to `Cell`.
 *
 * Markdown is hand-rolled (no markdown lib) — Hex notebooks are typically
 * authored, not user-supplied, so a small surface (h1/h2/p/strong/em/code)
 * is enough until P5 ships a real editor.
 */
import { Chart } from "../charts/Chart";
import { RichBigNumber } from "../charts/RichBigNumber";
import type { BigNumberCell, ChartCell, SqlCell, TextCell } from "./types";

export function TextCellBody({ cell }: { cell: TextCell }) {
  return (
    <div
      style={{
        fontSize: "var(--text-md)",
        lineHeight: "var(--leading-relaxed)",
        color: "var(--color-fg)",
        maxWidth: 740,
      }}
    >
      {parseMarkdown(cell.body)}
    </div>
  );
}

export function SqlCellBody({ cell }: { cell: SqlCell }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      <pre
        style={{
          margin: 0,
          padding: "var(--space-3) var(--space-4)",
          background: "var(--color-bg-subtle)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-sm)",
          color: "var(--color-fg)",
          overflowX: "auto",
          whiteSpace: "pre",
        }}
      >
        <code>{highlightSql(cell.sql)}</code>
      </pre>
      {cell.resultRows && cell.resultRows.length > 0 && (
        <ResultTable rows={cell.resultRows} />
      )}
    </div>
  );
}

export function ChartCellBody({ cell }: { cell: ChartCell }) {
  return <Chart config={cell.config} data={cell.data} />;
}

export function BigNumberCellBody({ cell }: { cell: BigNumberCell }) {
  return (
    <RichBigNumber
      label={cell.label}
      value={cell.value}
      delta={cell.delta}
      deltaDirection={cell.deltaDirection}
      deltaSuffix={cell.deltaSuffix}
      sparkline={cell.sparkline}
      subStats={cell.subStats}
    />
  );
}

// ─── Helpers ────────────────────────────────────────────────────────

function ResultTable({ rows }: { rows: Array<Record<string, unknown>> }) {
  if (rows.length === 0) return null;
  const cols = Object.keys(rows[0]!);
  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--space-2) var(--space-3)",
          background: "var(--color-bg-subtle)",
          borderBottom: "1px solid var(--color-border)",
          fontSize: 11,
          color: "var(--color-fg-muted)",
        }}
      >
        <span>
          {rows.length} row{rows.length === 1 ? "" : "s"}
        </span>
        <span style={{ fontFamily: "var(--font-mono)" }}>
          {cols.length} cols
        </span>
      </div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-sm)",
        }}
      >
        <thead>
          <tr>
            {cols.map((c) => (
              <th
                key={c}
                style={{
                  textAlign: "left",
                  padding: "var(--space-2) var(--space-3)",
                  fontWeight: 600,
                  color: "var(--color-fg-muted)",
                  borderBottom: "1px solid var(--color-border)",
                  background: "var(--color-bg)",
                  position: "sticky",
                  top: 0,
                }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 50).map((row, i) => (
            <tr
              key={i}
              style={{
                borderBottom:
                  i === rows.length - 1
                    ? "none"
                    : "1px solid var(--color-border)",
              }}
            >
              {cols.map((c) => (
                <td
                  key={c}
                  style={{
                    padding: "var(--space-2) var(--space-3)",
                    color: "var(--color-fg)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatCell(row[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCell(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "number") return v.toLocaleString();
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

/** Tiny safe-by-construction Markdown subset. */
function parseMarkdown(src: string): React.ReactNode {
  const lines = src.split("\n");
  const out: React.ReactNode[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (line.startsWith("# ")) {
      out.push(
        <h2
          key={i}
          style={{
            fontSize: "var(--text-xl)",
            fontWeight: 700,
            margin: "var(--space-3) 0",
            color: "var(--color-fg)",
            letterSpacing: "-0.01em",
          }}
        >
          {inline(line.slice(2))}
        </h2>,
      );
    } else if (line.startsWith("## ")) {
      out.push(
        <h3
          key={i}
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: 600,
            margin: "var(--space-3) 0",
            color: "var(--color-fg)",
          }}
        >
          {inline(line.slice(3))}
        </h3>,
      );
    } else if (line.trim() === "") {
      // skip — paragraphs separated by blank lines
    } else {
      out.push(
        <p
          key={i}
          style={{
            margin: "0 0 var(--space-3)",
            color: "var(--color-fg-muted)",
          }}
        >
          {inline(line)}
        </p>,
      );
    }
  }
  return out;
}

function inline(text: string): React.ReactNode {
  // Match `code`, **bold**, *em*. Single-pass walk; no HTML, no eval.
  const parts: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) {
      parts.push(
        <strong key={key++} style={{ color: "var(--color-fg)" }}>
          {tok.slice(2, -2)}
        </strong>,
      );
    } else if (tok.startsWith("*")) {
      parts.push(<em key={key++}>{tok.slice(1, -1)}</em>);
    } else {
      parts.push(
        <code
          key={key++}
          style={{
            padding: "1px 6px",
            background: "var(--color-bg-subtle)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            color: "var(--color-cell-sql)",
          }}
        >
          {tok.slice(1, -1)}
        </code>,
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/** Cheap SQL keyword highlighter — wraps known keywords in colored spans. */
function highlightSql(sql: string): React.ReactNode {
  const keywords =
    /\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|ON|AS|AND|OR|NOT|IN|IS|NULL|LIMIT|OFFSET|DISTINCT|UNION|WITH|CASE|WHEN|THEN|ELSE|END|SUM|COUNT|AVG|MIN|MAX|DATE_TRUNC|INTERVAL)\b/gi;
  const stringRe = /'([^']|'')*'/g;
  const numRe = /\b\d+(\.\d+)?\b/g;
  type Tok = { start: number; end: number; node: React.ReactNode };
  const toks: Tok[] = [];

  let m: RegExpExecArray | null;
  while ((m = keywords.exec(sql)) !== null) {
    toks.push({
      start: m.index,
      end: m.index + m[0].length,
      node: (
        <span style={{ color: "var(--color-cell-sql)", fontWeight: 600 }}>
          {m[0]}
        </span>
      ),
    });
  }
  while ((m = stringRe.exec(sql)) !== null) {
    toks.push({
      start: m.index,
      end: m.index + m[0].length,
      node: <span style={{ color: "var(--color-cell-markdown)" }}>{m[0]}</span>,
    });
  }
  while ((m = numRe.exec(sql)) !== null) {
    toks.push({
      start: m.index,
      end: m.index + m[0].length,
      node: <span style={{ color: "var(--color-cell-chart)" }}>{m[0]}</span>,
    });
  }
  toks.sort((a, b) => a.start - b.start);

  const out: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const t of toks) {
    if (t.start < last) continue;
    if (t.start > last) out.push(sql.slice(last, t.start));
    out.push(<span key={key++}>{t.node}</span>);
    last = t.end;
  }
  if (last < sql.length) out.push(sql.slice(last));
  return out;
}
