# One-time setup

After extracting the starter kit into your `arc-insights/` repo, do these steps once.

## 1. Install dependencies

```bash
cd arc-insights
bun install
```

This installs everything across the monorepo (backend, frontend, sdk) and also runs the `prepare` script which initializes Husky.

## 2. Verify the Husky pre-commit hook

The hook is already committed at `.husky/pre-commit` and is wired up automatically by the `prepare` script that ran during `bun install`. Verify it fires:

```bash
echo "test" > test.txt
git add test.txt
git commit -m "test: verify husky [P0-05]"
# You should see lint-staged run before the commit completes.
git reset HEAD~1
rm test.txt
```

If the hook didn't run, ensure `.husky/pre-commit` is executable (`chmod +x .husky/pre-commit`) and re-run `bun install`.

## 3. Set up environment variables

```bash
cp .env.example .env
```

Fill in real values for `SESSION_SECRET` and `EMBED_JWT_SECRET`:

```bash
# Generate secrets
openssl rand -hex 32  # paste into SESSION_SECRET
openssl rand -hex 32  # paste into EMBED_JWT_SECRET
```

If you're not using LLM features yet, set `LLM_DISABLED=true`. Same for telemetry: `TELEMETRY_ENABLED=false`.

## 4. Boot the infrastructure (Postgres + Valkey)

```bash
make infra-up
```

This starts Postgres (port 5432) and Valkey (port 6379) in Docker.

## 5. Apply the first DB migration

The hand-written initial migration creates the `tenants`, `users`, and
`audit_log` tables and enables Postgres RLS with the policies bound by
`withTenant()`. Apply it to your local Postgres:

```bash
cd backend
bun run db:bootstrap   # psql $DATABASE_URL -f drizzle/0000_initial.sql
cd ..
```

The `db:generate` / `db:migrate` scripts that drive Drizzle Kit's tracked
migration journal are wired up but not in use yet — adding the journal is a
follow-up to P0-09. For now `db:bootstrap` is canonical.

## 6. Boot the dev loop

```bash
make dev
```

You should see:

- Postgres + Valkey already running (from step 4)
- Elysia API on `http://localhost:3000` (`/health` and `/docs`)
- React frontend on `http://localhost:5173` proxying to the API

The frontend will display a JSON response from `/health`. If you see it, the dev loop is alive — Phase 0 task **P0-08 (Eden Treaty wired end-to-end)** is done.

## 7. Run the test suite + lint

```bash
make ci
```

Should pass cleanly: lint → typecheck → test. CI in GitHub Actions runs the same commands on every PR.

## 8. Optional — open Drizzle Studio

```bash
cd backend && bun run db:studio
```

Opens a local DB UI at `https://local.drizzle.studio`.

---

## What you've now closed

After completing the steps above, these Phase 0 tasks are done:

- P0-03 — Bun monorepo
- P0-04 — Bun version pinned (`.tool-versions` + Dockerfile)
- P0-05 — TypeScript strict + ESLint + Prettier + Husky + lint-staged
- P0-06 — Elysia backend with `/health`
- P0-07 — React + Vite frontend
- P0-08 — Eden Treaty wired end-to-end (`App.tsx` → `@arc-insights/sdk` → `/health`)
- P0-09 — Drizzle + Postgres + initial migration with `tenant_id` pattern + RLS policies + cross-tenant adversarial tests
- P0-10 — Local docker-compose
- P0-11 — `make dev` script
- P0-12 — GitHub Actions CI (`.github/workflows/ci.yml`: lint + typecheck + test + build + docker + air-gapped dry-run)
- P0-13 — Distroless multi-arch Dockerfile
- P0-15 — Air-gapped install dry-run (CI job boots the image with `--network=none` and probes `/health`)
- P0-17 — First 3 ADRs
- P0-19 — README, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT
- P0-21 — Bun + DuckDB load-test spike script (run `bun run --filter '@arc-insights/backend' loadtest:duckdb` and append the row to `docs/loadtest-results.md`)

Update `docs/PROGRESS.md` to mark these as ✓ Done after you've verified each one runs cleanly. Remember: PROGRESS.md is the single source of truth for status.

## What's still left in Phase 0

- **P0-02** — Replace LICENSE stub with full AGPLv3 text from gnu.org/licenses/agpl-3.0.txt
- **P0-14** — First Helm chart skeleton in `/helm`
- **P0-16** — OpenTelemetry instrumentation (one span per request)
- **P0-18** — Public docs site stub (Mintlify or Nextra)
- **P0-20** — First Playwright E2E test
- **P0-22** — Phase 0 EXIT review (after the rest)

The non-technical pre-flight items (design partners, ICP, pricing, domain, legal entity) should happen in parallel — see `docs/adr/` and the workbook's Pre-Build Checklist.

## Troubleshooting

**`bun install` fails with peer-dep conflicts:** make sure your Bun version matches `.tool-versions` (1.1.34). Run `bun upgrade` if needed.

**`make dev` fails to connect to Postgres:** run `make infra-up` first and wait for the healthcheck.

**`bun run db:generate` says "no schema changes":** that's fine — it means your local DB is in sync with the schema.

**ESLint complains about a rule you don't recognize:** open `eslint.config.js` and either tighten or relax the rule. Document the change in a commit.

**Husky hook didn't fire on commit:** make sure `.husky/pre-commit` is executable (`chmod +x`) and `bun install` completed (which runs `husky` to set up Git hooks).
