import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TEAM_LEVEL_LABELS } from "@/lib/constants";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { addTeam, deleteTeam } from "./actions";

// Always reflect the current team list, never a build-time snapshot.
export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const teams = await prisma.team.findMany({
    include: { _count: { select: { players: true, games: true } } },
    orderBy: [{ level: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-lg font-semibold text-slate-900">Add a team</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your own team, or any other team whose games you want to chart.
        </p>
        <form action={addTeam} className="mt-4 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">
              Team name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="off"
              placeholder="e.g. Notre Dame"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-slate-700">
              Level
            </label>
            <select
              id="level"
              name="level"
              required
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              <option value="" disabled>
                Select a level
              </option>
              {Object.entries(TEAM_LEVEL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 px-4 py-3 text-base font-medium text-white active:bg-slate-700 sm:w-auto"
          >
            Add team
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Teams ({teams.length})</h2>
        {teams.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No teams yet. Add one above.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {teams.map((team) => (
              <li key={team.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <Link href={`/teams/${team.id}`} className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{team.name}</p>
                  <p className="text-sm text-slate-500">
                    {TEAM_LEVEL_LABELS[team.level]} · {team._count.players} player
                    {team._count.players === 1 ? "" : "s"} · {team._count.games} game
                    {team._count.games === 1 ? "" : "s"}
                  </p>
                </Link>
                <form action={deleteTeam}>
                  <input type="hidden" name="id" value={team.id} />
                  <ConfirmSubmitButton
                    confirmMessage={`Remove ${team.name} and all of its players and games?`}
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
