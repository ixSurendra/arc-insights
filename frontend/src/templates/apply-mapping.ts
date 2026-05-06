/**
 * Apply a confirmed role mapping to a template, producing a real
 * DashboardRecord that the dashboards store can persist and the
 * dashboard view can render.
 *
 * Widgets whose required role bindings are missing are dropped — the
 * dialog only ever generates after required roles resolved, but
 * optional roles can still be null and we want the result to be a
 * valid dashboard.
 */
import type {
  DashboardRecord,
  DashboardWidget,
  DashboardWidgetKind,
} from "../dashboards/types";
import { getTemplate } from "./dashboard-templates";
import type { RoleMapping, TemplateWidget } from "./types";

const ACCENTS = [
  "var(--color-primary)",
  "var(--color-accent)",
  "var(--color-success)",
  "var(--color-cell-chart)",
];

export function applyMapping(
  templateId: string,
  mapping: RoleMapping,
  options: {
    title?: string;
    folder?: string;
    ownerInitials?: string;
  } = {},
): DashboardRecord | null {
  const template = getTemplate(templateId);
  if (!template) return null;

  const id = `dash-${templateId}-${Date.now().toString(36)}`;
  const widgets: DashboardWidget[] = [];

  for (const t of template.widgets) {
    const w = realizeWidget(t, mapping, template);
    if (w) widgets.push(w);
  }

  if (widgets.length === 0) return null;

  return {
    id,
    title: options.title ?? template.title,
    folder: options.folder ?? template.folder,
    ownerInitials: options.ownerInitials ?? "AM",
    status: "live",
    accent: ACCENTS[Math.floor(Math.random() * ACCENTS.length)]!,
    updatedAt: new Date().toISOString(),
    generatedFromTemplate: templateId,
    widgets,
    headline: deriveHeadline(template, mapping),
  };
}

function realizeWidget(
  t: TemplateWidget,
  mapping: RoleMapping,
  template: {
    fieldRoles: Array<{ id: string; label: string; optional?: boolean }>;
  },
): DashboardWidget | null {
  // Resolve role bindings for this widget. Required roles missing → drop.
  const fields: DashboardWidget["fields"] = {};
  for (const [roleSlot, roleId] of Object.entries(t.roles)) {
    if (!roleId) continue;
    const binding = mapping.bindings[roleId];
    if (!binding) {
      const def = template.fieldRoles.find((r) => r.id === roleId);
      if (def?.optional) continue;
      return null; // required role unresolved — skip widget
    }
    (fields as Record<string, string>)[roleSlot] = binding.columnName;
  }

  const title = renderTitle(t.title, mapping, template);
  const tableId = mapping.primaryTable;

  return {
    id: t.id,
    title,
    kind: t.widgetType as DashboardWidgetKind,
    span: t.span,
    agg: t.agg,
    table: tableId ? { id: tableId } : undefined,
    fields,
    source: describeSource(t, fields, tableId),
  };
}

function renderTitle(
  template: string,
  mapping: RoleMapping,
  templateDef: { fieldRoles: Array<{ id: string; label: string }> },
): string {
  return template.replace(/\{(\w+)\}/g, (_match, roleId: string) => {
    const binding = mapping.bindings[roleId];
    if (binding) return prettify(binding.columnName);
    const role = templateDef.fieldRoles.find((r) => r.id === roleId);
    return role?.label.toLowerCase() ?? roleId;
  });
}

function describeSource(
  t: TemplateWidget,
  fields: NonNullable<DashboardWidget["fields"]>,
  tableId: string,
): string {
  const measure = fields.measure;
  const dim = fields.dimension;
  const time = fields.time;
  const geo = fields.geo;
  const agg = t.agg ?? "count";
  const head = measure
    ? `${agg}(${measure})`
    : agg === "count" && dim
      ? `count(distinct ${dim})`
      : "count(*)";
  const tail = time
    ? ` grouped by ${time}`
    : geo
      ? ` grouped by ${geo}`
      : dim && t.widgetType !== "big-number"
        ? ` grouped by ${dim}`
        : "";
  return `${head} from ${tableId}${tail}`;
}

function prettify(snake: string): string {
  return snake.replace(/[_-]+/g, " ");
}

function deriveHeadline(
  template: { fieldRoles: Array<{ id: string; label: string }> },
  mapping: RoleMapping,
): DashboardRecord["headline"] {
  const measureRole = template.fieldRoles.find((r) =>
    /measure|primary_measure|deal_value|spend|duration/.test(r.id),
  );
  if (!measureRole) return undefined;
  const binding = mapping.bindings[measureRole.id];
  if (!binding) return undefined;
  return {
    label: `Sum of ${prettify(binding.columnName)}`,
    value: "—",
    deltaDirection: "up",
  };
}
