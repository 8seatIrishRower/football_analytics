"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function parseOptionalInt(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
}

export async function addPlayer(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const positions = formData.getAll("positions").map(String);

  await prisma.player.create({
    data: {
      name,
      jerseyNumber: parseOptionalInt(formData.get("jerseyNumber")),
      birthYear: parseOptionalInt(formData.get("birthYear")),
      positions,
    },
  });

  revalidatePath("/players");
  revalidatePath("/");
}

export async function deletePlayer(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.player.delete({ where: { id } });

  revalidatePath("/players");
  revalidatePath("/");
  revalidatePath("/results");
}
