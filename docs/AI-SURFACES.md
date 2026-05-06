# AI Surfaces

Where AI is used in Arc Insights, what data flows where, and how it works in air-gapped mode.

**Architecture in one line:** All AI features go through ONE swappable endpoint. Cloud customers point at OpenAI / Anthropic / Azure OpenAI / Ollama Cloud. Air-gapped customers point at local Ollama. Same code path, one env var.

**Phase 1 default provider:** Ollama Cloud (`https://ollama.com`). Read from `backend/.env.local` via `ARC_LLM_*` env vars. Per-tenant provider configuration in Settings → AI lands in Phase 2.

## Phase 1 surfaces (locked)

The following AI surfaces ship in Phase 1. Behavior contracts below apply to every one.

| Surface                                 | Mode                                             |
| --------------------------------------- | ------------------------------------------------ |
| Ask AI on Home                          | Conversational, persistent thread, streamed      |
| Ask AI in widget builder                | Conversational, scoped to the current widget     |
| Explain this widget                     | One-shot, streamed, cites tables/columns/metrics |
| Anomaly callouts on widgets             | One-shot, evaluated on render or schedule        |
| Auto-summary on reports                 | One-shot, on by default at top, dismissible      |
| Per-section commentary in reports       | One-shot, on demand                              |
| Auto-name (widget / dashboard / report) | One-shot                                         |
| Suggested dashboard arrangements        | One-shot, runs over tenant's existing widgets    |
| Schema-scan narration on connect        | Streamed, runs once per connect                  |
| Smart-fill template field mapping       | One-shot, tenant confirms before generation      |

### Behavior contracts (binding)

1. **Streaming with visible reasoning** — collapsible "thinking" disclosure on every conversational surface
2. **Act with confirmation on writes** — read queries run freely; saving widgets, editing the Data Model, or modifying RBAC asks once before applying
3. **Never edit Data Model or RBAC autonomously** — must always be a tenant-driven action
4. **Per-user persistent history** — Ask AI threads saved per user with shareable thread links
5. **Never fake an answer** — low-confidence or out-of-scope → say so explicitly and offer an alternative
6. **Always cite the work** — every AI-returned widget shows tables, joins, filters, metrics used
7. **BYO-LLM capability negotiation** — capability detection at provider connect; downgrade UI affordances when the model can't reliably do tool use, structured output, or long context
8. **Per-feature toggles** — tenants can disable individual AI features (e.g. turn off auto-summary if the local model writes weak prose)

## Privacy guarantees (binding)

1. **Raw rows never leave the customer's database by default.** AI features that need data send aggregates, summary stats, or schema metadata only.
2. **Schema metadata is fair game** — table names, column names, types, sample row counts. Not values.
3. **Aggregates are fair game** — sums, averages, percentages, top-10 dimensions, time-series of one metric.
4. **PII tagging happens before LLM calls.** Columns flagged as PII are excluded from prompts.
5. **Customer can opt-in to row-level analysis** for specific features. Off by default. Logged in audit trail.
6. **Customer chooses the LLM provider.** OpenAI default in cloud; switchable to Anthropic, Azure, or BYO endpoint. On-prem and air-gapped run Ollama locally.
7. **Per-tenant audit log** of every LLM call: feature, context shape, response, cost, latency.
8. **Disable AI per workspace or per feature** — the product still ships its full non-AI feature set.

---

## AI usage map

### Onboarding / setup

| Surface                                     | What it does                                                                            | Inputs to LLM                                                                            | Priority |
| ------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------- |
| **AI-suggested starter dashboards**         | Reads the customer's schema and proposes 3–5 sensible starter dashboards.               | Schema metadata only (table + column names + types + sample row counts). NEVER raw data. | P2       |
| **Schema understanding / entity detection** | Detects probable foreign keys, entity relationships, translation tables.                | Schema metadata.                                                                         | P2       |
| **Auto-tag PII columns**                    | Flags columns likely to contain PII (email, phone, SSN, names) so admins can mask them. | Column names + sampled regex patterns (no actual values).                                | P2       |
| **dbt manifest enrichment**                 | Generates plain-English descriptions for dbt models that lack them.                     | Model name, column names, source SQL.                                                    | P3       |

