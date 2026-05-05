# Progress Tracker

Live status of every task in the build plan. Update as you work.

**Status legend:** ☐ Backlog · ◐ In Progress · ◍ In Review · ✓ Done · ✗ Blocked

**Commit convention:** Conventional Commits + task ID.
`feat(connectors): add snowflake driver [P1-04]`

---

## Phase Overview

| Phase                            | Window      | Done | Total | Status      |
| -------------------------------- | ----------- | ---- | ----- | ----------- |
| **Phase 0** Foundation           | Weeks 1–2   | 22   | 22    | ✓ Done      |
| **Phase 1** Core MVP             | Months 1–3  | 3    | 14    | In Progress |
| **Phase 2** Production-ready     | Months 3–5  | 0    | 8     | Not started |
| **Phase 3** Multi-tenant + Embed | Months 5–7  | 0    | 10    | Not started |
| **Phase 4** On-prem + Air-gapped | Months 7–9  | 0    | 9     | Not started |
| **Phase 5** Differentiators      | Months 9–12 | 0    | 10    | Not started |
| **Phase 6** Scale + Ecosystem    | Year 2      | 0    | 7     | Not started |

> Update the Done counts after each commit. The total is **80 tasks** across 7 phases.

---

## Phase 0 — Foundation (Weeks 1–2)

**Goal:** Empty repo → working dev loop. CI green. Air-gapped install passes.

| Task ID | Task                                                           | Owner | Sprint | Status | Linked PR / commit | Notes                                      |
| ------- | -------------------------------------------------------------- | ----- | ------ | ------ | ------------------ | ------------------------------------------ |
| P0-01   | Initialize git repo + GitHub org                               | Solo  | Wk 1   | ✓      | 6e5ba77            | github.com/ixSurendra/arc-insights         |
| P0-02   | Pick + commit LICENSE (AGPLv3)                                 | Solo  | Wk 1   | ✓      | (this commit)      | Full text from gnu.org/licenses/agpl-3.0   |
| P0-03   | Bun monorepo with /backend, /frontend, /sdk, /helm, /docs      | BE    | Wk 1   | ✓      | 6e5ba77            |                                            |
| P0-04   | Pin Bun version in `.tool-versions` and Dockerfile             | BE    | Wk 1   | ✓      | df1f94a            | Bun 1.1.34 in both                         |
| P0-05   | TypeScript strict + ESLint + Prettier + Husky                  | FE    | Wk 1   | ✓      | ef8d0bf            | flat config + lint-staged + prettier       |
| P0-06   | Bootstrap Elysia backend with `/health` route                  | BE    | Wk 1   | ✓      | 6e5ba77            |                                            |
| P0-07   | Bootstrap React + Vite frontend                                | FE    | Wk 1   | ✓      | 6e5ba77            |                                            |
| P0-08   | Wire Elysia + React via Eden Treaty                            | BE+FE | Wk 1   | ✓      | df1f94a            | SDK uses window.location.origin            |
| P0-09   | Drizzle + Postgres; first migration with `users` + `tenant_id` | BE    | Wk 1   | ✓      | ef8d0bf            | RLS + app_user role + 5 adversarial tests  |
| P0-10   | Local docker-compose: Postgres + Valkey                        | BE    | Wk 1   | ✓      | 6e5ba77            |                                            |
| P0-11   | `make dev` script                                              | BE    | Wk 1   | ✓      | 6e5ba77            | end-to-end verified                        |
| P0-12   | GitHub Actions CI (lint, typecheck, test, Docker build)        | BE    | Wk 2   | ✓      | c2a1952            | first green run on c2a1952                 |
| P0-13   | Distroless Bun Dockerfile (multi-arch)                         | BE    | Wk 2   | ✓      | c2a1952            | amd64 + arm64 both pass                    |
| P0-14   | First Helm chart skeleton in `/helm`                           | BE    | Wk 2   | ✓      | (this commit)      | Deployment + Service; HA buildout in P4-01 |
| P0-15   | Air-gapped install dry-run script in CI                        | BE    | Wk 2   | ✓      | c2a1952            | --network=none + log-grep probe            |
| P0-16   | OpenTelemetry instrumentation skeleton                         | BE    | Wk 2   | ✓      | (this commit)      | api only; SDK + exporter wired in P2-09    |
| P0-17   | ADR template + first 3 ADRs (stack, license, multi-tenancy)    | Solo  | Wk 2   | ✓      | 6e5ba77            |                                            |
| P0-18   | Public docs site stub (Mintlify or Nextra)                     | FE    | Wk 2   | ✓      | (this commit)      | Mintlify; docs-site/ → docs.arcinsights.io |
| P0-19   | README, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT                | Solo  | Wk 2   | ✓      | 6e5ba77            |                                            |
| P0-20   | First Playwright E2E test                                      | FE    | Wk 2   | ✓      | (this commit)      | health.spec.ts; CI runs on every PR        |
| P0-21   | Bun + DuckDB load-test spike (100 concurrent queries)          | BE    | Wk 2   | ✓      | c2a1952            | p99 838 ms vs 8 s budget — Bun stays       |
| P0-22   | Phase 0 EXIT review                                            | Solo  | Wk 2   | ✓      | (this commit)      | docs/retro/2026-05-phase-0.md              |

