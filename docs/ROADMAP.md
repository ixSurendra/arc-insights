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

## Phase 1 — Core BI loop (realigned 2026-05-06)

**Goal:** Tenant connects data → builds widgets → groups them in dashboards → ships reports → all assisted by AI. Single mock tenant, no real auth/RBAC. Plug into the `ix-copilot` foundation in Phase 2.

See [UX-SPEC.md](UX-SPEC.md) for binding behavior contracts on every task below.

### Data layer

- P1-01 — Postgres connector (drivers, connection pool, schema scan)
- P1-02 — MySQL / MariaDB connector
- P1-03 — BigQuery connector (service-account auth)
- P1-04 — Snowflake connector (key-pair auth)
- P1-16 — CSV upload (parser, type inference, table-name confirm, import to workspace DB)
- P1-17 — Connect-data UI (DB picker + CSV tile + connection forms + test)
- P1-18 — Schema scan with AI narration (streamed)
- P1-19 — Auto-generated starter dashboard (X-rays pattern)
- P1-20 — Data Sources list page (status, latency, cache hit, last refreshed)

### Data Model (semantic layer "B-plus")

- P1-21 — Tables & columns surface (friendly names, FK display labels, field types, hide flags)
- P1-22 — Metrics & calculations (no-code builder + SQL expression)
- P1-23 — Pre-defined joins
- P1-24 — Row-level access policies (visual rule builder + SQL escape hatch — definitions only; runtime enforcement Phase 2)
- P1-25 — Auto-detect on connect + persistent "Review your data model" banner

### Widgets

- P1-05 — Visual no-code query builder (UI + JSON spec)
- P1-06 — Raw SQL editor with Data-Model-aware autocomplete
- P1-07 — Query → SQL compiler + DuckDB result shaping
- P1-08 — Widget catalog: 18 chart types + 3 containers (registry + ECharts/AG-Grid wrappers)
- P1-26 — Widget builder configurator (3 doors: Ask AI · Visual · SQL → shared 3-zone layout)
- P1-27 — Widget options panel (title · legend · widget filters · theme override · formatting · cond. formatting · goals · sort · empty state · tooltip)
- P1-28 — Smart chart-type suggestion + alternatives matrix
- P1-29 — Widget library page (search · filter · folder · tag · drag to dashboard · "used in N dashboards")
- P1-30 — Edit-once-update-everywhere with explicit Fork

### Dashboards

- P1-09 — Dashboard grid (responsive: desktop / tablet / mobile · drag-resize in edit)
- P1-31 — Hybrid edit mode (per-widget pencil + dashboard-wide edit)
- P1-32 — Filter bar + drill-down (click filters dashboard · right-click "see rows")
- P1-33 — 3-level theming (workspace / dashboard / widget) with 5 theme presets
- P1-34 — Embedded dashboard view (bare grid + filters; header optional)
- P1-35 — Auto-aggregation engine (line/bar/scatter/map thresholds + "show raw" override)
- P1-36 — Pagination engine (server-side, virtualized, 100k row hard cap)
- P1-37 — 4 layout patterns (Executive · Operational · Funnel · Comparison)
- P1-38 — 5 dashboard templates (Executive · Sales · Marketing · Ops · SaaS metrics)

### Reports

- P1-39 — Reports surface (flowing document: headings · markdown · widgets · callouts · page breaks)
- P1-40 — Report exports: PDF · CSV-per-widget · XLSX
- P1-41 — Report scheduling UI (delivery wiring lands in Phase 2)
- P1-42 — Report versioning (snapshot per scheduled run)
- P1-43 — 3 report templates (Monthly business review · Weekly digest · Quarterly board pack)

### Home page

- P1-44 — Home page locked spec (above/below split · persistent Ask AI · suggestion cards · pinned dashboards · templates section gated by dashboard count)

### AI surfaces (provider: Ollama Cloud, default `gpt-oss:120b` / `gpt-oss:20b`)