### Query building

| Surface                                 | What it does                                                                                          | Inputs to LLM                                                                                   | Priority              |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------- |
| **NL → SQL (NL Q&A)** ★                 | User types "show me revenue by region last quarter"; product compiles to SQL via the semantic layer.  | User question + relevant subset of semantic layer (metric/dimension definitions). NO data rows. | P2                    |
| **AI SQL pair-programmer**              | Explain / fix / optimize SQL inline.                                                                  | User's SQL + schema metadata.                                                                   | P1                    |
| **Smart chart suggestions ("Show Me")** | Picks the best chart type based on result shape. Mostly rules-based with LLM fallback for edge cases. | Result shape — number of dimensions, cardinality, types.                                        | P0 (rules) / P2 (LLM) |
| **NL → cohort/funnel/retention**        | User describes a question in English; product fills in the cohort/funnel builder.                     | User question + schema metadata.                                                                | P2                    |
| **Index / query plan suggestions**      | Suggests indexes for slow queries on Postgres / MySQL.                                                | Query plan + slow-query log.                                                                    | P3                    |

### Dashboards

| Surface                                  | What it does                                                                                         | Inputs to LLM                                            | Priority |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------- |
| **AI-generated chart from a question** ★ | User types a question; product produces a chart on the canvas.                                       | Question + schema + applicable filters.                  | P2       |
| **AI dashboard summary**                 | 3–5 sentence plain-English readout of what the dashboard shows.                                      | Chart titles, current values, top movers (NOT raw rows). | P2       |
| **"Why did X change?" explainer** ★      | Decomposes a metric movement across dimensions. "Revenue dropped 12% — driven by SKU-A churn in EU." | Aggregated values across dimensions (NOT raw rows).      | P2       |
| **Auto-generated chart alt text**        | Accessibility — screen-reader-friendly chart descriptions.                                           | Chart title + summary stats.                             | P2       |

### Alerts & monitoring

| Surface                       | What it does                                                                                          | Inputs to LLM                                    | Priority |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------ | -------- |
| **Anomaly detection** ★       | Statistical core (z-scores, seasonal decomposition) + LLM annotation for human-readable notes.        | Time-series of one metric + historical baseline. | P2       |
| **Smart alert thresholds**    | Reads metric history; suggests sensible thresholds.                                                   | Time-series of the metric.                       | P2       |
| **Monitoring + acting agent** | Detects → diagnoses → proposes action → executes via integrations (Slack / Linear / PagerDuty / dbt). | Metric movement + dashboard context.             | P3       |

### Search & discovery

| Surface                                         | What it does                                             | Inputs to LLM                                                     | Priority |
| ----------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------- | -------- |
| **Semantic search across dashboards / metrics** | Search "churn" and find dashboards whose meanings match. | Search query + embeddings of dashboards & metrics (pre-computed). | P2       |
| **Auto-generated metric descriptions**          | Plain-English descriptions for metrics in the catalog.   | Metric SQL + sample values.                                       | P2       |

### Data quality

| Surface                          | What it does                                                                     | Inputs to LLM                                 | Priority |
| -------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------- | -------- |
| **Schema-drift auto-mapping** ★  | When a column is renamed, suggest the right new mapping with a confidence score. | Old + new schema metadata, similarity scores. | P2       |
| **Outlier / data-quality flags** | Flag rows or aggregates that look anomalous.                                     | Summary stats only.                           | P3       |

### Cost optimization

| Surface                             | What it does                                                                                   | Inputs to LLM                                         | Priority |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------- |
| **Auto-suggest pre-aggregations** ★ | Watches query patterns; recommends "these 3 patterns are 60% of your cost — materialize them". | Query history (anonymized: shapes only, no literals). | P2       |

### Translation & i18n

| Surface                          | What it does                                                         | Inputs to LLM                      | Priority |
| -------------------------------- | -------------------------------------------------------------------- | ---------------------------------- | -------- |
| **Auto-translate metric labels** | When a customer adds Spanish, offer AI-translated labels for review. | Existing labels + target language. | P3       |

### Help / in-product assistant

