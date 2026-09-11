import { POSITIONS } from "@/lib/constants";
import { parseCsvRows, normalizeKey } from "@/lib/csv";

export const ROSTER_CSV_COLUMNS = [
  "name",
  "jerseyNumber",
  "positions",
  "height",
  "weightLbs",
  "collegeYear",
  "dateOfBirth",
  "guardian1Name",
  "guardian1Phone",
  "guardian1Email",
  "guardian2Name",
  "guardian2Phone",
  "guardian2Email",
  "emergencyMedicalNotes",
] as const;

export type ParsedRosterPlayer = {
  name: string;
  jerseyNumber: number | null;
  positions: string[];
  heightInches: number | null;
  weightLbs: number | null;
  collegeYear: number | null;
  dateOfBirth: Date | null;
  guardian1Name: string | null;
  guardian1Phone: string | null;
  guardian1Email: string | null;
  guardian2Name: string | null;
  guardian2Phone: string | null;
  guardian2Email: string | null;
  emergencyMedicalNotes: string | null;
};

export type RosterCsvParseResult = {
  players: ParsedRosterPlayer[];
  errors: string[];
  warnings: string[];
};

function parseIntOrNull(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
}

function parseFloatOrNull(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDateOrNull(raw: string): Date | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const date = new Date(`${trimmed}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Accepts "6-3", "6'3\"", or a bare total-inches number like "75".
function parseHeightOrNull(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const feetInches = trimmed.match(/^(\d+)[-'](\d+)/);
  if (feetInches) {
    return Number(feetInches[1]) * 12 + Number(feetInches[2]);
  }

  const asNumber = Number(trimmed);
  return Number.isFinite(asNumber) ? asNumber : null;
}

function parsePositions(raw: string, lineNumber: number, warnings: string[]): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const validByKey = new Map(POSITIONS.map((p) => [normalizeKey(p), p]));
  const positions: string[] = [];
  for (const part of trimmed.split(/[;/|]/)) {
    const candidate = part.trim();
    if (!candidate) continue;
    const match = validByKey.get(normalizeKey(candidate));
    if (match) {
      positions.push(match);
    } else {
      warnings.push(`Row ${lineNumber}: unrecognized position "${candidate}" — skipped.`);
    }
  }
  return positions;
}

export function parseRosterCsv(csvText: string): RosterCsvParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const players: ParsedRosterPlayer[] = [];

  const allRows = parseCsvRows(csvText.trim());
  if (allRows.length === 0) {
    return { players, errors: ["The CSV is empty."], warnings };
  }

  const header = allRows[0].map((h) => normalizeKey(h));
  const dataRows = allRows.slice(1);

  const colIndex: Record<string, number> = {};
  for (const col of ROSTER_CSV_COLUMNS) {
    const idx = header.indexOf(normalizeKey(col));
    if (idx !== -1) colIndex[col] = idx;
  }
  if (colIndex.name === undefined) {
    errors.push('The CSV header must include a "name" column.');
    return { players, errors, warnings };
  }

  const get = (row: string[], col: string): string =>
    colIndex[col] !== undefined ? (row[colIndex[col]] ?? "") : "";

  dataRows.forEach((row, i) => {
    const lineNumber = i + 2;
    if (row.every((cell) => cell.trim() === "")) return;

    const name = get(row, "name").trim();
    if (!name) {
      errors.push(`Row ${lineNumber}: "name" is required.`);
      return;
    }

    players.push({
      name,
      jerseyNumber: parseIntOrNull(get(row, "jerseyNumber")),
      positions: parsePositions(get(row, "positions"), lineNumber, warnings),
      heightInches: parseHeightOrNull(get(row, "height")),
      weightLbs: parseFloatOrNull(get(row, "weightLbs")),
      collegeYear: parseIntOrNull(get(row, "collegeYear")),
      dateOfBirth: parseDateOrNull(get(row, "dateOfBirth")),
      guardian1Name: get(row, "guardian1Name").trim() || null,
      guardian1Phone: get(row, "guardian1Phone").trim() || null,
      guardian1Email: get(row, "guardian1Email").trim() || null,
      guardian2Name: get(row, "guardian2Name").trim() || null,
      guardian2Phone: get(row, "guardian2Phone").trim() || null,
      guardian2Email: get(row, "guardian2Email").trim() || null,
      emergencyMedicalNotes: get(row, "emergencyMedicalNotes").trim() || null,
    });
  });

  return { players, errors, warnings };
}