- P1-45 — Vercel AI SDK + provider abstraction (Ollama Cloud + future BYO)
- P1-46 — Ask AI conversational thread (home + widget builder · streaming · visible reasoning · per-user persistent history · share thread)
- P1-47 — Explain this widget (one-shot · cites tables/joins/filters/metrics)
- P1-48 — Auto-name (widget · dashboard · report)
- P1-49 — Anomaly callouts on widgets
- P1-50 — Auto-summary on reports (on by default · dismissible)
- P1-51 — Per-section commentary in reports
- P1-52 — Suggested dashboard arrangements (over tenant's existing widgets)
- P1-53 — Smart-fill template field mapping (tenant confirms before generation)
- P1-54 — BYO-LLM capability detection + per-feature toggles + (mock) token budget caps

### Sharing & embed (UI only — security wiring Phase 2)

- P1-13 — PDF / CSV / XLSX export (per widget + per dashboard + per report)
- P1-55 — Save / share / fork (intra-tenant)
- P1-56 — Embed config UI (per dashboard / report: header toggle · locked filters · hidden chrome · theme · allowed domains · expiry · custom-claims preview)

### Phase 1 EXIT

- P1-15 — Phase 1 EXIT review with first design partner

**Exit criteria:**

- [ ] Tenant connects Postgres or uploads CSV in <60 s
- [ ] AI narrates schema scan and produces a starter dashboard within ~10 s
- [ ] Tenant builds a widget through any of the three doors and saves it
- [ ] Saved widget reused across two dashboards; edit propagates
- [ ] Report scheduled (UI saved; delivery deferred); PDF + CSV download works
- [ ] Embed snippet renders the dashboard in an external page (no auth check yet)
- [ ] AI surfaces work end-to-end against Ollama Cloud
- [ ] p95 cached query <500 ms; uncached <2 s

---

## Phase 2 — Foundation integration + production-ready (Months 4–6)

**Goal:** Plug Arc into the `ix-copilot` foundation. First real customers can pilot. SOC 2 path opens.

### Foundation integration

- P2-01 — Auth integration: `validate_token` middleware on every Arc API call
- P2-02 — RBAC integration: register Arc modules + permissions into `ix-copilot/users-service`; route guards reading effective permissions
- P2-03 — License/quota integration: register Arc features into `ix-copilot/license-service`; call `check_quota` and `record_usage`
- P2-04 — Audit publishing to `ix-copilot/audit-service` for every save/edit/share/run/embed-token-issue
- P2-05 — Branding inheritance: read `get_effective_branding` from `tenant-service` for workspace theme defaults

### Embed security

- P2-06 — Embed JWT signing (Arc-side, short-lived, refreshable)
- P2-07 — Row-level access policy enforcement at query time (claims drive Data Model rules)
- P2-08 — Allowed-domain CSP enforcement on embed iframes

### Notifications & alerts

- P2-09 — Anomaly detection engine (statistical core + LLM annotation)
- P2-10 — In-product notification center
- P2-11 — Email + Slack alert delivery (uses tenant SMTP config + per-tenant alert quotas)
- P2-12 — Alert configuration UI (per dashboard / per widget thresholds)
- P2-13 — Scheduled-report delivery (graphile-worker + email + tenant SMTP config)

### Settings + workspace

- P2-14 — Settings → AI surface (per-tenant provider · model preset · per-feature toggles · token budget meter)
- P2-15 — Settings → Home page (templates always-show toggle, etc.)
- P2-16 — Settings → Branding (read-only mirror of `tenant-service` branding)

### Production hardening

- P2-17 — Query result caching in Valkey with tenant-prefixed keys
- P2-18 — Postgres RLS for per-tenant isolation
- P2-19 — systemd watchdog + real-work health endpoint
- P2-20 — Backup / restore tooling
- P2-21 — OpenTelemetry across all tiers
- P2-22 — Folder-level ACL implementation (overlay on foundation roles)
- P2-23 — Phase 2 EXIT — 5 design partners using daily, p99 <5 s, security audit clean

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
