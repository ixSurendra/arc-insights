import type { Dashboard } from "./types";

/**
 * Hand-built sample dashboard that demos every chart type the builder
 * can produce. Used until P1-10 persists user-saved dashboards.
 */
export const SAMPLE_DASHBOARD: Dashboard = {
  id: "sample",
  title: "Sales overview",
  description:
    "How EU and US revenue moved over the last quarter. Use the global filter above to scope every chart at once.",
  globalFilters: [{ column: "status", op: "=", value: "completed" }],
  charts: [
    {
      id: "revenue-by-month",
      title: "Revenue by month",
      spec: {
        from: { schema: "public", table: "orders" },
        dimensions: [
          { column: "ts", granularity: "month", alias: "month" },
          { column: "region" },
        ],
        measures: [{ column: "amount", agg: "sum" }],
        filters: [],
        orderBy: [{ column: "month", direction: "asc" }],
        limit: 1000,
      },
      config: {
        type: "line",
        xAxis: "month",
        yAxes: ["amount_sum"],
        area: true,
      },
      grid: { col: 0, row: 0, w: 8, h: 1 },
    },
    {
      id: "total-revenue",
      title: "Total revenue (sample period)",
      spec: {
        from: { schema: "public", table: "orders" },
        dimensions: [],
        measures: [{ column: "amount", agg: "sum" }],
        filters: [],
        orderBy: [],
        limit: 1,
      },
      config: {
        type: "big_number",
        value: "amount_sum",
        format: "currency",
        currency: "USD",
      },
      grid: { col: 8, row: 0, w: 4, h: 1 },
    },
    {
      id: "revenue-by-region",
      title: "Revenue by region",
      spec: {
        from: { schema: "public", table: "orders" },
        dimensions: [{ column: "region" }],
        measures: [{ column: "amount", agg: "sum" }],
        filters: [],
        orderBy: [{ column: "region", direction: "asc" }],
        limit: 100,
      },
      config: { type: "bar", xAxis: "region", yAxes: ["amount_sum"] },
      grid: { col: 0, row: 1, w: 6, h: 1 },
    },
    {
      id: "share-by-region",
      title: "Share by region",
      spec: {
        from: { schema: "public", table: "orders" },
        dimensions: [{ column: "region" }],
        measures: [{ column: "amount", agg: "sum" }],
        filters: [],
        orderBy: [],
        limit: 100,
      },
      config: {
        type: "pie",
        category: "region",
        value: "amount_sum",
        variant: "donut",
      },
      grid: { col: 6, row: 1, w: 6, h: 1 },
    },
  ],
};
