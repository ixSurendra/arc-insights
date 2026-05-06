/**
 * Reports types — Phase 1 frontend mirror of the flowing-document
 * shape locked in UX-SPEC §7. Persistence (Drizzle migration + REST
 * routes) lands with P1-39+; the in-memory shape below matches the
 * API contract those tasks will expose.
 */

export type ReportBlockType =
  | "heading"
  | "paragraph"
  | "widget"
  | "callout"
  | "divider"
  | "image";

export interface BlockBase {
  id: string;
  type: ReportBlockType;
}

export interface HeadingBlock extends BlockBase {
  type: "heading";
  level: 1 | 2 | 3;
  text: string;
}

export interface ParagraphBlock extends BlockBase {
  type: "paragraph";
  /** Plain text in Phase 1; Markdown rendering lands later. */
  text: string;
}

export interface WidgetBlock extends BlockBase {
  type: "widget";
  /** Saved widget id from the widget library. */
  widgetId: string;
  widgetTitle: string;
  widgetTypeId: string;
  /** Width inside the report — full or half. */
  span: "full" | "half";
}

export interface CalloutBlock extends BlockBase {
  type: "callout";
  tone: "info" | "warn" | "success" | "danger";
  text: string;
}

export interface DividerBlock extends BlockBase {
  type: "divider";
}

export interface ImageBlock extends BlockBase {
  type: "image";
  url: string;
  caption?: string;
}

export type ReportBlock =
  | HeadingBlock
  | ParagraphBlock
  | WidgetBlock
  | CalloutBlock
  | DividerBlock
  | ImageBlock;

export type Cadence = "daily" | "weekly" | "monthly" | "quarterly";

export interface Schedule {
  enabled: boolean;
  cadence: Cadence;
  /** Time of day in HH:MM format (24h, tenant TZ). */
  time: string;
  /** Day-of-week (0-6) for weekly; day-of-month (1-28) for monthly. */
  dayOf?: number;
  recipients: string[];
  /** PDF + CSV attachment or PDF only. */
  format: "pdf" | "pdf+csv";
}

export interface Report {
  id: string;
  name: string;
  description?: string;
  folder?: string;
  /** "Monthly business review" / "Weekly digest" / "Quarterly board pack" / null when blank. */
  template?: string;
  /** Whether the AI auto-summary at the top is shown. */
  showAutoSummary: boolean;
  blocks: ReportBlock[];
  schedule?: Schedule;
  /** Update count to drive a fake "v3" badge. UI-only. */
  version: number;
  updatedAt: string;
  ownerInitials: string;
}
