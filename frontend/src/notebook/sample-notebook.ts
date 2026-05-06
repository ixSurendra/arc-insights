import type { Notebook } from "./types";

/**
 * Sample notebook used as the default content of the Sales overview page.
 * Mixes Markdown intros with SQL, chart, and big-number cells — the Hex
 * pattern of "data document" rather than "dashboard with widgets".
 */
export const SAMPLE_NOTEBOOK: Notebook = {
  id: "sales-overview",
  title: "Sales overview",
  description:
    "How NA, EU and APAC revenue moved through Q2. Click any cell to inspect the upstream query.",
  author: "Aman M.",
  cells: [
    {
      id: "intro",
      type: "text",
      body: "# Q2 in one paragraph\n\nNorth America carried Q2 — **+18% MoM** vs prior quarter — while EU stayed flat and APAC ticked up on the back of two enterprise deals. The numbers below are pulled from `warehouse·prod` and refreshed every minute. Use the global filter at the top of the page to scope every cell.",
    },
    {
      id: "headline-revenue",
      type: "big_number",
      label: "Total revenue · Q2",
      value: "$405k",
      delta: "+14.2%",
      deltaDirection: "up",
      deltaSuffix: "vs prior period",
      sparkline: [120, 135, 148, 162, 178, 195, 215, 240],
      subStats: [
        { label: "Avg / month", value: "$67.5k" },
        { label: "Best month", value: "$84.2k" },
        { label: "Forecast Q3", value: "$1.42M" },
      ],
      cost: 0.001,
      refreshedLabel: "Refreshed 12s ago",
      source: "warehouse·prod",
      status: "ok",
    },
    {
      id: "monthly-query",
      type: "sql",
      title: "Monthly revenue by region",
      sql: `SELECT
  date_trunc('month', ts) AS month,
  region,
  SUM(amount) AS revenue
FROM warehouse.orders
WHERE status = 'completed'
  AND ts >= NOW() - INTERVAL '6 months'
GROUP BY 1, 2
ORDER BY 1, 2;`,
      resultRows: [
        { month: "2026-01", region: "NA", revenue: 18000 },
        { month: "2026-01", region: "EU", revenue: 12000 },
        { month: "2026-02", region: "NA", revenue: 22000 },
        { month: "2026-02", region: "EU", revenue: 15000 },
        { month: "2026-03", region: "NA", revenue: 24000 },
        { month: "2026-03", region: "EU", revenue: 17500 },
      ],
      cost: 0.004,
      refreshedLabel: "Refreshed 12s ago",
      source: "warehouse·prod",
      status: "ok",
    },
    {
      id: "monthly-chart",
      type: "chart",
      title: "Revenue by month",
      config: {
        type: "line",
        xAxis: "month",
        yAxes: ["NA", "EU", "APAC"],
        area: true,
        valueFormat: "currency",
        currency: "USD",
      },
      data: {
        rows: [
          { month: "Jan", NA: 18000, EU: 12000, APAC: 6000 },
          { month: "Feb", NA: 22000, EU: 15000, APAC: 7500 },
          { month: "Mar", NA: 24000, EU: 17500, APAC: 9000 },
          { month: "Apr", NA: 27000, EU: 16000, APAC: 9500 },
          { month: "May", NA: 30000, EU: 21000, APAC: 11000 },
          { month: "Jun", NA: 35000, EU: 24000, APAC: 13000 },
        ],
      },
      cost: 0.004,
      refreshedLabel: "Refreshed 12s ago",
      source: "warehouse·prod",
      status: "ok",
    },
    {
      id: "regional-narrative",
      type: "text",
      body: "## Regional split\n\nThe story hides in the regional breakdown. NA and EU are growth at scale; APAC is *expansion-in-progress* — a smaller base but the steepest curve. Plan Q3 spend accordingly.",
    },
    {
      id: "share-chart",
      type: "chart",
      title: "Share by region",
      config: {
        type: "pie",
        category: "region",
        value: "revenue",
        variant: "donut",
      },
      data: {
        rows: [
          { region: "North America", revenue: 184000 },
          { region: "Europe", revenue: 122000 },
          { region: "APAC", revenue: 56000 },
        ],
      },
      cost: 0.003,
      refreshedLabel: "Refreshed 12s ago",
      source: "warehouse·prod",
      status: "ok",
    },
    {
      id: "regional-bar",
      type: "chart",
      title: "Revenue by region (last 6 months)",
      config: {
        type: "bar",
        xAxis: "region",
        yAxes: ["revenue"],
        orientation: "horizontal",
        valueFormat: "currency",
        currency: "USD",
        showValueLabels: true,
      },
      data: {
        rows: [
          { region: "North America", revenue: 184000 },
          { region: "Europe", revenue: 122000 },
          { region: "APAC", revenue: 56000 },
        ],
      },
      cost: 0.003,
      refreshedLabel: "Refreshed 12s ago",
      source: "warehouse·prod",
      status: "ok",
    },
  ],
};
