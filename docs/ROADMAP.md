# Roadmap

12-month plan from empty repo to enterprise-ready embedded analytics platform. This is the **static plan** — what we're building, in what order, with what exit criteria. It rarely changes.

For **live status** of every task, see **[PROGRESS.md](./PROGRESS.md)**. That's the single source of truth for what's done, in progress, or blocked.

Each task has an ID like `P1-04`. Reference it in commits: `feat(connectors): add snowflake driver [P1-04]`.

---

## Phase 0 — Foundation (Weeks 1–2)

**Goal:** Empty repo → working dev loop. CI green. Air-gapped install passes dry-run.

- P0-01 — Initialize git repo + GitHub org
- P0-02 — Pick + commit LICENSE (AGPLv3)
- P0-03 — Bun monorepo with /backend, /frontend, /sdk, /helm, /docs
- P0-04 — Pin Bun version in `.tool-versions` and Dockerfile
- P0-05 — TypeScript strict + ESLint + Prettier + Husky pre-commit
- P0-06 — Bootstrap Elysia backend with `/health` route
- P0-07 — Bootstrap React + Vite frontend
- P0-08 — Wire Elysia + React via Eden Treaty end-to-end
- P0-09 — Drizzle + Postgres; first migration creating `users` table with `tenant_id`
- P0-10 — Local docker-compose: Postgres + Valkey
- P0-11 — `make dev` script — one command boots everything
- P0-12 — GitHub Actions CI: lint, typecheck, test, Docker build
- P0-13 — Distroless Bun Dockerfile (multi-arch amd64 + arm64)
- P0-14 — First Helm chart skeleton in `/helm`
- P0-15 — Air-gapped install dry-run script in CI
- P0-16 — OpenTelemetry instrumentation skeleton (one span per request)
- P0-17 — ADR template + first 3 ADRs (stack, license, multi-tenancy)
- P0-18 — Public docs site stub (Mintlify or Nextra)
- P0-19 — README, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT
- P0-20 — First Playwright E2E test
- P0-21 — Bun + DuckDB load-test spike (validate under 100 concurrent queries)
- P0-22 — Phase 0 EXIT review

**Exit criteria:**

- [ ] `make dev` boots on a fresh machine in <5 minutes
- [ ] CI green on every PR
- [ ] Distroless image builds for amd64 + arm64
- [ ] Helm chart deploys to a local Kind cluster
- [ ] Air-gapped install dry-run passes
- [ ] Bun + DuckDB load-test result documented
- [ ] First 3 ADRs committed
- [ ] First 3 design partners signed

---

## Phase 1 — Core MVP (Months 1–3)

**Goal:** Single-tenant product good enough for in-house demo.

- P1-01 — Postgres connector (drivers, connection pool, schema scan)
- P1-02 — MySQL/MariaDB connector
- P1-03 — BigQuery connector (service-account auth)
- P1-04 — Snowflake connector (key-pair auth)
- P1-05 — Visual no-code query builder (UI + JSON spec)
- P1-06 — Raw SQL editor with autocomplete
- P1-07 — Query → SQL compiler + DuckDB result shaping
- P1-08 — Chart types: line / bar / pie / table / big number / scatter
- P1-09 — Dashboard grid (drag/drop) + global filters
- P1-10 — Save / share / fork queries + dashboards
- P1-11 — Email/password auth + basic RBAC
- P1-12 — graphile-worker for scheduled subscriptions (email / Slack digest)
- P1-13 — PDF / PNG / CSV export
- P1-14 — Public tokenized share links + public (no-login) dashboards
- P1-15 — Phase 1 EXIT review with first design partner

**Exit:** Internal user connects to Postgres, builds a dashboard with 4 charts, p95 query <2s. Scheduled subscription delivers a PDF digest by email. Tokenized share link works for an external viewer.

---

## Phase 2 — Production-ready single tenant (Months 3–5)

**Goal:** First real customers can pilot. SOC 2 path opens.