| Surface                               | What it does                                                           | Inputs to LLM                          | Priority |
| ------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------- | -------- |
| **Inline help that knows the schema** | Chat-style help grounded in the user's actual data.                    | User question + schema + product docs. | P2       |
| **Onboarding tutor**                  | First-week interactive walk-through customized to the customer's data. | Schema + docs + user progress.         | P3       |

---

## Architecture components

| Component                   | Tech                                                                                     | Purpose                                                                                                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LLM endpoint (BYO)**      | Ollama Cloud (Phase 1 default) / OpenAI / Anthropic / Azure OpenAI / Ollama local / vLLM | Single OpenAI-compatible interface; customer picks the backend. Phase 1 hardcodes via `ARC_LLM_*` env vars; Phase 2 surfaces per-tenant config in Settings → AI. |
| **Orchestration**           | Vercel AI SDK                                                                            | TypeScript-first. Streaming, structured output, tool calls. Don't use LangChain — too heavy for narrow needs.                                                    |
| **Embeddings**              | OpenAI text-embedding-3-small (cloud) / nomic-embed-text via Ollama (air-gapped)         | For semantic search and RAG grounding.                                                                                                                           |
| **Vector store**            | pgvector inside metadata Postgres                                                        | No new service. Stores embeddings of schemas, metric definitions, dashboard contents, docs.                                                                      |
| **Prompt grounding (RAG)**  | Custom retriever                                                                         | Before calling the LLM, fetch only the relevant slice of semantic layer + product docs.                                                                          |
| **Output validation**       | Zod schemas on every LLM response                                                        | LLM outputs must match a schema (SQL must parse, chart configs must validate). Reject and retry on failure.                                                      |
| **Caching**                 | Valkey                                                                                   | Cache LLM responses by (prompt + context-hash). Save cost + latency on repeated questions.                                                                       |
| **Rate limiting / budgets** | Per-tenant LLM token + cost caps                                                         | Stops one tenant from running up the OpenAI bill. Configurable by admin.                                                                                         |
| **Observability**           | OpenTelemetry spans for every LLM call                                                   | Track tokens, latency, cost, success rate per surface.                                                                                                           |

---

## Air-gapped story

| Item                              | Detail                                                                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Bundled local LLM**             | Air-gapped install includes Ollama + Llama 3.1 8B or Qwen 2.5 7B. Larger models (70B) work if customer has GPU bandwidth.             |
| **Same code, different endpoint** | Ollama exposes OpenAI-compatible API. Air-gapped customers point at `localhost:11434`. No special integration.                        |
| **Bundled embedding model**       | nomic-embed-text or bge-base-en runs locally for semantic search and RAG.                                                             |
| **Customer can BYO endpoint**     | Azure OpenAI on customer's tenant, vLLM cluster, anything OpenAI-compatible — same env var.                                           |
| **Feature-flag AI off entirely**  | Compliance teams that forbid LLM use → every AI surface degrades gracefully. Product still ships dashboards, queries, alerts, embeds. |

---

## Cost model

| Scenario                   | Who pays                                                                                     |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| **Cloud — bundled tokens** | Arc Insights bundles "AI tokens" into the SaaS price tier; charges for overages.             |
| **Cloud — BYO key**        | Customer pastes their own OpenAI / Anthropic key. Their cost; nothing on Arc Insights' bill. |
| **On-prem / air-gapped**   | No LLM cost — customer runs Ollama. They pay only for the GPU node.                          |

**Bounded by design:** Per-tenant token caps (soft warning at 80%, hard cap at 100%, admin can raise). Per-feature toggles. Aggressive caching cuts repeated calls 50%+. AI never silently blows up a customer's bill.

---

## ★ Strategic surfaces (highest leverage)

These are the AI features that nobody else does well — strongest differentiation per dollar of LLM spend:

1. **NL → SQL grounded in semantic layer** — refuses to answer ambiguous questions instead of hallucinating
2. **AI-generated charts from a question** — turns "what's our top-line revenue by region this month?" into a working chart
3. **"Why did X change?" explainer** — automatic dimension contribution analysis, cited
4. **Anomaly detection with explanations** — statistical detection + plain-English notes
5. **Schema-drift auto-mapping** — solves a top complaint about every other BI tool
6. **Auto-suggest pre-aggregations** — converts cost transparency into cost reduction
