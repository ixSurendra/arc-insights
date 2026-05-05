/**
 * Cross-tenant adversarial tests for withTenant() + RLS.
 *
 * These tests bind the binding rules in docs/adr/0003-multi-tenancy-model.md
 * to reality: if a future change weakens isolation, these tests fail.
 *
 * Requirements:
 *   - DATABASE_URL set, pointing at a Postgres with the migration applied.
 *   - The tables are TRUNCATEd before each test, so do NOT run against prod.
 *
 * In CI these run against the postgres service container in .github/workflows/ci.yml.
 * Locally: `make infra-up && psql $DATABASE_URL -f backend/drizzle/0000_initial.sql && bun test`.
 */
import { describe, test, expect, beforeAll, beforeEach } from "bun:test";
import { sql } from "drizzle-orm";
import { db, withTenant, schema } from "./index.ts";

const DB_AVAILABLE = Boolean(process.env.DATABASE_URL);

describe.skipIf(!DB_AVAILABLE)(
  "withTenant + RLS cross-tenant isolation",
  () => {
    let tenantA: string;
    let tenantB: string;

    beforeAll(async () => {
      // Bootstrap two tenants for the suite. Direct `db` use is permitted here
      // because we're operating outside any tenant context (admin / migration role).
      await db.execute(
        sql`TRUNCATE audit_log, users, tenants RESTART IDENTITY CASCADE`,
      );
      const [a] = await db
        .insert(schema.tenants)
        .values({ name: "Tenant A", slug: "a" })
        .returning({ id: schema.tenants.id });
      const [b] = await db
        .insert(schema.tenants)
        .values({ name: "Tenant B", slug: "b" })
        .returning({ id: schema.tenants.id });
      tenantA = a!.id;
      tenantB = b!.id;
    });

    beforeEach(async () => {
      // Reset users/audit between tests; tenants persist across tests in this suite.
      await db.execute(sql`TRUNCATE audit_log, users RESTART IDENTITY CASCADE`);
    });

    test("a query as app_user without app.tenant_id sees zero rows", async () => {
      // Insert a row through the proper path so there's something to (not) see.
      await withTenant(tenantA, async (tx) => {
        await tx
          .insert(schema.users)
          .values({ tenantId: tenantA, email: "a@example.com" });
      });

      // Now run a SELECT as app_user without binding app.tenant_id. The RLS
      // policy condition `tenant_id::text = current_setting('app.tenant_id', true)`
      // evaluates to NULL (treated as false), so app_user sees zero rows. This
      // is the safe-default behaviour that makes "I forgot withTenant()" benign.
      const rowsAsApp = await db.transaction(async (tx) => {
        await tx.execute(sql`SET LOCAL ROLE app_user`);
        return tx.select().from(schema.users);
      });
      expect(rowsAsApp.length).toBe(0);

      // As a sanity check, the superuser DOES see the row (RLS bypass).
      const rowsAsAdmin = await db.select().from(schema.users);
      expect(rowsAsAdmin.length).toBe(1);
    });

    test("withTenant(A) sees only tenant A rows", async () => {
      await withTenant(tenantA, (tx) =>
        tx
          .insert(schema.users)
          .values({ tenantId: tenantA, email: "a@example.com" }),
      );
      await withTenant(tenantB, (tx) =>
        tx
          .insert(schema.users)
          .values({ tenantId: tenantB, email: "b@example.com" }),
      );

      const aSeen = await withTenant(tenantA, (tx) =>
        tx.select().from(schema.users),
      );
      expect(aSeen.length).toBe(1);
      expect(aSeen[0]!.email).toBe("a@example.com");

      const bSeen = await withTenant(tenantB, (tx) =>
        tx.select().from(schema.users),
      );
      expect(bSeen.length).toBe(1);
      expect(bSeen[0]!.email).toBe("b@example.com");
    });

    test("withTenant(A) cannot insert a row tagged for tenant B", async () => {
      // WITH CHECK on the users policy: tenant_id MUST equal app.tenant_id.
      // An insert into users with tenant_id = B from inside withTenant(A) is denied.
      const attempt = withTenant(tenantA, (tx) =>
        tx
          .insert(schema.users)
          .values({ tenantId: tenantB, email: "evil@example.com" }),
      );
      await expect(attempt).rejects.toThrow();
    });

    test("audit_log rows cannot be deleted (no DELETE policy → blocked)", async () => {
      await withTenant(tenantA, (tx) =>
        tx
          .insert(schema.auditLog)
          .values({ tenantId: tenantA, action: "test.event" }),
      );

      // No DELETE policy exists, so the row is invisible to DELETE statements.
      // Drizzle won't throw — it'll just affect 0 rows. Verify the row is still present.
      await withTenant(tenantA, (tx) =>
        tx.delete(schema.auditLog).where(sql`true`),
      );

      const rowsAfter = await withTenant(tenantA, (tx) =>
        tx.select().from(schema.auditLog),
      );
      expect(rowsAfter.length).toBe(1);
    });

    test("app.tenant_id is bound as a parameter (no SQL injection via tenantId)", async () => {
      // If withTenant() were doing string interpolation, this tenantId would break out.
      // With set_config(..., true) and a bound parameter, it's just a string value
      // that doesn't match any real tenant — so the next SELECT sees zero rows.
      const malicious = "'; DROP TABLE users; --";
      const rows = await withTenant(malicious, (tx) =>
        tx.select().from(schema.users),
      );
      expect(rows.length).toBe(0);

      // Sanity: users table still exists.
      const stillThere = await db.execute(
        sql`SELECT to_regclass('users') AS t`,
      );
      expect(stillThere[0]?.t).toBe("users");
    });
  },
);

describe.skipIf(DB_AVAILABLE)(
  "withTenant tests skipped (DATABASE_URL not set)",
  () => {
    test("set DATABASE_URL to run cross-tenant adversarial tests", () => {
      expect(true).toBe(true);
    });
  },
);