### Phase 0 Exit Criteria

- [x] All 22 Phase-0 tasks marked ✓
- [x] `make dev` boots on a fresh machine in <5 minutes
- [x] CI green on every PR (first green run: c2a1952)
- [x] Distroless image builds for amd64 + arm64
- [ ] Helm chart deploys to a local Kind cluster (deferred to P4-01)
- [x] Air-gapped install dry-run passes — disconnected container starts without errors
- [x] Bun + DuckDB load-test result documented (continue Bun — p99 838 ms vs 8 s budget)
- [x] First 3 ADRs committed in `/docs/adr/`
- [ ] First 3 design partners signed and onboarded to a shared Slack/Discord (non-technical track; **blocks P1-14**)
- [x] Pricing sketch published to `/docs/pricing.md` for internal alignment

---

## Phase 1 — Core MVP (Months 1–3)

**Goal:** Single-tenant product good enough for in-house demo.

| Task ID | Task                                                               | Owner | Sprint | Status |
| ------- | ------------------------------------------------------------------ | ----- | ------ | ------ |
| P1-01   | Postgres connector (drivers, pool, schema scan)                    | BE    | M1     | ✓      |
| P1-02   | MySQL/MariaDB connector                                            | BE    | M1     | ✓      |
| P1-03   | BigQuery connector                                                 | BE    | M2     | ☐      |
| P1-04   | Snowflake connector                                                | BE    | M2     | ☐      |
| P1-05   | Visual no-code query builder (UI + JSON spec)                      | FE    | M1-M2  | ☐      |
| P1-06   | Raw SQL editor with autocomplete                                   | FE    | M2     | ☐      |
| P1-07   | Query → SQL compiler + DuckDB result shaping                       | BE    | M1-M2  | ✓      |
| P1-08   | Chart types: line/bar/pie/table/big number/scatter                 | FE    | M2     | ☐      |
| P1-09   | Dashboard grid + global filters                                    | FE    | M2-M3  | ☐      |
| P1-10   | Save / share / fork queries + dashboards                           | FE+BE | M3     | ☐      |
| P1-11   | Email/password auth + basic RBAC                                   | BE    | M3     | ☐      |
| P1-12   | graphile-worker for scheduled subscriptions (email / Slack digest) | BE    | M3     | ☐      |
| P1-13   | PDF / PNG / CSV export                                             | BE+FE | M3     | ☐      |
| P1-14   | Phase 1 EXIT review with first design partner                      | Solo  | M3     | ☐      |

### Phase 1 Exit Criteria

