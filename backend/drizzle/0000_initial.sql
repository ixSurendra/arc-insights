-- Arc Insights — initial schema migration.
-- Tables match backend/src/db/schema.ts. RLS policies bind to app.tenant_id
-- (set via `SELECT set_config('app.tenant_id', $1, true)` inside withTenant()).
-- See docs/adr/0003-multi-tenancy-model.md for the binding rules.

-- ─── Extensions ─────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- gen_random_uuid()

-- ─── Tenants ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenants (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  slug        varchar(64) NOT NULL UNIQUE,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── Users ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id             uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid         NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  email          varchar(255) NOT NULL,
  name           text,
  password_hash  text,
  role           varchar(32)  NOT NULL DEFAULT 'viewer',
  is_active      boolean      NOT NULL DEFAULT true,
  last_login_at  timestamptz,
  created_at     timestamptz  NOT NULL DEFAULT now(),
  updated_at     timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS users_tenant_id_idx ON users(tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_tenant_unique ON users(tenant_id, email);

-- ─── Audit log (append-only) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid        NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  actor_user_id   uuid        REFERENCES users(id) ON DELETE SET NULL,
  action          varchar(64) NOT NULL,
  resource_type   varchar(64),
  resource_id     text,
  metadata        text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_tenant_created_idx ON audit_log(tenant_id, created_at);

-- ─── Application role (non-superuser) ──────────────────────────────
-- The connection user (arc) is the Postgres superuser, which bypasses RLS.
-- Application code drops to app_user inside withTenant() via SET LOCAL ROLE,
-- making the row-level policies actually load-bearing. NOLOGIN — app_user is
-- only reachable via SET ROLE from a privileged session, never directly.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user NOLOGIN;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON tenants, users, audit_log TO app_user;

-- ─── Row-Level Security ─────────────────────────────────────────────
-- Reads/writes filtered by app.tenant_id. The 'true' second argument to
-- current_setting makes it return NULL instead of erroring when unset —
-- a query without withTenant() will see zero rows, which is the desired
-- safe default rather than a hard error in unrelated code paths.

ALTER TABLE tenants   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants   FORCE  ROW LEVEL SECURITY;
ALTER TABLE users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE users     FORCE  ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log FORCE  ROW LEVEL SECURITY;

-- The tenants table is itself tenant-scoped: a tenant can only see its own row.
CREATE POLICY tenants_isolation ON tenants
  USING (id::text = current_setting('app.tenant_id', true))
  WITH CHECK (id::text = current_setting('app.tenant_id', true));

CREATE POLICY users_isolation ON users
  USING (tenant_id::text = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id::text = current_setting('app.tenant_id', true));

-- Audit log: SELECT and INSERT scoped by tenant. No UPDATE / DELETE policy
-- exists, so they are blocked by RLS for everyone — append-only by construction.
CREATE POLICY audit_log_select ON audit_log
  FOR SELECT
  USING (tenant_id::text = current_setting('app.tenant_id', true));

CREATE POLICY audit_log_insert ON audit_log
  FOR INSERT
  WITH CHECK (tenant_id::text = current_setting('app.tenant_id', true));
