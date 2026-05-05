# Bun + DuckDB load-test results (P0-21)

Tracks the spike result that decides whether the query execution tier stays in
Bun or falls back to the Go escape hatch described in
[`docs/adr/0001-stack-choice.md`](./adr/0001-stack-choice.md).

## How to run

```bash
# Defaults: 100 workers × 5 queries against a 1M-row in-memory DuckDB table.
bun run backend/scripts/loadtest-duckdb.ts

# Tune:
CONCURRENCY=200 QUERIES_PER_WORKER=10 ROW_COUNT=5000000 \
  bun run backend/scripts/loadtest-duckdb.ts
```

## Pass criteria

p99 latency ≤ **uncached** budget from [`CLAUDE.md`](../CLAUDE.md#performance-budgets-enforced-in-ci): **8000 ms**.
The cached budget (p99 ≤ 500 ms) does not apply here — DuckDB hits cold synthetic
data on every query, with no Valkey result cache in front of it.

If the result fails by a wide margin, that's a vote for moving the query
execution tier to a separate Go service before P3 ships.

## Result log

> Append a row each time you run the spike. Treat regressions across rows as
> a signal worth investigating.

| Date       | Hardware               | Bun    | DuckDB                   | Concurrency | Queries |      Rows | Wall (ms) | QPS | p50 | p95 | p99 | Verdict                           |
| ---------- | ---------------------- | ------ | ------------------------ | ----------: | ------: | --------: | --------: | --: | --: | --: | --: | --------------------------------- |
| 2026-05-06 | macOS arm64 (M-series) | 1.3.12 | 1.4.2 (via duckdb-async) |         100 |     500 | 1,000,000 |     2,334 | 214 | 393 | 792 | 838 | ✅ PASS (p99 838 ms ≤ 8 s budget) |

## What this spike does _not_ cover

- Network round-trip to a real Postgres / Snowflake / BigQuery (the actual
  customer-DB tier). DuckDB is acting as the result-shaping layer here, not
  as a stand-in for the source database.
- Long-tail behaviour over hours (memory growth, descriptor leaks). For that
  see the monthly load test that should run pre-release once Phase 1 ships.
- Multi-tenant isolation cost. Once the `withTenant()` helper is in the hot
  path, re-run the spike with a `SET LOCAL app.tenant_id` per query and
  compare — the difference is the tenancy tax.
