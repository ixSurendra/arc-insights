/**
 * Notebook model — Hex-inspired. A notebook is a vertically-stacked list
 * of cells. Each cell has a type (text · sql · chart · big_number),
 * optional title, and a body specific to its kind.
 *
 * The dashboard-as-grid pattern is gone. Cells flow top-to-bottom; the
 * canvas is a long scrolling document. Width is bounded for readability,
 * not by a 12-column grid.
 */
import type { ChartConfig, ChartData } from "../charts/types";
import type { QuerySpec } from "../builder/types";

export type CellType = "text" | "sql" | "chart" | "big_number";

interface BaseCell {
  id: string;
  /** Kept hidden by default; only shown when collapsed. */
  title?: string;
  /** "running" | "ok" | "error" | "stale". */
  status?: "running" | "ok" | "error" | "stale";
  /** Mock cost — drives the per-cell $ chip. */
  cost?: number;
  /** ISO-ish "2s ago", "12s ago" — drives the cell footer. */
  refreshedLabel?: string;
  /** Source label for the cell footer ("warehouse·prod"). */
  source?: string;
}

export interface TextCell extends BaseCell {
  type: "text";
  /** Markdown body. We render a hand-rolled subset (h1/h2/p/strong/em). */
  body: string;
}

export interface SqlCell extends BaseCell {
  type: "sql";
  sql: string;
  /** Sample result rows displayed below the editor. */
  resultRows?: Array<Record<string, unknown>>;
}

export interface ChartCell extends BaseCell {
  type: "chart";
  /** Optional spec — for now charts are configured directly. */
  spec?: QuerySpec;
  config: ChartConfig;
  data: ChartData;
}

export interface BigNumberCell extends BaseCell {
  type: "big_number";
  label: string;
  value: string;
  delta?: string;
  deltaDirection?: "up" | "down" | "flat";
  deltaSuffix?: string;
  sparkline?: number[];
  subStats?: Array<{ label: string; value: string }>;
}

export type NotebookCell = TextCell | SqlCell | ChartCell | BigNumberCell;

export interface Notebook {
  id: string;
  title: string;
  description?: string;
  /** Owner / shared / etc. — display only for now. */
  author: string;
  cells: NotebookCell[];
}
