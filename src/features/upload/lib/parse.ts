import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { ParsedTransactionRow, TransactionType } from "@/types";

export const REQUIRED_COLUMNS = ["date", "description", "category", "amount", "type"] as const;

export interface ParseResult {
  rows: ParsedTransactionRow[];
  errors: string[];
  detectedColumns: string[];
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase();
}

function normalizeType(raw: string): TransactionType | null {
  const v = raw.trim().toLowerCase();
  if (["income", "revenue", "credit", "in"].includes(v)) return "income";
  if (["expense", "cost", "debit", "out"].includes(v)) return "expense";
  return null;
}

function parseAmount(raw: unknown): number | null {
  if (typeof raw === "number") return raw;
  if (typeof raw !== "string") return null;
  const cleaned = raw.replace(/[,₹$\s]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? Math.abs(n) : null;
}

function parseDate(raw: unknown): string | null {
  if (raw instanceof Date) return raw.toISOString().slice(0, 10);
  if (typeof raw === "number") {
    // Excel serial date
    const parsed = XLSX.SSF.parse_date_code(raw);
    if (!parsed) return null;
    const d = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
    return d.toISOString().slice(0, 10);
  }
  if (typeof raw === "string") {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return null;
}

/** Turns raw parsed rows (from either CSV or Excel) into validated transaction rows. */
function validateRawRows(rawRows: Record<string, unknown>[]): ParseResult {
  const errors: string[] = [];
  const rows: ParsedTransactionRow[] = [];

  if (rawRows.length === 0) {
    return { rows: [], errors: ["The file has no data rows."], detectedColumns: [] };
  }

  const detectedColumns = Object.keys(rawRows[0]).map(normalizeHeader);
  const missing = REQUIRED_COLUMNS.filter((c) => !detectedColumns.includes(c));
  if (missing.length > 0) {
    return {
      rows: [],
      errors: [`Missing required column(s): ${missing.join(", ")}. Expected: ${REQUIRED_COLUMNS.join(", ")}.`],
      detectedColumns,
    };
  }

  rawRows.forEach((raw, i) => {
    const normalized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(raw)) {
      normalized[normalizeHeader(key)] = value;
    }

    const rowNum = i + 2; // account for header row, 1-indexed
    const date = parseDate(normalized.date);
    const type = normalizeType(String(normalized.type ?? ""));
    const amount = parseAmount(normalized.amount);
    const description = String(normalized.description ?? "").trim();
    const category = String(normalized.category ?? "").trim();

    if (!date) {
      errors.push(`Row ${rowNum}: could not parse date "${normalized.date}".`);
      return;
    }
    if (!type) {
      errors.push(`Row ${rowNum}: type must be "income" or "expense", got "${normalized.type}".`);
      return;
    }
    if (amount === null || amount <= 0) {
      errors.push(`Row ${rowNum}: invalid amount "${normalized.amount}".`);
      return;
    }
    if (!description) {
      errors.push(`Row ${rowNum}: description is required.`);
      return;
    }
    if (!category) {
      errors.push(`Row ${rowNum}: category is required.`);
      return;
    }

    rows.push({ date, description, category, amount, type });
  });

  return { rows, errors, detectedColumns };
}

export function parseCSVFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(validateRawRows(results.data as Record<string, unknown>[])),
      error: () => resolve({ rows: [], errors: ["Failed to parse CSV file."], detectedColumns: [] }),
    });
  });
}

export async function parseExcelFile(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const firstSheet = workbook.SheetNames[0];
  if (!firstSheet) return { rows: [], errors: ["The workbook has no sheets."], detectedColumns: [] };

  const sheet = workbook.Sheets[firstSheet];
  const json = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as Record<string, unknown>[];
  return validateRawRows(json);
}

export async function parseFinancialFile(file: File): Promise<ParseResult> {
  const isExcel = /\.(xlsx|xls)$/i.test(file.name);
  return isExcel ? parseExcelFile(file) : parseCSVFile(file);
}
