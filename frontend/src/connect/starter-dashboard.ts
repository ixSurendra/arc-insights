/**
 * Starter dashboard generator (X-rays pattern).
 *
 * Reads a scanned schema and proposes 4–6 widgets that exercise the
 * obvious shapes: a row count, a time-series of a numeric measure on
 * a date axis, a top-N bar chart on a categorical column, a parts-of-
 * whole pie if there's a low-cardinality category, a choropleth if a
 * geographic column exists.
 *
 * Phase 1 returns metadata only — actual widget records and queries
 * land when the widget builder + persistence wire in.
 */
import type { ScannedTable } from "./SchemaScan";

export interface StarterWidget {
  id: string;
  title: string;
  widgetTypeId:
    | "big-number"
    | "kpi-card"
    | "line"
    | "column"
    | "bar"
    | "pie"
    | "donut"
    | "choropleth"
    | "table";
  span: { cols: 1 | 2 | 3 | 4; rows: 1 | 2 };
  /** Plain-English source description, shown on the tile. */
  source: string;
}

export function generateStarterDashboard(
  tables: ScannedTable[],
): StarterWidget[] {
  if (tables.length === 0) return [];
  const widgets: StarterWidget[] = [];
  const main = tables[0]!;

  // 1. Row count — always useful.
  widgets.push({
    id: `${main.name}-rows`,
    title: `${prettify(main.name)} · row count`,
    widgetTypeId: "big-number",
    span: { cols: 1, rows: 1 },
    source: `count(*) from ${main.name}`,
  });

  // 2. Numeric KPI if any numeric column exists.
  const numCol = main.columns.find(
    (c) => c.type === "integer" || c.type === "float",
  );
  if (numCol) {
    widgets.push({
      id: `${main.name}-${numCol.name}-sum`,
      title: `Total ${prettify(numCol.name)}`,
      widgetTypeId: "kpi-card",
      span: { cols: 1, rows: 1 },
      source: `sum(${numCol.name}) from ${main.name}`,
    });
  }

  // 3. Time series if a date + numeric column.
  const dateCol = main.columns.find(
    (c) => c.type === "date" || c.type === "datetime",
  );
  if (dateCol && numCol) {
    widgets.push({
      id: `${main.name}-${numCol.name}-trend`,
      title: `${prettify(numCol.name)} over time`,
      widgetTypeId: "line",
      span: { cols: 2, rows: 2 },
      source: `${main.name}: ${numCol.name} grouped by ${dateCol.name}`,
    });
  }

  // 4. Top-N categorical breakdown.
  const catCol = main.columns.find(
    (c) => c.type === "string" && !isGeographic(c.name),
  );
  if (catCol && numCol) {
    widgets.push({
      id: `${main.name}-${catCol.name}-top`,
      title: `${prettify(numCol.name)} by ${prettify(catCol.name)}`,
      widgetTypeId: "bar",
      span: { cols: 2, rows: 2 },
      source: `${main.name}: ${numCol.name} grouped by ${catCol.name}`,
    });
  }

  // 5. Parts of whole — donut on a low-cardinality string.
  if (catCol) {
    widgets.push({
      id: `${main.name}-${catCol.name}-share`,
      title: `Share of ${prettify(catCol.name)}`,
      widgetTypeId: "donut",
      span: { cols: 2, rows: 2 },
      source: `${main.name}: count grouped by ${catCol.name}`,
    });
  }

  // 6. Choropleth if a geographic column exists.
  const geoCol = main.columns.find((c) => isGeographic(c.name));
  if (geoCol && numCol) {
    widgets.push({
      id: `${main.name}-${geoCol.name}-map`,
      title: `${prettify(numCol.name)} by ${prettify(geoCol.name)}`,
      widgetTypeId: "choropleth",
      span: { cols: 2, rows: 2 },
      source: `${main.name}: ${numCol.name} grouped by ${geoCol.name}`,
    });
  }

  return widgets;
}

function prettify(snake: string): string {
  return snake.replace(/[_-]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function isGeographic(name: string): boolean {
  return /country|region|state|city|province|territory/i.test(name);
}
