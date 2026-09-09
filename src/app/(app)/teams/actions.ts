"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TeamLevel } from "@prisma/client";

export async function addTeam(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const levelRaw = String(formData.get("level") ?? "");
  const level = Object.values(TeamLevel).includes(levelRaw as TeamLevel)
    ? (levelRaw as TeamLevel)
    : null;
  if (!name || !level) return;

  await prisma.team.create({ data: { name, level } });

  revalidatePath("/teams");
}

export async function deleteTeam(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.team.delete({ where: { id } });

  revalidatePath("/teams");
  redirect("/teams");
}
