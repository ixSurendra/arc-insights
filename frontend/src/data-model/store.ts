/**
 * Data Model store — Phase 1 in-memory Zustand store. Real backend
 * persistence (Drizzle migration + REST routes) lands with P1-21..P1-25.
 *
 * The mock data below approximates what auto-detect would produce on
 * the standard onboarding sample (the "warehouse·prod" Postgres mock
 * used in the connect-data wizard). The Data Model surface authors
 * against this store so the UX is exercisable end-to-end.
 */
import { create } from "zustand";
import type {
  AccessPolicy,
  DataModel,
  JoinDefinition,
  MetricDefinition,
  ModelColumn,
  ModelTable,
} from "./types";

interface State {
  model: DataModel;
  // Tables
  setTableFriendlyName: (id: string, friendly: string) => void;
  setColumn: (tableId: string, column: ModelColumn) => void;
  toggleColumnHidden: (tableId: string, columnName: string) => void;
  // Metrics
  upsertMetric: (m: MetricDefinition) => void;
  removeMetric: (id: string) => void;
  // Policies
  upsertPolicy: (p: AccessPolicy) => void;
  removePolicy: (id: string) => void;
  togglePolicyEnabled: (id: string) => void;
  // Joins
  upsertJoin: (j: JoinDefinition) => void;
  removeJoin: (id: string) => void;
  // Workflow
  confirmReview: () => void;
  // JWT claims
  setJwtClaims: (claims: string[]) => void;
}

const SEED_TABLES: ModelTable[] = [
  {
    id: "public.orders",
    schema: "public",
    name: "orders",
    friendlyName: "Orders",
    rowCount: 248_142,
    description: "Fact table — one row per completed checkout.",
    columns: [
      {
        name: "id",
        friendlyName: "Order ID",
        fieldType: "integer",
        hidden: false,
      },
      {
        name: "customer_id",
        friendlyName: "Customer",
        fieldType: "integer",
        hidden: false,
        fkTo: { table: "public.customers", labelColumn: "name" },
      },
      {
        name: "amount",
        friendlyName: "Amount",
        fieldType: "currency",
        hidden: false,
      },
      {
        name: "status",
        friendlyName: "Status",
        fieldType: "category",
        hidden: false,
      },
      {
        name: "country",
        friendlyName: "Country",
        fieldType: "category",
        hidden: false,
      },
      {
        name: "created_at",
        friendlyName: "Created at",
        fieldType: "datetime",
        hidden: false,
      },
    ],
  },
  {
    id: "public.customers",
    schema: "public",
    name: "customers",
    friendlyName: "Customers",
    rowCount: 18_503,
    columns: [
      {
        name: "id",
        friendlyName: "Customer ID",
        fieldType: "integer",
        hidden: false,
      },
      {
        name: "name",
        friendlyName: "Name",
        fieldType: "string",
        hidden: false,
      },
      {
        name: "email",
        friendlyName: "Email",
        fieldType: "email",
        hidden: false,
      },
      {
        name: "country",
        friendlyName: "Country",
        fieldType: "category",
        hidden: false,
      },
      {
        name: "signed_up_at",
        friendlyName: "Signed up at",
        fieldType: "datetime",
        hidden: false,
      },
    ],
  },
];

const SEED_METRICS: MetricDefinition[] = [
  {
    id: "metric-revenue",
    name: "Revenue",
    description: "Sum of amount for completed orders.",
    kind: "sum",
    table: "public.orders",
    column: "amount",
    fieldType: "currency",
    usageCount: 7,
  },
  {
    id: "metric-active-customers",
    name: "Active customers",
    description:
      "Unique customers with at least one order in the last 90 days.",
    kind: "count_distinct",
    table: "public.orders",
    column: "customer_id",
    fieldType: "integer",
    usageCount: 4,
  },
  {
    id: "metric-aov",
    name: "Average order value",
    description: "Revenue divided by order count.",
    kind: "ratio",
    numerator: { table: "public.orders", column: "amount", agg: "sum" },
    denominator: { table: "public.orders", column: "id", agg: "count" },
    fieldType: "currency",
    usageCount: 3,
  },
];

