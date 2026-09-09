"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function parseOptionalInt(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
}

function parseOptionalFloat(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseOptionalDate(value: FormDataEntryValue | null): Date | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const date = new Date(`${raw}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseOptionalString(value: FormDataEntryValue | null): string | null {
  const raw = String(value ?? "").trim();
  return raw || null;
}

function combineHeight(
  feetValue: FormDataEntryValue | null,
  inchesValue: FormDataEntryValue | null,
): number | null {
  const feet = parseOptionalFloat(feetValue);
  const inches = parseOptionalFloat(inchesValue);
  if (feet === null && inches === null) return null;
  return (feet ?? 0) * 12 + (inches ?? 0);
}

export async function addPlayer(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const positions = formData.getAll("positions").map(String);

  await prisma.player.create({
    data: {
      name,
      jerseyNumber: parseOptionalInt(formData.get("jerseyNumber")),
      positions,
      dateOfBirth: parseOptionalDate(formData.get("dateOfBirth")),
      heightInches: combineHeight(
        formData.get("heightFeet"),
        formData.get("heightInchesPart"),
      ),
      weightLbs: parseOptionalFloat(formData.get("weightLbs")),
      guardian1Name: parseOptionalString(formData.get("guardian1Name")),
      guardian1Phone: parseOptionalString(formData.get("guardian1Phone")),
      guardian1Email: parseOptionalString(formData.get("guardian1Email")),
      guardian2Name: parseOptionalString(formData.get("guardian2Name")),
      guardian2Phone: parseOptionalString(formData.get("guardian2Phone")),
      guardian2Email: parseOptionalString(formData.get("guardian2Email")),
      emergencyMedicalNotes: parseOptionalString(formData.get("emergencyMedicalNotes")),
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