- [ ] Internal user connects to a Postgres, builds a 4-chart dashboard
- [ ] Dashboard loads in under 2 seconds
- [ ] At least 3 design partners have logged in
- [ ] Scheduled subscription delivers a PDF digest by email
- [ ] All P1 tasks marked ✓

---

## Phase 2 — Production-ready single tenant (Months 3–5)

| Task ID | Task                                                  | Owner | Sprint | Status |
| ------- | ----------------------------------------------------- | ----- | ------ | ------ |
| P2-01   | OIDC + SAML SSO (Lucia + node-saml)                   | BE    | M3-M4  | ☐      |
| P2-02   | Query result caching in Valkey with locale-aware keys | BE    | M4     | ☐      |
| P2-03   | Audit logging (Pino → S3)                             | BE    | M5     | ☐      |
| P2-04   | systemd watchdog + real-work health endpoint          | BE    | M5     | ☐      |
| P2-05   | Backup / restore tooling                              | BE    | M5     | ☐      |
| P2-06   | Postgres RLS for per-user isolation                   | BE    | M5     | ☐      |
| P2-07   | OpenTelemetry across all tiers                        | BE    | M5     | ☐      |
| P2-08   | Phase 2 EXIT review                                   | Solo  | M5     | ☐      |

### Phase 2 Exit Criteria

- [ ] 5 design partners using daily
- [ ] p99 query latency < 5 seconds
- [ ] Security audit clean (no cross-user data leaks)
- [ ] First paying customer signed

---

## Phase 3 — Multi-tenant + Embed (Months 5–7)

| Task ID | Task                                                                                            | Owner | Sprint | Status |
| ------- | ----------------------------------------------------------------------------------------------- | ----- | ------ | ------ |
| P3-01   | `tenant_id` + RLS at tenant level                                                               | BE    | M5-M6  | ☐      |
| P3-02   | Per-tenant cache namespacing + rate limits                                                      | BE    | M6     | ☐      |
| P3-03   | Signed JWT iframe embedding                                                                     | BE+FE | M6     | ☐      |
| P3-04   | Eden Treaty SDK published to npm (React/Vue/vanilla)                                            | FE    | M6-M7  | ☐      |
| P3-05   | White-label theming (CSS custom properties)                                                     | FE    | M7     | ☐      |
| P3-06   | postMessage event hooks (filter/click/drill)                                                    | FE    | M7     | ☐      |
| P3-07   | Per-tenant subdomains via wildcard DNS + cert                                                   | BE    | M7     | ☐      |
| P3-08   | Embedded usage analytics                                                                        | BE+FE | M7     | ☐      |
| P3-09   | Embed admin console (allowed-domains, per-customer feature flags, theme controls, usage rollup) | BE+FE | M7     | ☐      |
| P3-10   | Phase 3 EXIT — first paying B2B customer embeds in <1h                                          | Solo  | M7     | ☐      |

### Phase 3 Exit Criteria

- [ ] Public launch
- [ ] First paying B2B customer embeds in <1 hour from signup
- [ ] No cross-tenant data leak in adversarial CI tests
- [ ] SDK published to npm and documented

---

## Phase 4 — On-prem + Air-gapped (Months 7–9)

| Task ID | Task                                                  | Owner | Sprint | Status |
| ------- | ----------------------------------------------------- | ----- | ------ | ------ |
| P4-01   | Production Helm chart (HA)                            | BE    | M7-M8  | ☐      |
| P4-02   | Single-binary build via `bun build --compile`         | BE    | M8     | ☐      |
| P4-03   | BYO Postgres documented + tested                      | BE    | M8     | ☐      |
| P4-04   | Air-gapped install bundle (signed, USB-deliverable)   | BE    | M8     | ☐      |
| P4-05   | License-key activation with offline validation        | BE    | M8     | ☐      |
| P4-06   | BYOK / KMS integration (AWS / Azure / GCP / Vault)    | BE    | M9     | ☐      |
| P4-07   | On-prem admin/health dashboard                        | BE+FE | M9     | ☐      |
| P4-08   | Air-gapped install test in CI on every release        | BE    | M9     | ☐      |
| P4-09   | Phase 4 EXIT — first enterprise on-prem in production | Solo  | M9     | ☐      |

