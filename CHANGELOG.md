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
