/**
 * Frontend AI client — wraps the backend `/v1/ai/*` routes.
 *
 * Behavior contract:
 *   • If VITE_ARC_AI_DISABLED is "true" → return null / use fallback
 *     so the deterministic mocks still drive the surface (tests &
 *     air-gapped previews).
 *   • Otherwise call the backend. On any failure (network, non-200,
 *     timeout) → return null so the caller can fall back gracefully.
 *
 * Honors UX-SPEC §10 contracts (streaming + visible reasoning,
 * never-fake-an-answer, always-cite-the-work).
 */

const API_BASE = "/v1/ai";
const DEFAULT_TIMEOUT_MS = 30_000;

export function aiEnabled(): boolean {
  // Vite replaces import.meta.env.VITE_* at build time. Default to
  // enabled; the playwright config flips this off for tests.
  const flag = import.meta.env.VITE_ARC_AI_DISABLED as string | undefined;
  return flag !== "true";
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ScannedTableSummary {
  name: string;
  rowCount?: number;
  columns: Array<{ name: string; type: string }>;
}

interface NdjsonChunk {
  chunk?: string;
  error?: string;
  done?: boolean;
}

/**
 * Stream narration lines for a connect-data schema scan. Yields each
 * partial AI delta as it arrives. Returns nothing (and the caller
 * should fall back to deterministic narration) if AI is disabled or
 * the request fails.
 */
export async function* streamSchemaNarration(
  tables: ScannedTableSummary[],
  signal?: AbortSignal,
): AsyncGenerator<string, "ok" | "fallback", unknown> {
  if (!aiEnabled()) return "fallback";
  try {
    const res = await fetch(`${API_BASE}/schema-narration`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tables }),
      signal: timeoutSignal(signal),
    });
    if (!res.ok || !res.body) return "fallback";
    for await (const obj of readNdjson(res.body)) {
      if (obj.error) return "fallback";
      if (obj.chunk) yield obj.chunk;
      if (obj.done) return "ok";
    }
    return "ok";
  } catch {
    return "fallback";
  }
}

export interface QuerySpecLike {
  from: { schema: string; table: string };
  dimensions: Array<{ column: string; alias?: string }>;
  measures: Array<{
    column: string;
    agg: "sum" | "count" | "count_distinct" | "avg" | "min" | "max";
    alias?: string;
  }>;
  filters: Array<{ column: string; op: string; value?: unknown }>;
  orderBy: Array<{ column: string; direction: "asc" | "desc" }>;
  limit: number;
  explanation?: string;
}

/**
 * Ask AI to translate a natural-language question into a draft query
 * spec on the given table. Returns null on any failure or if AI is
 * disabled — caller should fall back to a deterministic stub.
 */
export async function suggestWidgetSpec(
  table: { schema: string; name: string },
  columns: Array<{ name: string; kind: string }>,
  question: string,
  signal?: AbortSignal,
): Promise<QuerySpecLike | null> {
  if (!aiEnabled()) return null;
  try {
    const res = await fetch(`${API_BASE}/widget-spec`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table, columns, question }),
      signal: timeoutSignal(signal),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { spec?: QuerySpecLike; error?: string };
    if (data.error || !data.spec) return null;
    // Defensive: ensure `from` matches the table — the model occasionally
    // hallucinates a different schema/table.
    const spec = {
      ...data.spec,
      from: { schema: table.schema, table: table.name },
      filters: data.spec.filters ?? [],
      orderBy: data.spec.orderBy ?? [],
      limit: data.spec.limit ?? 1000,
    };
    return spec;
  } catch {
    return null;
  }
}

/**
 * Generic chat stream — used by the Home page Ask AI input and the
 * widget-builder Ask AI panel for free-form follow-up.
 */
export async function* streamChat(
  messages: ChatMessage[],
  signal?: AbortSignal,
): AsyncGenerator<string, "ok" | "fallback", unknown> {
  if (!aiEnabled()) return "fallback";
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal: timeoutSignal(signal),
    });
    if (!res.ok || !res.body) return "fallback";
    for await (const obj of readNdjson(res.body)) {
      if (obj.error) return "fallback";
      if (obj.chunk) yield obj.chunk;
      if (obj.done) return "ok";
    }
    return "ok";
  } catch {
    return "fallback";
  }
}

async function* readNdjson(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<NdjsonChunk, void, unknown> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const raw of lines) {
        const line = raw.trim();
        if (!line) continue;
        try {
          yield JSON.parse(line) as NdjsonChunk;
        } catch {
          // Malformed line — drop it and keep streaming.
        }
      }
    }
    if (buffer.trim()) {
      try {
        yield JSON.parse(buffer.trim()) as NdjsonChunk;
      } catch {
        /* ignore tail */
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function timeoutSignal(signal?: AbortSignal): AbortSignal {
  const ctrl = new AbortController();
  if (signal) signal.addEventListener("abort", () => ctrl.abort());
  setTimeout(() => ctrl.abort(), DEFAULT_TIMEOUT_MS);
  return ctrl.signal;
}
