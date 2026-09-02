"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type AddResultState = { ok: boolean; error?: string };

export async function addTestResult(
  _prevState: AddResultState,
  formData: FormData,
): Promise<AddResultState> {
  const playerId = String(formData.get("playerId") ?? "");
  const testTypeId = String(formData.get("testTypeId") ?? "");
  const valueRaw = String(formData.get("value") ?? "").trim();
  const dateRaw = String(formData.get("recordedOn") ?? "").trim();

  const value = Number(valueRaw);
  if (!playerId || !testTypeId || !valueRaw || !Number.isFinite(value)) {
    return { ok: false, error: "Fill in every field before saving." };
  }

  const recordedOn = dateRaw ? new Date(`${dateRaw}T00:00:00.000Z`) : new Date();

  await prisma.testResult.create({
    data: { playerId, testTypeId, value, recordedOn },
  });

  revalidatePath("/results");
  return { ok: true };
}

export async function deleteTestResult(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.testResult.delete({ where: { id } });

  revalidatePath("/results");
}
