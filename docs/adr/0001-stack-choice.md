# 0001 — Tech stack: Elysia + Bun + React

- **Status:** Accepted
- **Date:** 2026-05-04
- **Deciders:** Founder

## Context

Arc Insights ships to enterprises and air-gapped environments while also running as a hosted SaaS. The stack must support both modes from one codebase, with developer velocity high enough for a small team to compete with established BI tools (Metabase, Superset, Looker).

## Decision

- **Backend:** Elysia on Bun (TypeScript)
- **Frontend:** React + Vite + TypeScript
- **Metadata DB:** PostgreSQL with Drizzle ORM
- **Federated query:** DuckDB embedded
- **Cache:** Valkey (cloud) / Bun SQLite (single-binary)
- **Charts:** Apache ECharts + AG Grid Community
- **Embed SDK:** Eden Treaty published as `@arc-insights/sdk`
- **Auth:** Lucia + node-saml (OIDC + SAML)
- **LLM:** BYO endpoint pattern (OpenAI / Anthropic / Ollama)
- **Deploy:** Distroless Docker + Helm

## Why Elysia / Bun over Go

Go was the safer call for on-prem deployment because of static-binary simplicity. Elysia + Bun was chosen instead because:

- **One language end-to-end.** Backend, frontend, and SDK are all TypeScript. Eden Treaty auto-generates a typed client from server routes — server changes break SDK consumers at compile time.
- **Hiring pool.** TypeScript developers are easier to find than Go developers in the founder's network.
- **Battle-tested for distribution.** Anthropic ships Claude Code on Bun to thousands of developer machines, validating Bun's "ship to other people's computers" story.

## Trade-offs

- Bigger container (~90 MB vs ~30 MB for Go). Acceptable.
- Bun runtime is younger than Go's. Mitigated with version pinning, watchdog supervision, real-work health checks, monthly load tests, and a designed-in Go escape hatch for the query execution hot path.

## Alternatives considered

- **Go (chi + sqlc + DuckDB-Go):** Best-in-class for self-hosted distribution. Not chosen because of the JS/TS ecosystem advantage for a TypeScript-fluent founder and the need for end-to-end types to the SDK.
- **Python (FastAPI + Superset-style):** Heavy ops surface. Multi-component deployments. Rejected.
- **Java/Kotlin (Spring):** JVM heaviness conflicts with single-binary on-prem story. Rejected.
- **Elixir (Phoenix):** Excellent for real-time / chat workloads. Wrong fit for a BI tool dominated by database I/O. Rejected.

## Consequences

- Frontend, backend, and SDK share types — refactors are safe across the stack.
- A single TypeScript developer can work end-to-end across the codebase.
- We commit to the Bun release cadence; we'll review breaking changes deliberately.
- Query execution is architected as a clean service boundary so we can swap in a Go service later if needed without rewriting the rest of the product.
