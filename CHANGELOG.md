# Changelog

All notable changes to Arc Insights are documented in this file.

This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial monorepo scaffold (Bun workspaces, Elysia backend, React + Vite frontend, Eden Treaty SDK).
- Distroless multi-arch Dockerfile.
- ADRs 0001 (stack), 0002 (license), 0003 (multi-tenancy).
- Documentation set: README, CLAUDE.md, ROADMAP, PROGRESS, FEATURES, ARCHITECTURE, UX-SPEC, AI-SURFACES, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT.
- ESLint flat config, Prettier, EditorConfig, Husky pre-commit hook, lint-staged.
- `.tool-versions` pinning Bun 1.1.34 (matches Dockerfile).
- `.env.example` covering DB, cache, auth, LLM, and telemetry.
- Drizzle schema for `tenants`, `users`, `audit_log` with `tenant_id` pattern (P0-09).
- `withTenant()` query helper that binds `app.tenant_id` per ADR 0003.
- Initial SQL migration `backend/drizzle/0000_initial.sql` with tables, indexes, and Postgres RLS policies bound to `app.tenant_id` (P0-09).
- Cross-tenant adversarial test suite at `backend/src/db/withTenant.test.ts` covering RLS denial, isolation, WITH CHECK on cross-tenant inserts, append-only audit log, and SQL-injection-via-tenantId (P0-09).
- Frontend → SDK wiring: `App.tsx` now calls `client.health.get()` through `@arc-insights/sdk` (P0-08).
- GitHub Actions CI workflow with lint, typecheck, format check, tests against a Postgres service container, build, Docker buildx, and an air-gapped `--network=none` boot probe of `/health` (P0-12, P0-15).
- Bun + DuckDB load-test spike script `backend/scripts/loadtest-duckdb.ts` and result log `docs/loadtest-results.md` (P0-21 — script ready, run pending).

### Changed

