# Architecture

## What Arc Insights is

A self-hostable, embeddable, multi-tenant BI platform. Customers connect their database (Postgres, MySQL, BigQuery, Snowflake), build dashboards visually or with SQL, and embed those dashboards inside their own products. Runs as cloud SaaS, single-server on-prem, or fully air-gapped.

## High-level shape

```
                    ┌─────────────────────────┐
                    │  Edge / Load balancer   │  TLS · JWT validation · rate limiting
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
       ┌────────────┐    ┌────────────┐     ┌─────────────┐
       │  API tier  │    │ Query      │     │  Job worker │
       │  (Elysia)  │    │ workers    │     │  tier       │
       │  stateless │    │  + DuckDB  │     │  graphile-  │
       │            │    │            │     │  worker     │
       └─────┬──────┘    └─────┬──────┘     └──────┬──────┘
             │                 │                   │
             └────────┬────────┴───────────────────┘
                      ▼
              ┌──────────────┐    ┌──────────────┐    ┌────────────────┐
              │  PostgreSQL  │    │   Valkey     │    │ Object storage │
              │  metadata    │    │   cache      │    │  (S3 / MinIO)  │
              └──────────────┘    └──────────────┘    └────────────────┘
                      │
                      ▼
       ┌─────────────────────────────────────────┐
       │   Customer's databases (read-only)      │
       │   Postgres / MySQL / BigQuery /         │
       │   Snowflake / Redshift / Databricks     │
       └─────────────────────────────────────────┘
```

## Tiers

### API / Web tier
Stateless. Bun process running Elysia. Handles HTTP requests, auth (Lucia + node-saml), authorization (Casbin + Postgres RLS), semantic-layer compilation, and orchestration. Serves the React SPA. Deploy as identical replicas behind the load balancer.

### Query worker tier
Owns DuckDB. Talks to customer databases via native drivers (postgres.js, mysql2, snowflake-sdk, BigQuery client). Runs heavy queries off the API hot path. Heaviest workload — first to scale separately.

### Job worker tier
graphile-worker (Postgres-backed). Scheduled subscriptions, alerts, exports, dbt-manifest imports. No new infrastructure.

### Real-time / collab tier (P2)
Bun + y-websocket. CRDT-based co-editing for dashboards. WebSockets with sticky sessions on connection.

### Metadata layer
PostgreSQL with Drizzle ORM. All workspace data (users, dashboards, queries, semantic models, audit logs). Highly available primary with read replicas at scale.

### Cache
Valkey for cloud deploys. Bun's built-in SQLite for single-binary on-prem deploys. Same caching abstraction in code; differs only in adapter.

### Vector store
pgvector inside the metadata Postgres. Stores embeddings of schemas, metric definitions, dashboard contents, docs.

### Object storage
S3 / GCS for cloud. MinIO for on-prem. Used for dashboard exports (PDF, PNG, CSV), screenshot snapshots, license bundles.

## Request flow — what happens on chart click

1. Browser → CDN/Edge LB → API tier (TLS terminated, JWT validated for embeds).
2. API tier authenticates the user.
3. RBAC check — does this user/tenant have access to this dashboard?
4. Tenant context attached to the request. All DB queries from now on include `tenant_id`.
5. Semantic layer compiles the metric request to SQL with row-level filters injected.
6. Cache check in Valkey under `tenant:{id}:query:{hash}`. Hit → return.
7. Miss → Query worker tier. Connection pool acquires a connection for the customer's DB.
8. Query runs with hard 30-second timeout.
9. Result rows go through DuckDB for shaping (group, fill, format) — zero-copy via Apache Arrow.
10. Result cached in Valkey with TTL based on freshness policy.
11. Result returned to API tier → JSON → React client.
12. React passes data to ECharts / AG Grid. User sees the chart.
13. Async fan-out: audit log entry, usage metrics, OpenTelemetry span.

## Embedding architecture

The customer's app generates a signed JWT (containing tenant ID, user, locale, filters, expiry) and either:

- Loads our `<iframe src="https://embed.arcinsights.io/d/123?token=...">`, or
- Imports `@arc-insights/sdk` and renders `<Dashboard token={...} />` in their React/Vue app.

postMessage events (filter-changed, chart-clicked, drill-through) bubble back to the parent app. CSS custom properties handle white-label theming without forking. Multi-tenant isolation is enforced via Postgres RLS (defense in depth on top of token-encoded filters).

## AI architecture

Every AI surface (NL→SQL, why-did-X-change, dashboard summaries, anomaly notes, schema-drift mapping) goes through ONE swappable endpoint. Cloud customers point at OpenAI / Anthropic / Azure OpenAI; air-gapped customers point at Ollama. Same code path; one env var to switch.

- Vercel AI SDK orchestrates streaming and structured outputs.
- pgvector grounds prompts in relevant schema and metric definitions (RAG).
- Zod schemas validate every LLM response — failed responses get retried.
- Per-tenant token caps and a workspace-level "disable AI" toggle keep costs bounded.
- Raw rows never leave the customer's database by default. Schema metadata, aggregates, and summary stats only.

## Scaling stages

| Stage | Customers | Topology |
|---|---|---|
| Monolith | 1–100 | One Bun process + one Postgres + one Valkey, vertical scale |
| Horizontal stateless | 100–1,000 | ≥2 API replicas, managed Postgres + read replicas |
| Service split | 1,000–10,000 | API / Query / Job / WebSocket as separate deployments |
| Multi-region | 10,000+ | EU/US/APAC regions, edge JWT validation, in-region DB connections |
| Platform | Enterprise + ecosystem | Plugin marketplace, on-prem fleet management |

## Cloud / on-prem parity

The same code runs in cloud and on-prem. Differences are environment variables only:

- **Metadata DB:** `DATABASE_URL` → managed Postgres (cloud) or customer's Postgres (on-prem) or local SQLite (single-binary).
- **Cache:** `CACHE_URL` → Valkey cluster (cloud) or Bun SQLite (single-binary).
- **LLM:** `LLM_ENDPOINT` → OpenAI/Anthropic (cloud) or Ollama localhost:11434 (air-gapped).
- **Telemetry:** `OTEL_EXPORTER_OTLP_ENDPOINT` → managed observability stack (cloud) or customer's Grafana stack (on-prem) or disabled (air-gapped).

No code forks. No "enterprise edition" with extra modules. One product, configured per environment.

## Observability

OpenTelemetry traces span every layer. Prometheus metrics labeled with anonymized tenant IDs. Logs structured via Pino, written to stdout, shippable to any sink (SIEM, S3, OpenSearch). Audit log is append-only and tenant-scoped.

## See also

- `docs/adr/0001-stack-choice.md` — why this stack
- `docs/adr/0002-license.md` — why AGPLv3
- `docs/adr/0003-multi-tenancy-model.md` — the binding multi-tenancy rules
- `docs/ROADMAP.md` — what's being built when
- `docs/FEATURES.md` — full feature inventory
