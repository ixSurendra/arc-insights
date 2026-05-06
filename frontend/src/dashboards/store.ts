/**
 * Dashboards store — Phase 1 in-memory Zustand store. Seeded with the
 * four mock dashboards that previously lived as constants on Home and
 * the Dashboards list page; the dashboard view reads from this store
 * by id. Smart-fill writes its synthesized output here too, so the
 * generated dashboard shows up everywhere a tenant looks.
 */
import { create } from "zustand";
import { persist, persistSlice } from "../lib/persist";
import type { DashboardRecord } from "./types";

interface State {
  dashboards: DashboardRecord[];
  upsert: (d: DashboardRecord) => void;
  remove: (id: string) => void;
  byId: (id: string) => DashboardRecord | undefined;
}

const today = new Date().toISOString();

const SEED: DashboardRecord[] = [
  {
    id: "sales-overview",
    title: "Sales overview",
    folder: "Finance",
    ownerInitials: "AM",
    status: "live",
    accent: "var(--color-primary)",
    updatedAt: today,
    headline: { label: "Q2 to date", value: "$405k", deltaDirection: "up" },
    spark: [120, 135, 148, 162, 178, 195, 215, 240],
    widgets: [
      {
        id: "kpi-revenue",
        title: "Revenue · Q2 to date",
        kind: "kpi-card",
        span: { cols: 1, rows: 1 },
        source: "sum(amount) from public.orders",
        agg: "sum",
        table: { id: "public.orders" },
        fields: { measure: "amount" },
      },
      {
        id: "kpi-orders",
        title: "Orders · Q2 to date",
        kind: "big-number",
        span: { cols: 1, rows: 1 },
        source: "count(*) from public.orders",
        agg: "count",
        table: { id: "public.orders" },
      },
      {
        id: "kpi-aov",
        title: "Average order value",
        kind: "kpi-card",
        span: { cols: 1, rows: 1 },
        source: "avg(amount) from public.orders",
        agg: "avg",
        table: { id: "public.orders" },
        fields: { measure: "amount" },
      },
      {
        id: "kpi-customers",
        title: "Active customers",
        kind: "big-number",
        span: { cols: 1, rows: 1 },
        source: "count(distinct customer_id) from public.orders",
        agg: "count_distinct",
        table: { id: "public.orders" },
        fields: { dimension: "customer_id" },
      },
      {
        id: "trend-revenue",
        title: "Revenue and orders over time",
        kind: "line",
        span: { cols: 2, rows: 2 },
        source: "amount + orders grouped by created_at",
        agg: "sum",
        table: { id: "public.orders" },
        fields: { measure: "amount", time: "created_at" },
      },
      {
        id: "donut-categories",
        title: "Total orders by product category",
        kind: "donut",
        span: { cols: 2, rows: 2 },
        source: "count(*) grouped by status",
        agg: "count",
        table: { id: "public.orders" },
        fields: { dimension: "status" },
      },
      {
        id: "bar-categories",
        title: "Revenue by status",
        kind: "bar",
        span: { cols: 2, rows: 2 },
        source: "sum(amount) grouped by status",
        agg: "sum",
        table: { id: "public.orders" },
        fields: { measure: "amount", dimension: "status" },
      },
      {
        id: "table-events",
        title: "Recent rows",
        kind: "table",
        span: { cols: 2, rows: 2 },
        source: "public.orders order by created_at desc limit 100",
        table: { id: "public.orders" },
      },
    ],
  },
  {
    id: "growth-funnel",
    title: "Growth funnel · self-serve",
    folder: "Growth",
    ownerInitials: "PS",
    status: "live",
    accent: "var(--color-accent)",
    updatedAt: today,
    headline: { label: "Activations", value: "2,148", deltaDirection: "up" },
    spark: [90, 88, 102, 110, 118, 130, 142, 158],
    widgets: [],
  },
  {
    id: "infra-health",
    title: "Infra · p99 latency",
    folder: "Engineering",
    ownerInitials: "RK",
    status: "stale",
    accent: "var(--color-cell-chart)",
    updatedAt: today,
    headline: { label: "p99 (5m)", value: "838ms", deltaDirection: "down" },
    spark: [820, 815, 838, 842, 836, 830, 822, 818],
    widgets: [],
  },
  {
    id: "tenant-usage",
    title: "Tenant usage rollup",
    folder: "Embed",
    ownerInitials: "AM",
    status: "live",
    accent: "var(--color-success)",
    updatedAt: today,
    headline: { label: "Capacity used", value: "84%", deltaDirection: "up" },
    spark: [40, 55, 60, 75, 78, 82, 90, 96],
    widgets: [],
  },
];

export const useDashboards = create<State>()(
  persist(
    (set, get) => ({
      dashboards: SEED,
      upsert: (d) =>
        set((s) => {
          const exists = s.dashboards.some((x) => x.id === d.id);
          return {
            dashboards: exists
              ? s.dashboards.map((x) => (x.id === d.id ? d : x))
              : [d, ...s.dashboards],
          };
        }),
      remove: (id) =>
        set((s) => ({
          dashboards: s.dashboards.filter((x) => x.id !== id),
        })),
      byId: (id) => get().dashboards.find((d) => d.id === id),
    }),
    persistSlice<State>("dashboards", {
      // Functions don't survive JSON.stringify; persisting only data
      // keeps the storage payload small and the rehydration trivial.
      partialize: (state) =>
        ({ dashboards: state.dashboards }) as unknown as State,
    }),
  ),
);