- FEATURES.md: 143 → 147 features. Added dataset preview & profiling on connect (§1, P1), per-chart lineage & explainability panel (§4, P1), embed admin console (§9, P1), connector SDK (§16, P3).
- ROADMAP.md: pulled scheduled subscriptions and PDF/PNG/CSV export forward from Phase 2 to Phase 1 (now P1-12, P1-13) so the §5 P0 priority is honored. Phase 2 renumbered (P2-03..P2-08) and shrank from 10 to 8 tasks; total 79 → 80.
- ROADMAP.md: added embed admin console as P3-09; Phase 3 EXIT renumbered to P3-10. Phase 3 grew from 9 to 10 tasks.
- PROGRESS.md: phase totals + task tables synced to the ROADMAP changes above.
- PROGRESS.md: 16 Phase-0 tasks flipped to ✓ Done after CI went green on c2a1952. Phase 0 now 16/22; remaining: P0-02 (LICENSE), P0-14 (Helm), P0-16 (OTel), P0-18 (docs site), P0-20 (Playwright), P0-22 (EXIT review). 6 of 10 Phase-0 exit criteria now satisfied.
- LICENSE: replaced 26-line stub with the full 661-line AGPLv3 text from gnu.org/licenses/agpl-3.0.txt (P0-02). Phase 0 now 17/22.
- Playwright E2E suite: `frontend/playwright.config.ts` + `frontend/e2e/health.spec.ts` boot the backend and Vite via `webServer`, then assert that `/` renders the SDK-fetched health JSON. CI gets a new `e2e` job that installs Chromium and uploads a report artifact on failure (P0-20). Phase 0 now 18/22.
- Helm chart skeleton at `helm/`: Chart.yaml, values.yaml, templates/{deployment,service,\_helpers.tpl}, .helmignore. Deployment runs as non-root with read-only rootfs and probes `/health`; Service exposes :3000. BYO Postgres + Valkey via `env`. Production HA build-out (multi-replica, bundled subcharts, BYOK, license keys) is P4-01. P0-14 done — Phase 0 now 19/22.
- OpenTelemetry skeleton: `backend/src/telemetry.ts` exports a `tracer` from `@opentelemetry/api`, and the Elysia chain in `backend/src/index.ts` opens a span per request via `.derive`, sets attributes/status in `.onAfterResponse`, and ends + records exceptions in `.onError`. No SDK provider is registered yet, so spans are no-ops at runtime — the OTLP exporter and collector wiring land in P2-09. P0-16 done — Phase 0 now 20/22.
- Public docs site stub at `docs-site/` (Mintlify): `mint.json`, `introduction.mdx`, `quickstart.mdx`, `api/health.mdx`, plus a README explaining the relationship between `docs/` (contributor docs) and `docs-site/` (end-user docs at docs.arcinsights.io). P0-18 done — Phase 0 now 21/22.
- Phase 0 EXIT review at `docs/retro/2026-05-phase-0.md` — what shipped, what surprised us, exit-criteria status, decisions made/deferred, performance against budgets, carry into Phase 1. P0-22 done — **Phase 0 closed at 22/22.**
- Pricing sketch at `docs/pricing.md` (internal alignment): 4 tiers (Free OSS, Cloud Starter, Cloud Pro, Enterprise), strategic shape, design-partner terms, open questions. Closes the matching Phase 0 exit-criterion.
- **Phase 1 begins.** P1-01 — Postgres connector at `backend/src/connectors/`. `types.ts` defines the shared `Connector` interface (test, scanSchema, runQuery, close) with `SchemaTable`/`SchemaColumn`/`QueryResult` types that all four connectors will implement. `postgres.ts` wraps postgres.js as a single-pool-per-data-source driver: `test()` does `SELECT version()`, `scanSchema()` introspects via `information_schema.columns` joined with `information_schema.tables` (excludes pg_catalog/pg_toast/information_schema), `runQuery()` returns shaped rows with timing. 5 unit tests against the local docker-compose Postgres pass green.
- P1-02 — MySQL / MariaDB connector at `backend/src/connectors/mysql.ts`. Uses `mysql2/promise`, same `Connector` interface as Postgres (the interface stayed unchanged — no Postgres-shaped accidents). MySQL-specific pieces: system schemas `information_schema`/`mysql`/`performance_schema`/`sys` excluded from scan, type-inference table covers tinyint/decimal/datetime/etc., `VERSION()` for the test query. `docker-compose.yml` gains a `mysql:8.0` service for `make infra-up`; CI's test job gains a matching service container with `MYSQL_TEST_URL` env. 5 hermetic tests (create-fixture-table, exercise, drop) pass green. Phase 1: 2/14.
- P1-07 — Query → SQL compiler + DuckDB result shaping at `backend/src/query/`. `spec.ts` defines the Zod-validated `QuerySpec` (from / dimensions / measures / filters / orderBy / limit) plus refined types: `count(*)` is the only legal `*`-aggregate, `in/not_in` requires a non-empty array, `is_null` rejects a value, `limit` caps at 10 000. `compile.ts` compiles to postgres / mysql / duckdb dialects with proper identifier quoting (`"x"` / `` `x` `` / `"x"`), placeholder styles (`$N` / `?` / `?`), and time-bucket emulation for MySQL (no `date_trunc`). Identifier perimeter rejects anything outside `[A-Za-z_][A-Za-z0-9_]*`. `shape.ts` exposes `shapeWithDuckDB(rows, ddbSql)` — loads source-DB rows into in-memory DuckDB as a CTE named `input` via bound parameters (so adversarial cell values can't break the SQL), runs the shaping query, returns shaped rows. `execute.ts` orchestrates spec → compileQuery → connector.runQuery → optional shapeWithDuckDB. 21 new tests (14 compiler unit + 4 DuckDB shape + 3 Postgres integration) green; backend suite total 35 pass / 0 fail. Phase 1: 3/14.
- P1-08 — Six chart types at `frontend/src/charts/`. `types.ts` defines the discriminated `ChartConfig` union (line / bar / pie / scatter / big_number / table) and `ChartData`. `adapters.ts` exposes pure functions: `toLineOption` / `toBarOption` / `toPieOption` / `toScatterOption` (ECharts options), `toBigNumber` (Intl-formatted number/currency/percent + delta), `toAgGridColumns` (sortable + filterable + resizable). The umbrella `Chart.tsx` switches on `config.type` and dispatches to `EChart.tsx` (echarts-for-react), `BigNumber.tsx`, or `DataTable.tsx` (AG Grid Community with the Quartz theme). Sample-data demo lives in `App.tsx`; Playwright spec `e2e/charts.spec.ts` asserts all six render. 15 vitest adapter tests + 2 Playwright specs all green. Phase 1: 4/14.

### Deprecated

- _Nothing yet._

### Removed

- _Nothing yet._

### Fixed

- _Nothing yet._

### Security

- _Nothing yet._

---

## How to update this file

After every PR that adds, changes, deprecates, removes, or fixes something user-visible, append a one-line bullet under the appropriate section in `[Unreleased]`. When you cut a release, rename `[Unreleased]` to `[X.Y.Z] - YYYY-MM-DD` and start a fresh `[Unreleased]` block above it.

Reference the task ID in each line where it applies — same convention as commits:

- `- Added Snowflake connector with key-pair auth [P1-04].`
