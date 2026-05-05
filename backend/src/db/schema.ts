/**
 * Arc Insights — metadata DB schema (Drizzle).
 *
 * EVERY domain table MUST include `tenant_id` as a NOT NULL UUID.
 * EVERY query goes through the tenant-aware helper in `db/index.ts`.
 * See `docs/adr/0003-multi-tenancy-model.md` for the binding rules.
 */
import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── Tenants ──────────────────────────────────────────────────────
// One row per customer organization. The root of the tenancy tree.
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Users ────────────────────────────────────────────────────────
// Every user belongs to exactly one tenant. RLS enforces isolation.
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    email: varchar("email", { length: 255 }).notNull(),
    name: text("name"),
    passwordHash: text("password_hash"), // null for SSO-only users
    role: varchar("role", { length: 32 }).notNull().default("viewer"), // admin | editor | viewer
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantIdIdx: index("users_tenant_id_idx").on(table.tenantId),
    emailTenantUnique: uniqueIndex("users_email_tenant_unique").on(
      table.tenantId,
      table.email,
    ),
  }),
);

// ─── Audit log ────────────────────────────────────────────────────
// Append-only. Deletes blocked by RLS at the DB level (configured in migration).
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 64 }).notNull(), // e.g. "dashboard.create"
    resourceType: varchar("resource_type", { length: 64 }),
    resourceId: text("resource_id"),
    metadata: text("metadata"), // JSON-as-text for flexibility
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantCreatedIdx: index("audit_tenant_created_idx").on(
      table.tenantId,
      table.createdAt,
    ),
  }),
);

// ─── Type exports ─────────────────────────────────────────────────
// Use these throughout the app for type safety.
export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;
