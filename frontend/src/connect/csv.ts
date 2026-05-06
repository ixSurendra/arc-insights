/**
 * Tiny CSV parser — handles quoted strings, commas inside quotes,
 * and \r\n / \n line endings. Sufficient for the Phase 1 connect-data
 * preview. Real ingestion (P1-16) will round-trip through the backend
 * which uses a battle-tested parser; this client-side parse is just
 * for showing the tenant what we found before they confirm.
 */

export interface ParsedCsv {
  /** First row (header). */
  columns: string[];
  /** Body rows. */
  rows: Array<Record<string, string>>;
  /** Inferred type per column. */
  types: Record<string, ColumnType>;
}

export type ColumnType =
  | "integer"
  | "float"
  | "boolean"
  | "date"
  | "datetime"
  | "string";

export function parseCsv(text: string, maxRows = 1000): ParsedCsv {
  const rawRows = tokenize(text);
  if (rawRows.length === 0) {
    return { columns: [], rows: [], types: {} };
  }
  const [header, ...body] = rawRows;
  const columns = (header ?? []).map((c) => c.trim() || "(unnamed)");
  const rows: Array<Record<string, string>> = [];

  for (let i = 0; i < Math.min(body.length, maxRows); i++) {
    const r = body[i];
    if (!r) continue;
    if (r.length === 1 && r[0] === "") continue; // blank line
    const obj: Record<string, string> = {};
    for (let c = 0; c < columns.length; c++) {
      obj[columns[c] ?? ""] = r[c] ?? "";
    }
    rows.push(obj);
  }

  const types: Record<string, ColumnType> = {};
  for (const col of columns)
    types[col] = inferType(rows.map((r) => r[col] ?? ""));

  return { columns, rows, types };
}

function tokenize(text: string): string[][] {
  const out: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(cur);
        cur = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(cur);
        out.push(row);
        row = [];
        cur = "";
      } else {
        cur += ch;
      }
    }
  }
  if (cur.length > 0 || row.length > 0) {
    row.push(cur);
    out.push(row);
  }
  return out;
}

const INT_RE = /^-?\d+$/;
const FLOAT_RE = /^-?\d+(\.\d+)?$/;
const BOOL_RE = /^(true|false|yes|no|t|f|y|n|0|1)$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DT_RE =
  /^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/;

function inferType(values: string[]): ColumnType {
  let intCount = 0;
  let floatCount = 0;
  let dateCount = 0;
  let dtCount = 0;
  let boolCount = 0;
  let nonEmpty = 0;

  for (const v of values) {
    const s = v?.trim();
    if (!s) continue;
    nonEmpty++;
    if (INT_RE.test(s)) intCount++;
    else if (FLOAT_RE.test(s)) floatCount++;
    if (DATE_RE.test(s)) dateCount++;
    else if (DT_RE.test(s)) dtCount++;
    if (BOOL_RE.test(s) && !INT_RE.test(s)) boolCount++;
  }

  if (nonEmpty === 0) return "string";

  // Whole-column matches win in this priority.
  if (dtCount === nonEmpty) return "datetime";
  if (dateCount === nonEmpty) return "date";
  if (intCount === nonEmpty) return "integer";
  if (intCount + floatCount === nonEmpty) return "float";
  if (boolCount === nonEmpty) return "boolean";
  return "string";
}
