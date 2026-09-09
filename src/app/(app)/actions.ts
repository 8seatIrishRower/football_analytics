"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PadLevel } from "@prisma/client";
import { roundToQuarterInch } from "@/lib/format";

export type AddResultState = { ok: boolean; error?: string };

export async function addTestResult(
  _prevState: AddResultState,
  formData: FormData,
): Promise<AddResultState> {
  const playerId = String(formData.get("playerId") ?? "");
  const testTypeId = String(formData.get("testTypeId") ?? "");
  const padLevelRaw = String(formData.get("padLevel") ?? "");
  const dateRaw = String(formData.get("recordedOn") ?? "").trim();

  if (!playerId || !testTypeId) {
    return { ok: false, error: "Fill in every field before saving." };
  }

  const padLevel = Object.values(PadLevel).includes(padLevelRaw as PadLevel)
    ? (padLevelRaw as PadLevel)
    : null;
  if (!padLevel) {
    return { ok: false, error: "Fill in every field before saving." };
  }

  const testType = await prisma.testType.findUnique({ where: { id: testTypeId } });
  if (!testType) {
    return { ok: false, error: "That test type no longer exists." };
  }

  let value: number;
  if (testType.valueType === "DISTANCE") {
    const feet = Number(formData.get("valueFeet"));
    const inches = Number(formData.get("valueInches"));
    if (!Number.isFinite(feet) || !Number.isFinite(inches)) {
      return { ok: false, error: "Fill in every field before saving." };
    }
    value = roundToQuarterInch(feet * 12 + inches);
  } else {
    const seconds = Number(formData.get("valueSeconds"));
    if (!Number.isFinite(seconds)) {
      return { ok: false, error: "Fill in every field before saving." };
    }
    value = seconds;
  }

  const recordedOn = dateRaw ? new Date(`${dateRaw}T00:00:00.000Z`) : new Date();

  await prisma.testResult.create({
    data: { playerId, testTypeId, value, padLevel, recordedOn },
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
