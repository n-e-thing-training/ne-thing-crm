import Papa from "papaparse";
import * as XLSX from "xlsx";
import { normalizeEmail, normalizePhone } from "@/lib/utils";

export interface ParsedRosterRow {
  rowNumber: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
}

interface ParseRosterResult {
  rows: ParsedRosterRow[];
  rowErrors: Array<{ rowNumber: number; error: string }>;
}

function mapRow(row: Record<string, unknown>, rowNumber: number): ParsedRosterRow | null {
  const firstName = String(row.first_name ?? row.firstName ?? row["First Name"] ?? "").trim();
  const lastName = String(row.last_name ?? row.lastName ?? row["Last Name"] ?? "").trim();
  const email = normalizeEmail(String(row.email ?? row.Email ?? ""));
  const phone = normalizePhone(String(row.phone ?? row.Phone ?? ""));

  if (!firstName || !lastName) return null;

  return {
    rowNumber,
    firstName,
    lastName,
    email,
    phone
  };
}

function parseCsv(content: string): ParseRosterResult {
  const parsed = Papa.parse<Record<string, unknown>>(content, {
    header: true,
    skipEmptyLines: true
  });

  const rows: ParsedRosterRow[] = [];
  const rowErrors: Array<{ rowNumber: number; error: string }> = [];

  parsed.data.forEach((rawRow, index) => {
    const rowNumber = index + 2;
    const mapped = mapRow(rawRow, rowNumber);
    if (!mapped) {
      rowErrors.push({ rowNumber, error: "Missing first_name or last_name" });
      return;
    }
    rows.push(mapped);
  });

  return { rows, rowErrors };
}

function parseXlsx(buffer: ArrayBuffer): ParseRosterResult {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { raw: false });

  const rows: ParsedRosterRow[] = [];
  const rowErrors: Array<{ rowNumber: number; error: string }> = [];

  jsonRows.forEach((rawRow, index) => {
    const rowNumber = index + 2;
    const mapped = mapRow(rawRow, rowNumber);
    if (!mapped) {
      rowErrors.push({ rowNumber, error: "Missing first_name or last_name" });
      return;
    }
    rows.push(mapped);
  });

  return { rows, rowErrors };
}

export async function parseRosterFile(file: File): Promise<ParseRosterResult> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "csv") {
    const content = await file.text();
    return parseCsv(content);
  }

  if (extension === "xlsx") {
    const buffer = await file.arrayBuffer();
    return parseXlsx(buffer);
  }

  throw new Error("Unsupported file format. Use .csv or .xlsx");
}