- P2-01 — OIDC + SAML SSO (Lucia + node-saml)
- P2-02 — Query result caching in Valkey with locale-aware keys
- P2-03 — Audit logging (Pino → S3)
- P2-04 — systemd watchdog + real-work health endpoint
- P2-05 — Backup / restore tooling
- P2-06 — Postgres RLS for per-user isolation
- P2-07 — OpenTelemetry across all tiers
- P2-08 — Phase 2 EXIT — 5 design partners using daily, p99 <5s, security audit clean

---

## Phase 3 — Multi-tenant + Embed (Months 5–7)

**Goal:** B2B SaaS launch. Customers embed dashboards in their websites.

- P3-01 — `tenant_id` + RLS at tenant level
- P3-02 — Per-tenant cache namespacing + rate limits
- P3-03 — Signed JWT iframe embedding
- P3-04 — Eden Treaty SDK published to npm (React/Vue/vanilla)
- P3-05 — White-label theming (CSS custom properties)
- P3-06 — postMessage event hooks
- P3-07 — Per-tenant subdomains via wildcard DNS + cert
- P3-08 — Embedded usage analytics
- P3-09 — Embed admin console (allowed-domains, per-customer feature flags, theme controls, usage rollup)
- P3-10 — Phase 3 EXIT — first paying B2B customer embeds in <1h from signup

---

## Phase 4 — On-prem + Air-gapped (Months 7–9)

**Goal:** Enterprise pilots become enterprise contracts.

- P4-01 — Production Helm chart (HA: multi-replica, Postgres, Valkey)
- P4-02 — Single-binary build via `bun build --compile`
- P4-03 — BYO Postgres documented + tested
- P4-04 — Air-gapped install bundle (signed, USB-deliverable)
- P4-05 — License-key activation with offline validation
- P4-06 — BYOK / KMS integration (AWS / Azure / GCP / Vault)
- P4-07 — On-prem admin/health dashboard
- P4-08 — Air-gapped install test in CI on every release
- P4-09 — Phase 4 EXIT — first enterprise on-prem in production

---

## Phase 5 — Differentiators (Months 9–12)

**Goal:** Out-ship the field on things they're weak at.

- P5-01 — Per-query cost surfacing (Snowflake / BigQuery query history)
- P5-02 — Cohort builder (UI + SQL compiler)
- P5-03 — Funnel builder
- P5-04 — Retention / heatmap builder
- P5-05 — Slack interactive cards (Block Kit)
- P5-06 — AI NL Q&A grounded in semantic layer (BYO LLM)
- P5-07 — Schema-drift detection + auto-mapping suggestions
- P5-08 — Synthetic / demo mode
- P5-09 — Phase 5 EXIT — ≥3 features no other BI tool ships, public case study

---

## Phase 6 — Scale + Ecosystem (Year 2)

**Goal:** Move from product → platform.

- P6-01 — Custom viz plugin SDK
- P6-02 — Reverse-ETL integration (Hightouch / Census)
- P6-03 — iOS / Android viewer apps
- P6-04 — Real-time co-editing (Yjs)
- P6-05 — i18n (top 5 non-English languages)
- P6-06 — Federated multi-DB queries via DuckDB / Trino
- P6-07 — Marketplace for connectors and dashboards

---

## Cadence

- **Daily, 5 min** — review In Progress tasks; flag blockers
- **Weekly, 30 min** — update Done; have design-partner calls
- **Per phase, 1 hr** — walk Exit Criteria; demo to design partners; write retrospective
- **Monthly, 2 hrs** — review whole roadmap; adjust scope (cut features, never quality)
- **Per release** — air-gapped install test in CI; k6 load test; tag; publish

---

## How this file relates to PROGRESS.md

| File                     | Purpose                                         | How often it changes             |
| ------------------------ | ----------------------------------------------- | -------------------------------- |
| `ROADMAP.md` (this file) | Static plan: what we're building, in what order | Rarely — only when scope changes |
| `PROGRESS.md`            | Live status: what's done, in progress, blocked  | Every commit                     |

If you find them out of sync, **PROGRESS.md is canonical.** Update ROADMAP.md only if the plan itself changes.
