import Papa from "papaparse";
import { categorizeTransaction } from "@/lib/categorization";
import { format, parse, isValid } from "date-fns";

export interface ParsedRow {
  date: string;
  description: string;
  amount: number;
  rawRow: Record<string, string>;
}

export interface ParseResult {
  rows: ParsedRow[];
  errors: string[];
  detectedColumns: {
    date: string;
    description: string;
    amount: string;
  };
}

// Known column name variants for auto-detection
const DATE_ALIASES = ["date", "transaction date", "txn date", "value date", "posting date", "trans date", "dated"];
const DESCRIPTION_ALIASES = ["description", "narration", "remarks", "particulars", "details", "transaction details", "transaction description", "reference", "txn description"];
const AMOUNT_ALIASES = ["debit", "withdrawal", "amount", "dr amount", "debit amount", "withdrawal amount", "transaction amount", "txn amount"];

function findColumn(headers: string[], aliases: string[]): string | null {
  const lower = headers.map((h) => h.toLowerCase().trim());
  for (const alias of aliases) {
    const idx = lower.findIndex((h) => h === alias || h.includes(alias));
    if (idx !== -1) return headers[idx];
  }
  return null;
}

function parseAmount(val: string): number {
  // Remove currency symbols, commas, whitespace
  const cleaned = val.replace(/[₹$€£,\s]/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.abs(num);
}

const DATE_FORMATS = [
  "dd/MM/yyyy",
  "MM/dd/yyyy",
  "yyyy-MM-dd",
  "dd-MM-yyyy",
  "MM-dd-yyyy",
  "dd MMM yyyy",
  "MMM dd yyyy",
  "dd-MMM-yyyy",
  "dd/MMM/yyyy",
  "yyyy/MM/dd",
  "d/M/yyyy",
  "d-M-yyyy",
];

function parseDate(val: string): string {
  const cleaned = val.trim();

  for (const fmt of DATE_FORMATS) {
    try {
      const parsed = parse(cleaned, fmt, new Date());
      if (isValid(parsed)) {
        return format(parsed, "yyyy-MM-dd");
      }
    } catch {
      // try next format
    }
  }

  // Try native Date parsing as fallback
  const native = new Date(cleaned);
  if (isValid(native)) {
    return format(native, "yyyy-MM-dd");
  }

  return cleaned; // return as-is if we can't parse
}

export function parseCSV(csvText: string): ParseResult {
  const errors: string[] = [];

  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (parsed.errors.length > 0) {
    errors.push(...parsed.errors.slice(0, 3).map((e) => e.message));
  }

  const headers = parsed.meta.fields ?? [];

  if (headers.length === 0) {
    return {
      rows: [],
      errors: ["No headers found in CSV. Please check the file format."],
      detectedColumns: { date: "", description: "", amount: "" },
    };
  }

  const dateCol = findColumn(headers, DATE_ALIASES);
  const descCol = findColumn(headers, DESCRIPTION_ALIASES);
  const amountCol = findColumn(headers, AMOUNT_ALIASES);

  if (!dateCol || !descCol || !amountCol) {
    const missing = [
      !dateCol && "Date",
      !descCol && "Description",
      !amountCol && "Amount/Debit",
    ]
      .filter(Boolean)
      .join(", ");

    return {
      rows: [],
      errors: [
        `Could not detect columns: ${missing}. Available columns: ${headers.join(", ")}`,
      ],
      detectedColumns: {
        date: dateCol ?? "",
        description: descCol ?? "",
        amount: amountCol ?? "",
      },
    };
  }

  const rows: ParsedRow[] = [];

  for (const row of parsed.data) {
    const dateVal = row[dateCol]?.trim() ?? "";
    const descVal = row[descCol]?.trim() ?? "";
    const amountVal = row[amountCol]?.trim() ?? "";

    if (!dateVal || !descVal) continue;

    const amount = parseAmount(amountVal);
    if (amount === 0) continue;

    const date = parseDate(dateVal);

    rows.push({
      date,
      description: descVal,
      amount,
      rawRow: row,
    });
  }

  if (rows.length === 0) {
    errors.push("No valid transactions found. Please check that the file contains date and amount data.");
  }

  return {
    rows,
    errors,
    detectedColumns: {
      date: dateCol,
      description: descCol,
      amount: amountCol,
    },
  };
}

export function enrichWithCategories(rows: ParsedRow[]) {
  return rows.map((row) => ({
    ...row,
    category: categorizeTransaction(row.description),
    selected: true,
  }));
}
