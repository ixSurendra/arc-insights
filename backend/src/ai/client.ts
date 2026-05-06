/**
 * Ollama Cloud client — Phase 1 default LLM provider.
 *
 * Uses Ollama Cloud's OpenAI-compatible chat-completions endpoint at
 * `${ARC_LLM_BASE_URL}/v1/chat/completions`. Streams via SSE; each
 * chunk's `choices[0].delta.content` is yielded back to callers as a
 * plain string. Phase 2 swaps this for a per-tenant provider lookup
 * driven by the Settings → AI surface.
 *
 * Behavior contracts honored from UX-SPEC §10:
 *   • streaming-first
 *   • never fake an answer (errors propagate; callers fall back)
 *   • we always know which model+context produced an answer
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  /** Defaults to `ARC_LLM_MODEL_BALANCED`. */
  model?: string;
  temperature?: number;
  /** Stop tokens. Optional. */
  stop?: string[];
}

export interface AIConfig {
  baseUrl: string;
  apiKey: string;
  modelHigh: string;
  modelBalanced: string;
  modelFast: string;
}

export function readAIConfig(): AIConfig | null {
  const baseUrl = process.env.ARC_LLM_BASE_URL;
  const apiKey = process.env.ARC_LLM_API_KEY;
  const modelHigh = process.env.ARC_LLM_MODEL_HIGH_QUALITY;
  const modelBalanced = process.env.ARC_LLM_MODEL_BALANCED;
  const modelFast = process.env.ARC_LLM_MODEL_FAST;
  if (!baseUrl || !apiKey || apiKey === "replace-me") return null;
  return {
    baseUrl,
    apiKey,
    modelHigh: modelHigh ?? "gpt-oss:120b",
    modelBalanced: modelBalanced ?? "gpt-oss:20b",
    modelFast: modelFast ?? "gpt-oss:20b",
  };
}

/**
 * Streams a chat completion from Ollama Cloud. Yields incremental
 * content chunks as they arrive. Throws on HTTP error or connection
 * failure — callers are expected to catch and fall back.
 */
export async function* streamChat(
  cfg: AIConfig,
  req: ChatRequest,
  signal?: AbortSignal,
): AsyncGenerator<string, void, unknown> {
  const model = req.model ?? cfg.modelBalanced;
  const url = `${cfg.baseUrl.replace(/\/$/, "")}/v1/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: req.messages,
      temperature: req.temperature ?? 0.4,
      stop: req.stop,
      stream: true,
    }),
    signal,
  });
  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(
      `Ollama Cloud responded ${res.status}: ${detail.slice(0, 256)}`,
    );
  }
  const reader = res.body.getReader();
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
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") return;
        try {
          const json = JSON.parse(payload) as {
            choices?: Array<{ delta?: { content?: string } }>;
          };
          const chunk = json.choices?.[0]?.delta?.content;
          if (chunk) yield chunk;
        } catch {
          // Skip malformed chunks — don't drop the stream over one bad line.
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/** Convenience: collect a streamed response into a single string. */
export async function completeChat(
  cfg: AIConfig,
  req: ChatRequest,
  signal?: AbortSignal,
): Promise<string> {
  let out = "";
  for await (const chunk of streamChat(cfg, req, signal)) out += chunk;
  return out;
}
