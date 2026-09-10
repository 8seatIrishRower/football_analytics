import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { POSITIONS } from "@/lib/constants";
import { calculateAge, formatHeight } from "@/lib/format";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { addTeamPlayer, deleteTeamPlayer } from "./actions";

export const dynamic = "force-dynamic";

export default async function TeamRosterPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { players: { orderBy: [{ jerseyNumber: "asc" }, { name: "asc" }] } },
  });

  if (!team) notFound();

  const isYouth = team.level === "YOUTH";
  const isCollege = team.level === "COLLEGE";

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/teams/${team.id}`} className="text-sm text-slate-500">
          ← {team.name}
        </Link>
        <h1 className="mt-1 text-lg font-semibold text-slate-900">
          {team.name} roster
        </h1>
      </div>

      <section>
        <h2 className="text-base font-semibold text-slate-900">Add a player</h2>
        <form action={addTeamPlayer} className="mt-4 space-y-4">
          <input type="hidden" name="teamId" value={team.id} />
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="off"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="jerseyNumber" className="block text-sm font-medium text-slate-700">
                Jersey #
              </label>
              <input
                id="jerseyNumber"
                name="jerseyNumber"
                type="number"
                inputMode="numeric"
                min={0}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
            {isYouth && (
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-slate-700">
                  Date of birth
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="heightFeet" className="block text-sm font-medium text-slate-700">
                Height (ft)
              </label>
              <input
                id="heightFeet"
                name="heightFeet"
                type="number"
                inputMode="numeric"
                min={0}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
            <div>
              <label htmlFor="heightInchesPart" className="block text-sm font-medium text-slate-700">
                Height (in)
              </label>
              <input
                id="heightInchesPart"
                name="heightInchesPart"
                type="number"
                inputMode="numeric"
                min={0}
                max={11}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
            <div>
              <label htmlFor="weightLbs" className="block text-sm font-medium text-slate-700">
                Weight (lbs)
              </label>
              <input
                id="weightLbs"
                name="weightLbs"
                type="number"
                inputMode="numeric"
                min={0}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
          </div>

          {isCollege && (
            <div>
              <label htmlFor="collegeYear" className="block text-sm font-medium text-slate-700">
                Year
              </label>
              <select
                id="collegeYear"
                name="collegeYear"
                defaultValue=""
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value="">—</option>
                {[1, 2, 3, 4, 5, 6].map((year) => (
                  <option key={year} value={year}>
                    Year {year}
                  </option>
                ))}
              </select>
            </div>
          )}

          <fieldset>
            <legend className="block text-sm font-medium text-slate-700">
              Position(s)
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {POSITIONS.map((position) => (
                <label
                  key={position}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm has-checked:border-slate-900 has-checked:bg-slate-900 has-checked:text-white"
                >
                  <input
                    type="checkbox"
                    name="positions"
                    value={position}
                    className="sr-only"
                  />
                  {position}
                </label>
              ))}
            </div>
          </fieldset>

          {isYouth && (
            <details className="rounded-lg border border-slate-200 p-3">
              <summary className="cursor-pointer text-sm font-medium text-slate-700">
                Parent/guardian &amp; emergency info (optional)
              </summary>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <input
                    name="guardian1Name"
                    type="text"
                    placeholder="Parent/guardian 1 name"
                    autoComplete="off"
                    className="col-span-3 rounded-lg border border-slate-300 px-3 py-2.5 text-sm sm:col-span-1 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                  <input
                    name="guardian1Phone"
                    type="tel"
                    placeholder="Phone"
                    autoComplete="off"
                    className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                  <input
                    name="guardian1Email"
                    type="email"
                    placeholder="Email"
                    autoComplete="off"
                    className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    name="guardian2Name"
                    type="text"
                    placeholder="Parent/guardian 2 name"
                    autoComplete="off"
                    className="col-span-3 rounded-lg border border-slate-300 px-3 py-2.5 text-sm sm:col-span-1 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                  <input
                    name="guardian2Phone"
                    type="tel"
                    placeholder="Phone"
                    autoComplete="off"
                    className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                  <input
                    name="guardian2Email"
                    type="email"
                    placeholder="Email"
                    autoComplete="off"
                    className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="emergencyMedicalNotes"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Emergency contact / medical notes
                  </label>
                  <textarea
                    id="emergencyMedicalNotes"
                    name="emergencyMedicalNotes"
                    rows={2}
                    placeholder="Allergies, conditions, alternate emergency contact, etc."
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>
              </div>
            </details>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 px-4 py-3 text-base font-medium text-white active:bg-slate-700 sm:w-auto"
          >
            Add player
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900">
          Roster ({team.players.length})
        </h2>
        {team.players.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            No players yet. Add the roster above.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {team.players.map((player) => (
              <li
                key={player.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {player.jerseyNumber !== null && (
                      <span className="text-slate-500">#{player.jerseyNumber} </span>
                    )}
                    {player.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {[
                      player.positions.join(", "),
                      isYouth && player.dateOfBirth
                        ? `Age ${calculateAge(player.dateOfBirth).toFixed(2)}`
                        : null,
                      isCollege && player.collegeYear !== null
                        ? `Yr ${player.collegeYear}`
                        : null,
                      player.heightInches !== null
                        ? formatHeight(player.heightInches)
                        : null,
                      player.weightLbs !== null ? `${player.weightLbs} lbs` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                </div>
                <form action={deleteTeamPlayer}>
                  <input type="hidden" name="id" value={player.id} />
                  <input type="hidden" name="teamId" value={team.id} />
                  <ConfirmSubmitButton
                    confirmMessage={`Remove ${player.name} from ${team.name}?`}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 active:bg-red-50"
                  >
                    Remove
                  </ConfirmSubmitButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
