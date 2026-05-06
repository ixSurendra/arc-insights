/**
 * Smart-fill mapper — heuristic resolution of template field roles
 * against the tenant's Data Model.
 *
 * Strategy:
 *   1. Pick the largest-row table as the "primary" anchor (closest
 *      thing to a fact table without a real model annotation).
 *   2. For each role, score every column on that table:
 *        +5  exact name match in `preferredNames`
 *        +3  partial name match (substring)
 *        +2  field type matches `acceptedTypes`
 *        +1  field kind matches role kind (numeric vs categorical)
 *        −2  column is hidden in the data model
 *   3. Highest-scoring column wins; ties prefer the lower position
 *      (typically more "primary" columns are declared first).
 *   4. Required roles with score 0 land in `unresolved`. Optional
 *      roles silently bind to null and the dependent widgets drop.
 *
 * Phase 2 can layer an LLM call on top — pass the model the schema
 * and the role descriptions and let it propose mappings the heuristic
 * misses. The contract here stays the same.
 */

import type { ModelColumn, ModelTable } from "../data-model/types";
import type {
  DashboardTemplate,
  MappingSuggestion,
  RoleMapping,
  SmartFillContext,
  TemplateFieldRole,
} from "./types";

const NUMERIC_TYPES = new Set(["integer", "float", "currency", "percent"]);
const CATEGORICAL_TYPES = new Set(["string", "category"]);
const TIME_TYPES = new Set(["date", "datetime"]);

const GEO_NAME_RE =
  /country|region|state|city|province|territory|zip|postcode/i;

export function suggestMapping(
  template: DashboardTemplate,
  ctx: SmartFillContext,
): MappingSuggestion {
  const tables = ctx.tables;
  if (tables.length === 0) {
    return {
      mapping: { primaryTable: "", bindings: {} },
      reasoning: {},
      unresolved: template.fieldRoles
        .filter((r) => !r.optional)
        .map((r) => r.id),
    };
  }

  const primary = pickPrimaryTable(tables);
  const bindings: RoleMapping["bindings"] = {};
  const reasoning: Record<string, string> = {};
  const unresolved: string[] = [];

  for (const role of template.fieldRoles) {
    const best = scoreColumns(role, primary);
    if (!best) {
      bindings[role.id] = null;
      reasoning[role.id] = role.optional
        ? "No good match — widget will be skipped."
        : "No matching column. Tenant must pick one before generating.";
      if (!role.optional) unresolved.push(role.id);
      continue;
    }
    bindings[role.id] = { tableId: primary.id, columnName: best.col.name };
    reasoning[role.id] = best.why;
  }

  return {
    mapping: { primaryTable: primary.id, bindings },
    reasoning,
    unresolved,
  };
}

/** Pick the table most likely to be the fact table for the dashboard. */
function pickPrimaryTable(tables: ModelTable[]): ModelTable {
  return [...tables].sort((a, b) => (b.rowCount ?? 0) - (a.rowCount ?? 0))[0]!;
}

interface Score {
  col: ModelColumn;
  score: number;
  why: string;
}

function scoreColumns(
  role: TemplateFieldRole,
  table: ModelTable,
): Score | null {
  let best: Score | null = null;
  for (const col of table.columns) {
    if (col.hidden) continue;
    const s = scoreColumn(role, col);
    if (s.score <= 0) continue;
    if (!best || s.score > best.score) best = s;
  }
  return best;
}

function scoreColumn(role: TemplateFieldRole, col: ModelColumn): Score {
  let score = 0;
  const reasons: string[] = [];

  // Name preferences
  if (role.preferredNames?.includes(col.name)) {
    score += 5;
    reasons.push(`column \`${col.name}\` is in the preferred-name list`);
  } else if (role.preferredNames?.some((n) => col.name.includes(n))) {
    score += 3;
    reasons.push(`column \`${col.name}\` partially matches a preferred name`);
  }

  // Field type acceptance
  if (role.acceptedTypes?.includes(col.fieldType)) {
    score += 2;
    reasons.push(`type \`${col.fieldType}\` is accepted`);
  }

  // Kind heuristics
  if (role.kind === "measure" && NUMERIC_TYPES.has(col.fieldType)) {
    score += 1;
  }
  if (role.kind === "dimension" && CATEGORICAL_TYPES.has(col.fieldType)) {
    score += 1;
  }
  if (role.kind === "time" && TIME_TYPES.has(col.fieldType)) {
    score += 1;
  }
  if (role.kind === "geo") {
    if (GEO_NAME_RE.test(col.name)) {
      score += 4;
      reasons.push(`column \`${col.name}\` looks geographic`);
    }
  }
  if (role.kind === "ratio_num" || role.kind === "ratio_den") {
    if (NUMERIC_TYPES.has(col.fieldType)) score += 1;
  }

  return {
    col,
    score,
    why: reasons.join("; ") || "fallback match",
  };
}

/** Eligible columns the tenant can switch to inside the dialog. */
export function eligibleColumns(
  role: TemplateFieldRole,
  table: ModelTable,
): ModelColumn[] {
  return table.columns.filter((c) => {
    if (c.hidden) return false;
    if (role.kind === "measure") return NUMERIC_TYPES.has(c.fieldType);
    if (role.kind === "dimension") return CATEGORICAL_TYPES.has(c.fieldType);
    if (role.kind === "time") return TIME_TYPES.has(c.fieldType);
    if (role.kind === "geo") return GEO_NAME_RE.test(c.name);
    if (role.kind === "ratio_num" || role.kind === "ratio_den")
      return NUMERIC_TYPES.has(c.fieldType);
    return true;
  });
}