const SEED_POLICIES: AccessPolicy[] = [
  {
    id: "policy-customer-isolation",
    table: "public.orders",
    description:
      "Embedded viewers only see orders for their own customer_id, set by the host app's JWT.",
    rules: [{ column: "customer_id", op: "=", claim: "customer_id" }],
    enabled: true,
  },
];

const SEED_JOINS: JoinDefinition[] = [
  {
    id: "join-orders-customers",
    from: "public.orders",
    to: "public.customers",
    on: [{ fromColumn: "customer_id", toColumn: "id" }],
    joinType: "left",
  },
];

const SEED: DataModel = {
  tables: SEED_TABLES,
  metrics: SEED_METRICS,
  policies: SEED_POLICIES,
  joins: SEED_JOINS,
  jwtClaims: ["customer_id", "plan_tier", "region"],
  pendingReview: true,
};

export const useDataModel = create<State>((set) => ({
  model: SEED,
  setTableFriendlyName: (id, friendly) =>
    set((s) => ({
      model: {
        ...s.model,
        tables: s.model.tables.map((t) =>
          t.id === id ? { ...t, friendlyName: friendly } : t,
        ),
      },
    })),
  setColumn: (tableId, column) =>
    set((s) => ({
      model: {
        ...s.model,
        tables: s.model.tables.map((t) =>
          t.id === tableId
            ? {
                ...t,
                columns: t.columns.map((c) =>
                  c.name === column.name ? column : c,
                ),
              }
            : t,
        ),
      },
    })),
  toggleColumnHidden: (tableId, columnName) =>
    set((s) => ({
      model: {
        ...s.model,
        tables: s.model.tables.map((t) =>
          t.id === tableId
            ? {
                ...t,
                columns: t.columns.map((c) =>
                  c.name === columnName ? { ...c, hidden: !c.hidden } : c,
                ),
              }
            : t,
        ),
      },
    })),
  upsertMetric: (m) =>
    set((s) => {
      const exists = s.model.metrics.some((x) => x.id === m.id);
      return {
        model: {
          ...s.model,
          metrics: exists
            ? s.model.metrics.map((x) => (x.id === m.id ? m : x))
            : [...s.model.metrics, m],
        },
      };
    }),
  removeMetric: (id) =>
    set((s) => ({
      model: {
        ...s.model,
        metrics: s.model.metrics.filter((m) => m.id !== id),
      },
    })),
  upsertPolicy: (p) =>
    set((s) => {
      const exists = s.model.policies.some((x) => x.id === p.id);
      return {
        model: {
          ...s.model,
          policies: exists
            ? s.model.policies.map((x) => (x.id === p.id ? p : x))
            : [...s.model.policies, p],
        },
      };
    }),
  removePolicy: (id) =>
    set((s) => ({
      model: {
        ...s.model,
        policies: s.model.policies.filter((p) => p.id !== id),
      },
    })),
  togglePolicyEnabled: (id) =>
    set((s) => ({
      model: {
        ...s.model,
        policies: s.model.policies.map((p) =>
          p.id === id ? { ...p, enabled: !p.enabled } : p,
        ),
      },
    })),
  upsertJoin: (j) =>
    set((s) => {
      const exists = s.model.joins.some((x) => x.id === j.id);
      return {
        model: {
          ...s.model,
          joins: exists
            ? s.model.joins.map((x) => (x.id === j.id ? j : x))
            : [...s.model.joins, j],
        },
      };
    }),
  removeJoin: (id) =>
    set((s) => ({
      model: { ...s.model, joins: s.model.joins.filter((j) => j.id !== id) },
    })),
  confirmReview: () =>
    set((s) => ({ model: { ...s.model, pendingReview: false } })),
  setJwtClaims: (claims) =>
    set((s) => ({ model: { ...s.model, jwtClaims: claims } })),
}));
