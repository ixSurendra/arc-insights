# Arc Insights — guidance for Codex

Open-source BI and embedded analytics platform. Connect a database, build dashboards, embed them anywhere — including on-prem and air-gapped.

## Stack

- **Backend:** Elysia + Bun (TypeScript). Bun pinned in `.tool-versions`.
- **Frontend:** React + Vite + TypeScript. State: Zustand. Server state: SWR. Forms: React Hook Form + Zod. Charts: Apache ECharts. Tables: AG Grid Community.
- **Database:** PostgreSQL with Drizzle ORM. SQLite as fallback for tiny single-binary deploys.
- **Federated query:** DuckDB embedded inside the Bun process.
- **Cache:** Valkey (cloud) / Bun built-in SQLite (single-binary).
- **SDK:** `@arc-insights/sdk` published from `/sdk`. Generated via Eden Treaty from Elysia routes — server changes break SDK consumers at compile time.
- **Auth:** Lucia + node-saml. OIDC + SAML 2.0.
- **LLM:** BYO endpoint pattern (OpenAI / Anthropic / Azure OpenAI / Ollama). Use Vercel AI SDK for orchestration.
- **Deploy:** Distroless Docker + Helm.

## Repository layout

- `backend/` — Elysia API + query engine
- `frontend/` — React SPA
- `sdk/` — published Eden Treaty client
- `helm/` — Kubernetes packaging
- `docs/` — documentation, ADRs, planning
- `.github/workflows/` — CI

## Dev commands

- `make dev` — boots Postgres + Valkey + backend + frontend
- `make build` — production build of all workspaces
- `make test` — run all tests
- `make lint` / `make typecheck` / `make format`
- `make docker-build` — distroless multi-arch image
- `make ci` — full CI pipeline locally

## Coding standards (binding)

- TypeScript **strict mode** everywhere. No `any` without justification.
- Every commit follows **Conventional Commits**. Include the task ID in brackets:
  `feat(connectors): add snowflake driver [P1-04]`
- Every PR description includes `Closes [task-id]`.
- **Never commit raw SQL bypassing the tenant-aware query helper.** See `docs/adr/0003-multi-tenancy-model.md`.
- **Never store unencrypted secrets.** Use envelope encryption with the customer's KMS.
- Every API mutation accepts an optional **idempotency key**. 24-hour deduplication.
- All timestamps stored as UTC with timezone. User TZ applied at the rendering edge.
- Money stored as **integer minor units** (cents/paise) + ISO currency code. No floats.
- Hard **30-second query timeout** on every external database call.
- Append-only audit log; deletes blocked by RLS.

## Multi-tenancy model — non-negotiable rules

Read `docs/adr/0003-multi-tenancy-model.md` before touching any data layer. Summary:

1. Every domain table has `tenant_id UUID NOT NULL`.
2. Postgres row-level security (RLS) policies enforce tenant filters at the DB.
3. Application code injects `SET LOCAL app.tenant_id = $1` before any query.
4. Every cache key starts with `tenant:{tenant_id}:`.
5. Every audit log entry includes `tenant_id`.
6. CI runs adversarial cross-tenant tests on every PR.

## Performance budgets (enforced in CI)

| Metric                  | p50    | p99    |
| ----------------------- | ------ | ------ |
| Cached query response   | 150 ms | 500 ms |
| Uncached query response | 1.5 s  | 8 s    |
| Dashboard first paint   | 800 ms | 2.0 s  |
| Embed iframe load       | 400 ms | 1.5 s  |

## Where to find more context

- `docs/ROADMAP.md` — phase-by-phase build plan with task IDs (P0-01 through P6-07)
- `docs/FEATURES.md` — master feature list (143 features across 17 categories)
- `docs/ARCHITECTURE.md` — system design, request flow, scaling stages
- `docs/adr/` — Architecture Decision Records (binding decisions)
- `CONTRIBUTING.md` — developer workflow and PR conventions

## Conventions Codex should follow

- When adding a feature, find the task in `docs/ROADMAP.md` and quote its ID in commits.
- When changing data structures, propose a Drizzle migration; never edit a committed migration in place.
- When adding an API route, define the Zod schema first; Elysia validates against it; Eden Treaty propagates types to the SDK.
- When unsure about a binding rule, read the relevant ADR before suggesting a change.
- Keep commits small and atomic — one task per PR ideally.
