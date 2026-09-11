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
import { parseRosterCsv } from "@/lib/roster-csv";

export type ImportRosterState = {
  ok: boolean;
  error?: string;
  imported?: number;
  warnings?: string[];
};

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

export async function importRosterFromCsv(
  _prevState: ImportRosterState,
  formData: FormData,
): Promise<ImportRosterState> {
  const teamId = String(formData.get("teamId") ?? "");
  const csvText = String(formData.get("csv") ?? "");

  if (!teamId || !csvText.trim()) {
    return { ok: false, error: "Choose or paste a CSV file first." };
  }

  const { players, errors, warnings } = parseRosterCsv(csvText);

  if (errors.length > 0) {
    return { ok: false, error: errors.join(" ") };
  }
  if (players.length === 0) {
    return { ok: false, error: "No players found in that CSV." };
  }

  await prisma.player.createMany({
    data: players.map((player) => ({
      teamId,
      name: player.name,
      jerseyNumber: player.jerseyNumber,
      positions: player.positions,
      heightInches: player.heightInches,
      weightLbs: player.weightLbs,
      collegeYear: player.collegeYear,
      dateOfBirth: player.dateOfBirth,
      guardian1Name: player.guardian1Name,
      guardian1Phone: player.guardian1Phone,
      guardian1Email: player.guardian1Email,
      guardian2Name: player.guardian2Name,
      guardian2Phone: player.guardian2Phone,
      guardian2Email: player.guardian2Email,
      emergencyMedicalNotes: player.emergencyMedicalNotes,
    })),
  });

  revalidatePath(`/teams/${teamId}/roster`);
  revalidatePath(`/teams/${teamId}`);
  return { ok: true, imported: players.length, warnings };
}

export async function deleteTeamPlayer(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const teamId = String(formData.get("teamId") ?? "");
  if (!id) return;

  await prisma.player.delete({ where: { id } });

  revalidatePath(`/teams/${teamId}/roster`);
  revalidatePath(`/teams/${teamId}`);
}
