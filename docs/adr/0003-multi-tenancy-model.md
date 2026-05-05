# 0003 — Multi-tenancy: shared schema with tenant_id and Postgres RLS

- **Status:** Accepted
- **Date:** 2026-05-04
- **Deciders:** Founder

## Context

Arc Insights serves three deployment shapes from one codebase:
1. **Cloud SaaS** — many tenants on shared infrastructure
2. **Embedded** — our customers' end-customers see only their own slice
3. **On-prem / single-tenant** — one customer, one deployment

The multi-tenancy model affects every database table, every query, every cache key, every audit log entry. Choosing the wrong model is one of the most expensive mistakes a B2B SaaS can make. Choose now; never refactor.

## Decision

**Shared schema with `tenant_id NOT NULL` on every domain table, and Postgres row-level security (RLS) policies enforcing tenant filters.**

## Rationale

- **Operational simplicity.** One database to back up, monitor, and migrate. No per-tenant schema sprawl.
- **Defense in depth.** RLS policies are enforced by Postgres, not just by application code. A bug in app-layer filters is caught by the database.
- **Cheap to scale.** Tens of thousands of tenants on one Postgres before sharding is required.
- **Consistent with single-tenant deploys.** On-prem installs run with `tenant_id` populated from a single value; the same code paths exercise the same RLS policies.

## Implementation rules (binding)

1. Every domain table includes `tenant_id UUID NOT NULL`.
2. RLS policies are written at table-creation time and tested in CI.
3. The Elysia request context carries the active `tenant_id` injected at auth time (`request.tenant`).
4. Database connections execute `SET LOCAL app.tenant_id = $1` before any query — RLS policies read this setting.
5. A linter rule blocks raw SQL that doesn't go through the tenant-aware query helper.
6. Every cache key starts with `tenant:{tenant_id}:` — direct Valkey access is forbidden in code review.
7. Every audit log entry includes `tenant_id`.
8. Every CI run includes adversarial tests that try to read across tenants. Failures break the build.

## Alternatives considered

- **Schema per tenant.** Cleaner isolation, but per-tenant migrations and connection-pool-per-schema make ops a nightmare at scale. Rejected.
- **Database per tenant.** Strongest isolation. Excellent for very large enterprise customers. Rejected for the SaaS path; reserved as an option for premium enterprise tiers later.
- **App-level filtering only (no RLS).** Faster initial development, but a single missed `WHERE` clause leaks tenant data. Unacceptable risk. Rejected.

## Consequences

- All schema migrations include the `tenant_id` column and an RLS policy stub.
- Database access goes through one helper that injects the tenant context. No bypass.
- Tests that create users span at least two tenants and verify isolation explicitly.
- We are committing to Postgres specifically for the metadata layer (RLS is a Postgres feature). Other databases are not interchangeable.
