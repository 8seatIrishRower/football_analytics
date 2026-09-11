import { GameSide, ParticipantRole, PlayType } from "@prisma/client";
import { GAME_SIDE_LABELS, PLAY_TYPE_LABELS } from "@/lib/constants";
import { parseCsvRows, normalizeKey } from "@/lib/csv";

// Column order for the CSV template. Player columns accept either a jersey
// number or a full name (case-insensitive) from the game's team roster.
export const PLAY_CSV_COLUMNS = [
  "quarter",
  "down",
  "distance",
  "side",
  "playType",
  "ourFormation",
  "theirFormation",
  "blitz",
  "yardsGained",
  "fumble",
  "teamScoreAfter",
  "opponentScoreAfter",
  "ballCarrier",
  "passer",
  "receiver",
  "tackle",
  "assistTackle",
  "sack",
  "forcedFumble",
  "fumbleRecovery",
  "interception",
  "ourOffenseNotes",
  "ourDefenseNotes",
  "theirOffenseNotes",
  "theirDefenseNotes",
] as const;

const PLAYER_COLUMN_ROLES: Record<string, ParticipantRole> = {
  ballCarrier: ParticipantRole.BALL_CARRIER,
  passer: ParticipantRole.PASSER,
  receiver: ParticipantRole.RECEIVER,
  tackle: ParticipantRole.TACKLE,
  assistTackle: ParticipantRole.ASSIST_TACKLE,
  sack: ParticipantRole.SACK,
  forcedFumble: ParticipantRole.FORCED_FUMBLE,
  fumbleRecovery: ParticipantRole.FUMBLE_RECOVERY,
  interception: ParticipantRole.INTERCEPTION,
};

const NOTE_COLUMNS = [
  "ourOffenseNotes",
  "ourDefenseNotes",
  "theirOffenseNotes",
  "theirDefenseNotes",
] as const;

type RosterPlayer = { id: string; name: string; jerseyNumber: number | null };

export type ParsedPlay = {
  quarter: number;
  down: number | null;
  distance: number | null;
  side: GameSide;
  playType: PlayType;
  ourFormation: string | null;
  theirFormation: string | null;
  blitz: boolean;
  yardsGained: number | null;
  fumble: boolean;
  teamScoreAfter: number | null;
  opponentScoreAfter: number | null;
  ourOffenseNotes: string | null;
  ourDefenseNotes: string | null;
  theirOffenseNotes: string | null;
  theirDefenseNotes: string | null;
  participants: { playerId: string; role: ParticipantRole }[];
};

export type PlayCsvParseResult = {
  plays: ParsedPlay[];
  errors: string[];
  warnings: string[];
};

function matchEnum<T extends string>(
  raw: string,
  labels: Record<string, string>,
): T | null {
  const normalized = normalizeKey(raw);
  for (const key of Object.keys(labels)) {
    if (normalizeKey(key) === normalized) return key as T;
  }
  for (const [key, label] of Object.entries(labels)) {
    if (normalizeKey(label) === normalized) return key as T;
  }
  return null;
}

function parseBoolean(raw: string): boolean {
  return ["true", "1", "yes", "y", "on"].includes(raw.trim().toLowerCase());
}

function parseIntOrNull(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
}

function findPlayer(raw: string, roster: RosterPlayer[]): RosterPlayer | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const asNumber = Number(trimmed);
  if (Number.isInteger(asNumber)) {
    const byJersey = roster.find((p) => p.jerseyNumber === asNumber);
    if (byJersey) return byJersey;
  }

  const normalized = trimmed.toLowerCase();
  return roster.find((p) => p.name.toLowerCase() === normalized) ?? null;
}

export function parsePlaysCsv(
  csvText: string,
  roster: RosterPlayer[],
): PlayCsvParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const plays: ParsedPlay[] = [];

  const allRows = parseCsvRows(csvText.trim());
  if (allRows.length === 0) {
    return { plays, errors: ["The CSV is empty."], warnings };
  }

  const header = allRows[0].map((h) => normalizeKey(h));
  const dataRows = allRows.slice(1);

  const colIndex: Record<string, number> = {};
  for (const col of PLAY_CSV_COLUMNS) {
    const idx = header.indexOf(normalizeKey(col));
    if (idx !== -1) colIndex[col] = idx;
  }
  if (colIndex.quarter === undefined || colIndex.side === undefined || colIndex.playType === undefined) {
    errors.push(
      "The CSV header must include at least quarter, side, and playType columns.",
    );
    return { plays, errors, warnings };
  }

  const get = (row: string[], col: string): string =>
    colIndex[col] !== undefined ? (row[colIndex[col]] ?? "") : "";

  dataRows.forEach((row, i) => {
    const lineNumber = i + 2; // account for header + 1-indexing
    if (row.every((cell) => cell.trim() === "")) return;

    const quarter = parseIntOrNull(get(row, "quarter"));
    if (quarter === null) {
      errors.push(`Row ${lineNumber}: "quarter" is required and must be a number.`);
      return;
    }

    const sideRaw = get(row, "side");
    const side = matchEnum<GameSide>(sideRaw, GAME_SIDE_LABELS);
    if (!side) {
      errors.push(`Row ${lineNumber}: unrecognized side "${sideRaw}".`);
      return;
    }

    const playTypeRaw = get(row, "playType");
    const playType = matchEnum<PlayType>(playTypeRaw, PLAY_TYPE_LABELS);
    if (!playType) {
      errors.push(`Row ${lineNumber}: unrecognized playType "${playTypeRaw}".`);
      return;
    }

    const participants: { playerId: string; role: ParticipantRole }[] = [];
    for (const [column, role] of Object.entries(PLAYER_COLUMN_ROLES)) {
      const raw = get(row, column);
      if (!raw.trim()) continue;
      const player = findPlayer(raw, roster);
      if (!player) {
        warnings.push(
          `Row ${lineNumber}: no roster match for ${column} "${raw}" — left blank.`,
        );
        continue;
      }
      participants.push({ playerId: player.id, role });
    }

    const notes: Record<(typeof NOTE_COLUMNS)[number], string | null> = {
      ourOffenseNotes: null,
      ourDefenseNotes: null,
      theirOffenseNotes: null,
      theirDefenseNotes: null,
    };
    for (const col of NOTE_COLUMNS) {
      const raw = get(row, col).trim();
      notes[col] = raw || null;
    }

    plays.push({
      quarter,
      down: parseIntOrNull(get(row, "down")),
      distance: parseIntOrNull(get(row, "distance")),
      side,
      playType,
      ourFormation: get(row, "ourFormation").trim() || null,
      theirFormation: get(row, "theirFormation").trim() || null,
      blitz: parseBoolean(get(row, "blitz")),
      yardsGained: parseIntOrNull(get(row, "yardsGained")),
      fumble: parseBoolean(get(row, "fumble")),
      teamScoreAfter: parseIntOrNull(get(row, "teamScoreAfter")),
      opponentScoreAfter: parseIntOrNull(get(row, "opponentScoreAfter")),
      ...notes,
      participants,
    });
  });

  return { plays, errors, warnings };
}
