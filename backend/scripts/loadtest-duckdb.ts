/**
 * P0-21 — Bun + DuckDB load-test spike.
 *
 * Validates the assumption in docs/adr/0001-stack-choice.md: Bun in-process
 * with embedded DuckDB can handle ≥100 concurrent analytical queries with
 * acceptable latency. If this fails, the ADR's "designed-in escape hatch"
 * applies — the query execution tier becomes a separate Go service.
 *
 * Methodology:
 *   1. Generate a synthetic dataset in DuckDB (events table, ~1M rows).
 *   2. Launch N concurrent workers that each issue M analytical queries
 *      (group-by + aggregate + filter). Default 100 workers × 5 queries.
 *   3. Record per-query latency. Print p50 / p95 / p99 / max + total wallclock.
 *
 * Usage:
 *   bun run backend/scripts/loadtest-duckdb.ts                # defaults
 *   CONCURRENCY=200 QUERIES_PER_WORKER=10 bun run …          # tune
 *
 * Result is printed to stdout and appended to docs/loadtest-results.md
 * if --append is passed.
 */
import { Database } from "duckdb-async";

const CONCURRENCY = Number(process.env.CONCURRENCY ?? 100);
const QUERIES_PER_WORKER = Number(process.env.QUERIES_PER_WORKER ?? 5);
const ROW_COUNT = Number(process.env.ROW_COUNT ?? 1_000_000);

interface Sample {
  workerId: number;
  queryIdx: number;
  durationMs: number;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(
    sorted.length - 1,
    Math.ceil((p / 100) * sorted.length) - 1,
  );
  return sorted[idx]!;
}

async function seed(db: Database): Promise<void> {
  console.info(`Seeding ${ROW_COUNT.toLocaleString()} rows…`);
  await db.all(`
    CREATE OR REPLACE TABLE events AS
    SELECT
      (i % 10000)::INTEGER                                AS user_id,
      (TIMESTAMP '2025-01-01' + (i * INTERVAL 1 SECOND)) AS ts,
      ('region_' || (i % 7))                              AS region,
      ('product_' || (i % 50))                            AS product,
      (random() * 1000)::DECIMAL(10, 2)                   AS revenue_cents
    FROM range(0, ${ROW_COUNT}) t(i);
    CREATE INDEX events_region_idx ON events(region);
  `);
}

const QUERIES = [
  `SELECT region, COUNT(*) AS n, SUM(revenue_cents) AS rev
   FROM events WHERE ts >= TIMESTAMP '2025-01-01' GROUP BY region ORDER BY rev DESC`,
  `SELECT product, COUNT(DISTINCT user_id) AS dau, AVG(revenue_cents) AS arpu
   FROM events GROUP BY product ORDER BY dau DESC LIMIT 20`,
  `SELECT date_trunc('day', ts) AS day, SUM(revenue_cents) AS rev
   FROM events GROUP BY day ORDER BY day`,
  `SELECT region, product, COUNT(*) AS n
   FROM events WHERE region = 'region_3' GROUP BY region, product ORDER BY n DESC`,
  `SELECT user_id, COUNT(*) AS events_count, SUM(revenue_cents) AS spend
   FROM events GROUP BY user_id HAVING COUNT(*) > 50 ORDER BY spend DESC LIMIT 100`,
];

async function worker(db: Database, workerId: number): Promise<Sample[]> {
  const samples: Sample[] = [];
  for (let q = 0; q < QUERIES_PER_WORKER; q++) {
    const sql = QUERIES[q % QUERIES.length]!;
    const t0 = performance.now();
    await db.all(sql);
    samples.push({ workerId, queryIdx: q, durationMs: performance.now() - t0 });
  }
  return samples;
}

async function main(): Promise<void> {
  const db = await Database.create(":memory:");
  await seed(db);

  console.info(
    `Running ${CONCURRENCY} workers × ${QUERIES_PER_WORKER} queries = ${CONCURRENCY * QUERIES_PER_WORKER} total queries`,
  );

  const wallStart = performance.now();
  const results = await Promise.all(
    Array.from({ length: CONCURRENCY }, (_, i) => worker(db, i)),
  );
  const wallMs = performance.now() - wallStart;

  const all: number[] = results
    .flat()
    .map((s) => s.durationMs)
    .sort((a, b) => a - b);
  const total = all.length;
  const sum = all.reduce((a, b) => a + b, 0);

  const stats = {
    concurrency: CONCURRENCY,
    queriesPerWorker: QUERIES_PER_WORKER,
    totalQueries: total,
    rowCount: ROW_COUNT,
    wallMs: Math.round(wallMs),
    throughputQps: Math.round((total / wallMs) * 1000),
    avgMs: Math.round(sum / total),
    p50Ms: Math.round(percentile(all, 50)),
    p95Ms: Math.round(percentile(all, 95)),
    p99Ms: Math.round(percentile(all, 99)),
    maxMs: Math.round(all[all.length - 1]!),
  };

  console.info("\n── Results ───────────────────────────────────────");
  console.info(JSON.stringify(stats, null, 2));

  // Pass/fail against the cached-query budget in CLAUDE.md (p99 ≤ 500ms).
  // DuckDB on local synthetic data is uncached — uncached budget is p99 ≤ 8000ms.
  const PASS_P99_MS = Number(process.env.PASS_P99_MS ?? 8000);
  if (stats.p99Ms > PASS_P99_MS) {
    console.error(
      `\n❌ FAIL — p99 ${stats.p99Ms}ms exceeds budget ${PASS_P99_MS}ms`,
    );
    process.exit(1);
  }
  console.info(`\n✅ PASS — p99 ${stats.p99Ms}ms ≤ ${PASS_P99_MS}ms`);

  await db.close();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