### Phase 4 Exit Criteria

- [ ] First enterprise customer running on-prem in production
- [ ] Air-gapped pilot at one regulated customer (bank, healthcare, gov)
- [ ] Zero-downtime upgrade verified

---

## Phase 5 — Differentiators (Months 9–12)

| Task ID | Task                                              | Owner | Sprint  | Status |
| ------- | ------------------------------------------------- | ----- | ------- | ------ |
| P5-01   | Per-query cost surfacing (Snowflake / BigQuery)   | BE+FE | M9-M10  | ☐      |
| P5-02   | Cohort builder (UI + SQL compiler)                | FE+BE | M10     | ☐      |
| P5-03   | Funnel builder                                    | FE+BE | M10     | ☐      |
| P5-04   | Retention / heatmap builder                       | FE+BE | M11     | ☐      |
| P5-05   | Slack interactive cards (Block Kit)               | BE    | M11     | ☐      |
| P5-06   | Public tokenized share links                      | BE    | M11     | ☐      |
| P5-07   | AI NL Q&A grounded in semantic layer (BYO LLM)    | BE+FE | M11-M12 | ☐      |
| P5-08   | Schema-drift detection + auto-mapping             | BE    | M12     | ☐      |
| P5-09   | Synthetic / demo mode                             | BE+FE | M12     | ☐      |
| P5-10   | Phase 5 EXIT — ≥3 features no other BI tool ships | Solo  | M12     | ☐      |

### Phase 5 Exit Criteria

- [ ] ≥3 features no other BI tool ships
- [ ] Public case study from a customer who chose Arc Insights for a differentiator

---

## Phase 6 — Scale + Ecosystem (Year 2)

| Task ID | Task                                          | Owner  | Sprint | Status |
| ------- | --------------------------------------------- | ------ | ------ | ------ |
| P6-01   | Custom viz plugin SDK                         | BE+FE  | Y2     | ☐      |
| P6-02   | Reverse-ETL integration (Hightouch / Census)  | BE     | Y2     | ☐      |
| P6-03   | iOS / Android viewer apps                     | Mobile | Y2     | ☐      |
| P6-04   | Real-time co-editing (Yjs)                    | FE+BE  | Y2     | ☐      |
| P6-05   | i18n (top 5 non-English languages)            | FE     | Y2     | ☐      |
| P6-06   | Federated multi-DB queries via DuckDB / Trino | BE     | Y2     | ☐      |
| P6-07   | Marketplace for connectors and dashboards     | BE+FE  | Y2     | ☐      |

---

## Cadence

- **Daily, 5 min** — review In Progress tasks; flag blockers
- **Weekly, 30 min** — update Done; have design-partner calls; update CHANGELOG.md
- **Per phase, 1 hr** — walk Exit Criteria; demo to design partners; write a 1-page retrospective
- **Monthly, 2 hrs** — review whole roadmap; cut scope if slipping (never quality)
- **Per release** — air-gapped install test in CI; k6 load test; tag; publish

## How to update this file

1. Pick a task. Set its status to `◐ In Progress` in the table above.
2. Branch: `<type>/<task-id>-short-description` (e.g., `feat/P1-04-snowflake`).
3. Commit: `feat(connectors): add snowflake driver [P1-04]`.
4. Open PR with `Closes [P1-04]` in the description.
5. After merge: set status to `✓ Done`. Paste the PR link in the **Linked PR / commit** column.
6. Update the Phase Overview Done count at the top.

## Graduating beyond this file

This markdown tracker is sized for a solo dev or two co-founders. When the team hits 3+ people or you have external contributors, migrate to **GitHub Projects + Issues** — same task IDs, but with proper kanban, automatic linking via "Closes #123", and team-level visibility. The migration is half a day of import work.
