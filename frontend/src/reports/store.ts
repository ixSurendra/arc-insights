/**
 * Reports store — Phase 1 in-memory Zustand store. Persistence wires
 * to the backend in P1-39 / P1-41 / P1-42; for now the surface authors
 * against this store so the composer + schedule + version UX is
 * exercisable end-to-end.
 */
import { create } from "zustand";
import type { Report, ReportBlock, Schedule } from "./types";

interface State {
  reports: Report[];
  upsertReport: (r: Report) => void;
  removeReport: (id: string) => void;
  updateBlocks: (id: string, blocks: ReportBlock[]) => void;
  setSchedule: (id: string, schedule: Schedule | undefined) => void;
  setShowAutoSummary: (id: string, on: boolean) => void;
  bumpVersion: (id: string) => void;
}

const today = new Date().toISOString();

const SEED: Report[] = [
  {
    id: "rpt-mbr-may",
    name: "Monthly business review · May 2026",
    description: "Q2 progress, regional movers, AI-written callouts.",
    folder: "Finance",
    template: "monthly-business-review",
    showAutoSummary: true,
    version: 3,
    updatedAt: today,
    ownerInitials: "AM",
    blocks: [
      {
        id: "blk-h1",
        type: "heading",
        level: 1,
        text: "Monthly business review — May 2026",
      },
      {
        id: "blk-p1",
        type: "paragraph",
        text: "May closed +14% on revenue with growth led by EU. Activations are steady and customer concentration ticked up by 1.8 pp. Spend is 12% under budget.",
      },
      {
        id: "blk-h2",
        type: "heading",
        level: 2,
        text: "Headline KPIs",
      },
      {
        id: "blk-w1",
        type: "widget",
        widgetId: "w-revenue-q2",
        widgetTitle: "Revenue · Q2 to date",
        widgetTypeId: "kpi-card",
        span: "half",
      },
      {
        id: "blk-w2",
        type: "widget",
        widgetId: "w-orders-q2",
        widgetTitle: "Orders · Q2 to date",
        widgetTypeId: "kpi-card",
        span: "half",
      },
      {
        id: "blk-callout-1",
        type: "callout",
        tone: "warn",
        text: "EU revenue dropped 11% week-over-week in W19 — flagged as anomaly on the Sales overview dashboard.",
      },
      {
        id: "blk-h3",
        type: "heading",
        level: 2,
        text: "Trends",
      },
      {
        id: "blk-w3",
        type: "widget",
        widgetId: "w-revenue-trend",
        widgetTitle: "Revenue and orders over time",
        widgetTypeId: "line",
        span: "full",
      },
      { id: "blk-div", type: "divider" },
      {
        id: "blk-h4",
        type: "heading",
        level: 2,
        text: "Notes",
      },
      {
        id: "blk-p2",
        type: "paragraph",
        text: "Pricing experiment in NA shipped on May 14; comparison report due in June.",
      },
    ],
    schedule: {
      enabled: true,
      cadence: "monthly",
      time: "08:00",
      dayOf: 1,
      recipients: ["aman@acme.com", "exec@acme.com"],
      format: "pdf+csv",
    },
  },
  {
    id: "rpt-weekly-19",
    name: "Weekly digest · W19",
    folder: "Growth",
    template: "weekly-digest",
    showAutoSummary: true,
    version: 12,
    updatedAt: today,
    ownerInitials: "PS",
    blocks: [
      {
        id: "wblk-h1",
        type: "heading",
        level: 1,
        text: "Weekly digest · W19",
      },
      {
        id: "wblk-p1",
        type: "paragraph",
        text: "Three highlights and one anomaly this week.",
      },
    ],
    schedule: {
      enabled: true,
      cadence: "weekly",
      time: "07:30",
      dayOf: 1,
      recipients: ["growth@acme.com"],
      format: "pdf",
    },
  },
];

export const useReports = create<State>((set) => ({
  reports: SEED,
  upsertReport: (r) =>
    set((s) => {
      const exists = s.reports.some((x) => x.id === r.id);
      return {
        reports: exists
          ? s.reports.map((x) => (x.id === r.id ? r : x))
          : [r, ...s.reports],
      };
    }),
  removeReport: (id) =>
    set((s) => ({ reports: s.reports.filter((r) => r.id !== id) })),
  updateBlocks: (id, blocks) =>
    set((s) => ({
      reports: s.reports.map((r) =>
        r.id === id ? { ...r, blocks, updatedAt: new Date().toISOString() } : r,
      ),
    })),
  setSchedule: (id, schedule) =>
    set((s) => ({
      reports: s.reports.map((r) => (r.id === id ? { ...r, schedule } : r)),
    })),
  setShowAutoSummary: (id, on) =>
    set((s) => ({
      reports: s.reports.map((r) =>
        r.id === id ? { ...r, showAutoSummary: on } : r,
      ),
    })),
  bumpVersion: (id) =>
    set((s) => ({
      reports: s.reports.map((r) =>
        r.id === id ? { ...r, version: r.version + 1 } : r,
      ),
    })),
}));

/**
 * Available widgets the composer can drop into the document. Phase 1
 * pulls from this static list; once the widget library has real
 * persistence the composer reads the same store.
 */
export const AVAILABLE_WIDGETS: Array<{
  id: string;
  title: string;
  typeId: string;
}> = [
  { id: "w-revenue-q2", title: "Revenue · Q2 to date", typeId: "kpi-card" },
  { id: "w-orders-q2", title: "Orders · Q2 to date", typeId: "kpi-card" },
  { id: "w-aov", title: "Average order value", typeId: "kpi-card" },
  { id: "w-customers", title: "Active customers", typeId: "kpi-card" },
  {
    id: "w-revenue-trend",
    title: "Revenue and orders over time",
    typeId: "line",
  },
  {
    id: "w-categories-bar",
    title: "Revenue by product category",
    typeId: "bar",
  },
  { id: "w-categories-donut", title: "Orders by category", typeId: "donut" },
  { id: "w-events-table", title: "Events by quarter", typeId: "table" },
  {
    id: "w-revenue-by-region",
    title: "Revenue by region",
    typeId: "choropleth",
  },
];
