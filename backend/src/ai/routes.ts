/**
 * Phase 1 AI routes mounted under /v1/ai. Exposes:
 *   • POST /v1/ai/chat              — generic chat completion (NDJSON stream)
 *   • POST /v1/ai/schema-narration  — narrate a list of tables (NDJSON stream)
 *   • POST /v1/ai/widget-spec       — turn a question into a draft widget spec
 *   • GET  /v1/ai/health            — provider configured? which model?
 *
 * All streaming responses use newline-delimited JSON (`{"chunk":"..."}` per
 * line) so the frontend reader is trivial. `data: …\n\n` SSE could also
 * work but NDJSON keeps the in-browser fetch reader simple.
 */
import { Elysia, t } from "elysia";
import {
  type ChatMessage,
  completeChat,
  readAIConfig,
  streamChat,
} from "./client";

const SYSTEM_NARRATION = `You are Arc Insights' onboarding assistant. The tenant just connected a database or uploaded a CSV. You are narrating the schema scan in real time. Keep it short, factual, and friendly — one sentence per line, no markdown headings, prefix supporting observations with "• ". Mention concrete column names from the schema you are given. Finish with "Composing your starter dashboard…".`;

const SYSTEM_WIDGET_SPEC = `You are Arc Insights' widget builder. The tenant typed a natural-language request against a known table. Return a JSON object that matches the QuerySpec shape:
{ "from": { "schema": string, "table": string }, "dimensions": [{ "column": string }], "measures": [{ "column": string, "agg": "sum"|"count"|"count_distinct"|"avg"|"min"|"max" }], "filters": [], "orderBy": [], "limit": number, "explanation": string }
Pick exactly one measure and one dimension that best answer the question. Use only columns that exist on the table. Respond with ONLY the JSON object, no prose, no markdown fences.`;

export const aiRoutes = new Elysia({ prefix: "/v1/ai" })
  .get("/health", () => {
    const cfg = readAIConfig();
    return {
      configured: cfg !== null,
      provider: cfg ? "ollama-cloud" : null,
      baseUrl: cfg?.baseUrl ?? null,
      modelHigh: cfg?.modelHigh ?? null,
      modelBalanced: cfg?.modelBalanced ?? null,
      modelFast: cfg?.modelFast ?? null,
    };
  })

  .post(
    "/chat",
    ({ body, set }) => {
      const cfg = readAIConfig();
      if (!cfg) {
        set.status = 503;
        return new Response(
          JSON.stringify({
            error: "AI provider not configured",
            hint: "Set ARC_LLM_API_KEY in backend/.env.local",
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      }
      const messages = body.messages as ChatMessage[];
      const model = (body.model as string | undefined) ?? cfg.modelBalanced;
      return ndjsonStream(streamChat(cfg, { messages, model }));
    },
    {
      body: t.Object({
        messages: t.Array(
          t.Object({
            role: t.Union([
              t.Literal("system"),
              t.Literal("user"),
              t.Literal("assistant"),
            ]),
            content: t.String(),
          }),
        ),
        model: t.Optional(t.String()),
      }),
    },
  )

  .post(
    "/schema-narration",
    ({ body, set }) => {
      const cfg = readAIConfig();
      if (!cfg) {
        set.status = 503;
        return new Response(
          JSON.stringify({ error: "AI provider not configured" }),
          { headers: { "Content-Type": "application/json" } },
        );
      }
      const tableSummaries = (body.tables ?? []).map((t) => ({
        name: t.name,
        rowCount: t.rowCount,
        columns: t.columns,
      }));
      const userPrompt = `Tables found:\n${JSON.stringify(tableSummaries, null, 2)}\n\nNarrate the scan now.`;
      const stream = streamChat(cfg, {
        messages: [
          { role: "system", content: SYSTEM_NARRATION },
          { role: "user", content: userPrompt },
        ],
        model: cfg.modelBalanced,
      });
      return ndjsonStream(stream);
    },
    {
      body: t.Object({
        tables: t.Array(
          t.Object({
            name: t.String(),
            rowCount: t.Optional(t.Number()),
            columns: t.Array(t.Object({ name: t.String(), type: t.String() })),
          }),
        ),
      }),
    },
  )

  .post(
    "/widget-spec",
    async ({ body, set }) => {
      const cfg = readAIConfig();
      if (!cfg) {
        set.status = 503;
        return { error: "AI provider not configured" };
      }
      const { table, columns, question } = body;
      const userPrompt = `Table: ${table.schema}.${table.name}\nColumns: ${JSON.stringify(columns)}\nQuestion: ${question}`;
      try {
        const text = await completeChat(cfg, {
          messages: [
            { role: "system", content: SYSTEM_WIDGET_SPEC },
            { role: "user", content: userPrompt },
          ],
          model: cfg.modelBalanced,
          temperature: 0.2,
        });
        const parsed = parseFirstJsonObject(text);
        if (!parsed) {
          set.status = 502;
          return {
            error: "AI returned non-JSON",
            raw: text.slice(0, 512),
          };
        }
        return { spec: parsed };
      } catch (err) {
        set.status = 502;
        return { error: (err as Error).message };
      }
    },
    {
      body: t.Object({
        table: t.Object({
          schema: t.String(),
          name: t.String(),
        }),
        columns: t.Array(
          t.Object({
            name: t.String(),
            kind: t.String(),
          }),
        ),
        question: t.String(),
      }),
    },
  );

/**
 * Wrap an async iterable of strings as an NDJSON streaming Response.
 * Each chunk becomes one line: `{"chunk":"<text>"}\n`. The stream
 * closes with `{"done":true}\n`. Errors surface as `{"error":"..."}\n`.
 */
function ndjsonStream(source: AsyncIterable<string>): Response {
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();
      try {
        for await (const chunk of source) {
          controller.enqueue(enc.encode(JSON.stringify({ chunk }) + "\n"));
        }
        controller.enqueue(enc.encode(JSON.stringify({ done: true }) + "\n"));
      } catch (err) {
        controller.enqueue(
          enc.encode(JSON.stringify({ error: (err as Error).message }) + "\n"),
        );
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

function parseFirstJsonObject(text: string): unknown | null {
  // The model may wrap the JSON in markdown fences. Strip them, then
  // grab the first {...} block.
  const stripped = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  const match = stripped.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}
