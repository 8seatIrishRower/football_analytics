"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ParticipantRole, GameSide, PlayType } from "@prisma/client";
import { parseOptionalInt, parseOptionalString } from "@/lib/parse-form";
import { parsePlaysCsv } from "@/lib/play-csv";

export type AddPlayState = { ok: boolean; error?: string };

export type ImportPlaysState = {
  ok: boolean;
  error?: string;
  imported?: number;
  warnings?: string[];
};

const ROLE_FIELD_NAMES: Record<string, ParticipantRole> = {
  ballCarrierId: ParticipantRole.BALL_CARRIER,
  passerId: ParticipantRole.PASSER,
  receiverId: ParticipantRole.RECEIVER,
  tackleId: ParticipantRole.TACKLE,
  assistTackleId: ParticipantRole.ASSIST_TACKLE,
  sackId: ParticipantRole.SACK,
  forcedFumbleId: ParticipantRole.FORCED_FUMBLE,
  fumbleRecoveryId: ParticipantRole.FUMBLE_RECOVERY,
  interceptionId: ParticipantRole.INTERCEPTION,
};

export async function addPlay(
  _prevState: AddPlayState,
  formData: FormData,
): Promise<AddPlayState> {
  const gameId = String(formData.get("gameId") ?? "");
  const quarterRaw = parseOptionalInt(formData.get("quarter"));
  const sideRaw = String(formData.get("side") ?? "");
  const playTypeRaw = String(formData.get("playType") ?? "");

  if (!gameId || quarterRaw === null) {
    return { ok: false, error: "Fill in every required field before saving." };
  }
  const side = Object.values(GameSide).includes(sideRaw as GameSide)
    ? (sideRaw as GameSide)
    : null;
  const playType = Object.values(PlayType).includes(playTypeRaw as PlayType)
    ? (playTypeRaw as PlayType)
    : null;
  if (!side || !playType) {
    return { ok: false, error: "Fill in every required field before saving." };
  }

  const lastPlay = await prisma.play.findFirst({
    where: { gameId },
    orderBy: { playNumber: "desc" },
    select: { playNumber: true },
  });
  const playNumber = (lastPlay?.playNumber ?? 0) + 1;

  const participants: { playerId: string; role: ParticipantRole }[] = [];
  for (const [fieldName, role] of Object.entries(ROLE_FIELD_NAMES)) {
    const playerId = parseOptionalString(formData.get(fieldName));
    if (playerId) participants.push({ playerId, role });
  }

  await prisma.play.create({
    data: {
      gameId,
      playNumber,
      quarter: quarterRaw,
      down: parseOptionalInt(formData.get("down")),
      distance: parseOptionalInt(formData.get("distance")),
      side,
      ourFormation: parseOptionalString(formData.get("ourFormation")),
      theirFormation: parseOptionalString(formData.get("theirFormation")),
      blitz: formData.get("blitz") === "on",
      playType,
      yardsGained: parseOptionalInt(formData.get("yardsGained")),
      fumble: formData.get("fumble") === "on",
      teamScoreAfter: parseOptionalInt(formData.get("teamScoreAfter")),
      opponentScoreAfter: parseOptionalInt(formData.get("opponentScoreAfter")),
      ourOffenseNotes: parseOptionalString(formData.get("ourOffenseNotes")),
      ourDefenseNotes: parseOptionalString(formData.get("ourDefenseNotes")),
      theirOffenseNotes: parseOptionalString(formData.get("theirOffenseNotes")),
      theirDefenseNotes: parseOptionalString(formData.get("theirDefenseNotes")),
      participants: { create: participants },
    },
  });

  revalidatePath(`/teams/${formData.get("teamId")}/games/${gameId}`);
  return { ok: true };
}

export async function importPlaysFromCsv(
  _prevState: ImportPlaysState,
  formData: FormData,
): Promise<ImportPlaysState> {
  const teamId = String(formData.get("teamId") ?? "");
  const gameId = String(formData.get("gameId") ?? "");
  const csvText = String(formData.get("csv") ?? "");

  if (!teamId || !gameId || !csvText.trim()) {
    return { ok: false, error: "Choose or paste a CSV file first." };
  }

  const roster = await prisma.player.findMany({
    where: { teamId },
    select: { id: true, name: true, jerseyNumber: true },
  });

  const { plays, errors, warnings } = parsePlaysCsv(csvText, roster);

  if (errors.length > 0) {
    return { ok: false, error: errors.join(" ") };
  }
  if (plays.length === 0) {
    return { ok: false, error: "No plays found in that CSV." };
  }

  const lastPlay = await prisma.play.findFirst({
    where: { gameId },
    orderBy: { playNumber: "desc" },
    select: { playNumber: true },
  });
  let nextPlayNumber = (lastPlay?.playNumber ?? 0) + 1;

  await prisma.$transaction(
    plays.map((play) =>
      prisma.play.create({
        data: {
          gameId,
          playNumber: nextPlayNumber++,
          quarter: play.quarter,
          down: play.down,
          distance: play.distance,
          side: play.side,
          ourFormation: play.ourFormation,
          theirFormation: play.theirFormation,
          blitz: play.blitz,
          playType: play.playType,
          yardsGained: play.yardsGained,
          fumble: play.fumble,
          teamScoreAfter: play.teamScoreAfter,
          opponentScoreAfter: play.opponentScoreAfter,
          ourOffenseNotes: play.ourOffenseNotes,
          ourDefenseNotes: play.ourDefenseNotes,
          theirOffenseNotes: play.theirOffenseNotes,
          theirDefenseNotes: play.theirDefenseNotes,
          participants: { create: play.participants },
        },
      }),
    ),
  );

  revalidatePath(`/teams/${teamId}/games/${gameId}`);
  return { ok: true, imported: plays.length, warnings };
}

export async function deletePlay(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const teamId = String(formData.get("teamId") ?? "");
  const gameId = String(formData.get("gameId") ?? "");
  if (!id) return;

  await prisma.play.delete({ where: { id } });

  revalidatePath(`/teams/${teamId}/games/${gameId}`);
}
