"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  parseOptionalInt,
  parseOptionalFloat,
  parseOptionalDate,
  parseOptionalString,
  combineHeight,
} from "@/lib/parse-form";

export async function addTeamPlayer(formData: FormData) {
  const teamId = String(formData.get("teamId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!teamId || !name) return;

  const positions = formData.getAll("positions").map(String);

  await prisma.player.create({
    data: {
      teamId,
      name,
      jerseyNumber: parseOptionalInt(formData.get("jerseyNumber")),
      positions,
      dateOfBirth: parseOptionalDate(formData.get("dateOfBirth")),
      heightInches: combineHeight(
        formData.get("heightFeet"),
        formData.get("heightInchesPart"),
      ),
      weightLbs: parseOptionalFloat(formData.get("weightLbs")),
      collegeYear: parseOptionalInt(formData.get("collegeYear")),
      guardian1Name: parseOptionalString(formData.get("guardian1Name")),
      guardian1Phone: parseOptionalString(formData.get("guardian1Phone")),
      guardian1Email: parseOptionalString(formData.get("guardian1Email")),
      guardian2Name: parseOptionalString(formData.get("guardian2Name")),
      guardian2Phone: parseOptionalString(formData.get("guardian2Phone")),
      guardian2Email: parseOptionalString(formData.get("guardian2Email")),
      emergencyMedicalNotes: parseOptionalString(formData.get("emergencyMedicalNotes")),
    },
  });

  revalidatePath(`/teams/${teamId}/roster`);
  revalidatePath(`/teams/${teamId}`);
}

export async function deleteTeamPlayer(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const teamId = String(formData.get("teamId") ?? "");
  if (!id) return;

  await prisma.player.delete({ where: { id } });

  revalidatePath(`/teams/${teamId}/roster`);
  revalidatePath(`/teams/${teamId}`);
}
