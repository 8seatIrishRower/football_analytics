import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TEAM_LEVEL_LABELS } from "@/lib/constants";
import { addGame } from "./games/actions";

export const dynamic = "force-dynamic";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      games: { orderBy: { playedOn: "desc" } },
      _count: { select: { players: true } },
    },
  });

  if (!team) notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{team.name}</h1>
        <p className="mt-1 text-sm text-slate-500">{TEAM_LEVEL_LABELS[team.level]}</p>
        <Link
          href={`/teams/${team.id}/roster`}
          className="mt-3 inline-block rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 active:bg-slate-100"
        >
          Roster ({team._count.players})
        </Link>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Add a game</h2>
        <form action={addGame} className="mt-4 space-y-4">
          <input type="hidden" name="teamId" value={team.id} />
          <div>
            <label htmlFor="opponentName" className="block text-sm font-medium text-slate-700">
              Opponent
            </label>
            <input
              id="opponentName"
              name="opponentName"
              type="text"
              required
              autoComplete="off"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label htmlFor="playedOn" className="block text-sm font-medium text-slate-700">
              Date
            </label>
            <input
              id="playedOn"
              name="playedOn"
              type="date"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="teamScore" className="block text-sm font-medium text-slate-700">
                {team.name} score
              </label>
              <input
                id="teamScore"
                name="teamScore"
                type="number"
                inputMode="numeric"
                min={0}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
            <div>
              <label htmlFor="opponentScore" className="block text-sm font-medium text-slate-700">
                Opponent score
              </label>
              <input
                id="opponentScore"
                name="opponentScore"
                type="number"
                inputMode="numeric"
                min={0}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Scores are optional — leave blank if the game hasn&apos;t finished or
            you&apos;ll fill them in later.
          </p>
          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 px-4 py-3 text-base font-medium text-white active:bg-slate-700 sm:w-auto"
          >
            Add game &amp; start charting
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">
          Games ({team.games.length})
        </h2>
        {team.games.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No games yet. Add one above.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {team.games.map((game) => (
              <li key={game.id}>
                <Link
                  href={`/teams/${team.id}/games/${game.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">vs {game.opponentName}</p>
                    <p className="text-sm text-slate-500">
                      {game.playedOn.toISOString().slice(0, 10)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    {game.teamScore !== null && game.opponentScore !== null
                      ? `${game.teamScore}-${game.opponentScore}`
                      : "—"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
