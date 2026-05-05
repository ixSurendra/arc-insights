/**
 * Unit tests for the chart adapters. Pure functions, no DOM, no React.
 */
import { describe, expect, test } from "vitest";
import {
  toAgGridColumns,
  toBarOption,
  toBigNumber,
  toLineOption,
  toPieOption,
  toScatterOption,
} from "./adapters";

describe("toLineOption", () => {
  test("single-series line chart", () => {
    const opt = toLineOption(
      { type: "line", xAxis: "month", yAxes: ["revenue"] },
      {
        rows: [
          { month: "2026-01", revenue: 100 },
          { month: "2026-02", revenue: 150 },
        ],
      },
    );
    expect((opt["xAxis"] as { data: unknown[] }).data).toEqual([
      "2026-01",
      "2026-02",
    ]);
    const series = opt["series"] as Array<{ name: string; data: unknown[] }>;
    expect(series).toHaveLength(1);
    expect(series[0]!.name).toBe("revenue");
    expect(series[0]!.data).toEqual([100, 150]);
    // Single series → no legend.
    expect(opt["legend"]).toBeUndefined();
  });

  test("multi-series adds legend; non-numeric values become null", () => {
    const opt = toLineOption(
      { type: "line", xAxis: "month", yAxes: ["eu", "us"], area: true },
      {
        rows: [
          { month: "2026-01", eu: 10, us: 20 },
          { month: "2026-02", eu: "not-a-number", us: 25 },
        ],
      },
    );
    expect(opt["legend"]).toBeDefined();
    const series = opt["series"] as Array<{
      name: string;
      data: unknown[];
      areaStyle?: unknown;
    }>;
    expect(series[0]!.areaStyle).toBeDefined();
    expect(series[0]!.data).toEqual([10, null]);
    expect(series[1]!.data).toEqual([20, 25]);
  });
});

describe("toBarOption", () => {
  test("vertical bar (default) puts category on xAxis", () => {
    const opt = toBarOption(
      { type: "bar", xAxis: "region", yAxes: ["amount"] },
      {
        rows: [
          { region: "EU", amount: 100 },
          { region: "US", amount: 200 },
        ],
      },
    );
    expect((opt["xAxis"] as { type: string }).type).toBe("category");
    expect((opt["yAxis"] as { type: string }).type).toBe("value");
  });

  test("horizontal flips the axes", () => {
    const opt = toBarOption(
      {
        type: "bar",
        xAxis: "region",
        yAxes: ["amount"],
        orientation: "horizontal",
      },
      { rows: [{ region: "EU", amount: 100 }] },
    );
    expect((opt["xAxis"] as { type: string }).type).toBe("value");
    expect((opt["yAxis"] as { type: string }).type).toBe("category");
  });
});

describe("toPieOption", () => {
  test("standard pie uses single radius; donut uses inner+outer", () => {
    const data = {
      rows: [
        { region: "EU", total: 100 },
        { region: "US", total: 200 },
      ],
    };
    const pie = toPieOption(
      { type: "pie", category: "region", value: "total" },
      data,
    );
    expect((pie["series"] as Array<{ radius: unknown }>)[0]!.radius).toBe(
      "70%",
    );
    const donut = toPieOption(
      { type: "pie", category: "region", value: "total", variant: "donut" },
      data,
    );
    expect((donut["series"] as Array<{ radius: unknown }>)[0]!.radius).toEqual([
      "40%",
      "70%",
    ]);
  });

  test("filters out rows with empty category names", () => {
    const opt = toPieOption(
      { type: "pie", category: "region", value: "total" },
      {
        rows: [
          { region: "EU", total: 100 },
          { region: null, total: 50 },
        ],
      },
    );
    const seriesData = (opt["series"] as Array<{ data: unknown[] }>)[0]!.data;
    expect(seriesData).toHaveLength(1);
  });
});

describe("toScatterOption", () => {
  test("2-tuple data without size", () => {
    const opt = toScatterOption(
      { type: "scatter", xAxis: "x", yAxis: "y" },
      { rows: [{ x: 1, y: 2 }] },
    );
    const seriesData = (opt["series"] as Array<{ data: unknown[] }>)[0]!.data;
    expect(seriesData).toEqual([[1, 2]]);
  });

  test("3-tuple data with size column", () => {
    const opt = toScatterOption(
      { type: "scatter", xAxis: "x", yAxis: "y", size: "n" },
      { rows: [{ x: 1, y: 2, n: 50 }] },
    );
    const seriesData = (opt["series"] as Array<{ data: unknown[] }>)[0]!.data;
    expect(seriesData).toEqual([[1, 2, 50]]);
  });
});

describe("toBigNumber", () => {
  test("number format applies locale grouping", () => {
    const view = toBigNumber(
      { type: "big_number", value: "v", format: "number" },
      { rows: [{ v: 1234567 }] },
    );
    expect(view.display).toBe("1,234,567");
    expect(view.raw).toBe(1234567);
  });

  test("currency format uses Intl with the configured currency", () => {
    const view = toBigNumber(
      {
        type: "big_number",
        value: "v",
        format: "currency",
        currency: "EUR",
        locale: "en-US",
      },
      { rows: [{ v: 12345.6 }] },
    );
    expect(view.display).toContain("€12,345");
  });

  test("percent multiplies and adds %", () => {
    const view = toBigNumber(
      { type: "big_number", value: "v", format: "percent" },
      { rows: [{ v: 0.123 }] },
    );
    expect(view.display).toContain("%");
    expect(view.display).toContain("12");
  });

  test("prefix and suffix wrap the formatted body", () => {
    const view = toBigNumber(
      {
        type: "big_number",
        value: "v",
        format: "number",
        prefix: "~",
        suffix: " users",
      },
      { rows: [{ v: 42 }] },
    );
    expect(view.display).toBe("~42 users");
  });

  test("missing data returns the em-dash placeholder", () => {
    const view = toBigNumber(
      { type: "big_number", value: "v", format: "number" },
      { rows: [] },
    );
    expect(view.display).toBe("—");
    expect(view.raw).toBeNull();
  });
});

describe("toAgGridColumns", () => {
  test("derives columns from the first row when none specified", () => {
    const cols = toAgGridColumns(
      { type: "table" },
      { rows: [{ id: 1, name: "x" }] },
    );
    expect(cols.map((c) => c.field)).toEqual(["id", "name"]);
    expect(cols[0]!.sortable).toBe(true);
  });

  test("respects an explicit column subset", () => {
    const cols = toAgGridColumns(
      { type: "table", columns: ["name"] },
      { rows: [{ id: 1, name: "x" }] },
    );
    expect(cols.map((c) => c.field)).toEqual(["name"]);
  });
});
