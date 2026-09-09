"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function parseOptionalInt(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
}

export async function addGame(formData: FormData) {
  const teamId = String(formData.get("teamId") ?? "");
  const opponentName = String(formData.get("opponentName") ?? "").trim();
  const playedOnRaw = String(formData.get("playedOn") ?? "").trim();
  if (!teamId || !opponentName || !playedOnRaw) return;

  const game = await prisma.game.create({
    data: {
      teamId,
      opponentName,
      playedOn: new Date(`${playedOnRaw}T00:00:00.000Z`),
      teamScore: parseOptionalInt(formData.get("teamScore")),
      opponentScore: parseOptionalInt(formData.get("opponentScore")),
    },
  });

  revalidatePath(`/teams/${teamId}`);
  redirect(`/teams/${teamId}/games/${game.id}`);
}

export async function updateGameScore(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const teamId = String(formData.get("teamId") ?? "");
  if (!id) return;

  await prisma.game.update({
    where: { id },
    data: {
      teamScore: parseOptionalInt(formData.get("teamScore")),
      opponentScore: parseOptionalInt(formData.get("opponentScore")),
    },
  });

  revalidatePath(`/teams/${teamId}/games/${id}`);
}

export async function deleteGame(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const teamId = String(formData.get("teamId") ?? "");
  if (!id) return;

  await prisma.game.delete({ where: { id } });

  revalidatePath(`/teams/${teamId}`);
  redirect(`/teams/${teamId}`);
}
