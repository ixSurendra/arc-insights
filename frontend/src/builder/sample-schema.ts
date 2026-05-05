/**
 * Sample schema + rows used by the visual builder before P1-01b wires
 * up real data sources. Lets users exercise the builder UX end-to-end
 * with a fixed, predictable dataset.
 */
import type { SchemaTable } from "./types";

export const SAMPLE_TABLES: SchemaTable[] = [
  {
    schema: "public",
    name: "orders",
    columns: [
      { name: "id", dataType: "uuid", inferredKind: "string", nullable: false },
      {
        name: "tenant_id",
        dataType: "uuid",
        inferredKind: "string",
        nullable: false,
      },
      {
        name: "region",
        dataType: "text",
        inferredKind: "string",
        nullable: false,
      },
      {
        name: "amount",
        dataType: "integer",
        inferredKind: "number",
        nullable: false,
      },
      {
        name: "status",
        dataType: "text",
        inferredKind: "string",
        nullable: false,
      },
      {
        name: "ts",
        dataType: "timestamptz",
        inferredKind: "datetime",
        nullable: false,
      },
    ],
  },
  {
    schema: "public",
    name: "users",
    columns: [
      { name: "id", dataType: "uuid", inferredKind: "string", nullable: false },
      {
        name: "tenant_id",
        dataType: "uuid",
        inferredKind: "string",
        nullable: false,
      },
      {
        name: "email",
        dataType: "varchar",
        inferredKind: "string",
        nullable: false,
      },
      {
        name: "is_active",
        dataType: "boolean",
        inferredKind: "boolean",
        nullable: false,
      },
      {
        name: "created_at",
        dataType: "timestamptz",
        inferredKind: "datetime",
        nullable: false,
      },
    ],
  },
];

/** Fixed sample rows used to render the live preview. */
export const SAMPLE_ROWS: Record<string, Array<Record<string, unknown>>> = {
  "public.orders": [
    {
      region: "EU",
      amount: 12000,
      status: "completed",
      ts: "2026-01-15T10:00:00Z",
    },
    {
      region: "EU",
      amount: 15000,
      status: "completed",
      ts: "2026-02-15T10:00:00Z",
    },
    {
      region: "EU",
      amount: 17500,
      status: "completed",
      ts: "2026-03-15T10:00:00Z",
    },
    {
      region: "US",
      amount: 18000,
      status: "completed",
      ts: "2026-01-15T10:00:00Z",
    },
    {
      region: "US",
      amount: 22000,
      status: "completed",
      ts: "2026-02-15T10:00:00Z",
    },
    {
      region: "US",
      amount: 24000,
      status: "completed",
      ts: "2026-03-15T10:00:00Z",
    },
    {
      region: "APAC",
      amount: 9000,
      status: "completed",
      ts: "2026-02-15T10:00:00Z",
    },
    {
      region: "APAC",
      amount: 11000,
      status: "completed",
      ts: "2026-03-15T10:00:00Z",
    },
    {
      region: "EU",
      amount: 800,
      status: "cancelled",
      ts: "2026-02-15T10:00:00Z",
    },
  ],
  "public.users": [
    {
      email: "alice@example.com",
      is_active: true,
      created_at: "2026-01-05",
    },
    { email: "bob@example.com", is_active: true, created_at: "2026-02-12" },
    {
      email: "carol@example.com",
      is_active: false,
      created_at: "2026-03-22",
    },
  ],
};
