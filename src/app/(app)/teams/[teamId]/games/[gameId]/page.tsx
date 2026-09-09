import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PlayForm } from "@/components/play-form";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import {
  PLAY_TYPE_LABELS,
  GAME_SIDE_LABELS,
  PARTICIPANT_ROLE_LABELS,
} from "@/lib/constants";
import { updateGameScore } from "../actions";
import { deletePlay } from "./actions";

export const dynamic = "force-dynamic";

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ teamId: string; gameId: string }>;
}) {
  const { teamId, gameId } = await params;

  const [team, game] = await Promise.all([
    prisma.team.findUnique({
      where: { id: teamId },
      include: { players: { orderBy: [{ jerseyNumber: "asc" }, { name: "asc" }] } },
    }),
    prisma.game.findUnique({
      where: { id: gameId },
      include: {
        plays: {
          include: { participants: { include: { player: true } } },
          orderBy: { playNumber: "asc" },
        },
      },
    }),
  ]);

  if (!team || !game || game.teamId !== teamId) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/teams/${teamId}`} className="text-sm text-slate-500">
          ← {team.name}
        </Link>
        <h1 className="mt-1 text-lg font-semibold text-slate-900">
          vs {game.opponentName}
        </h1>
        <p className="text-sm text-slate-500">{game.playedOn.toISOString().slice(0, 10)}</p>

        <form action={updateGameScore} className="mt-3 flex items-end gap-3">
          <input type="hidden" name="id" value={game.id} />
          <input type="hidden" name="teamId" value={teamId} />
          <div>
            <label htmlFor="teamScore" className="block text-xs font-medium text-slate-600">
              {team.name}
            </label>
            <input
              id="teamScore"
              name="teamScore"
              type="number"
              inputMode="numeric"
              min={0}
              defaultValue={game.teamScore ?? ""}
              className="mt-1 w-20 rounded-lg border border-slate-300 px-2 py-2 text-base"
            />
          </div>
          <div>
            <label htmlFor="opponentScore" className="block text-xs font-medium text-slate-600">
              {game.opponentName}
            </label>
            <input
              id="opponentScore"
              name="opponentScore"
              type="number"
              inputMode="numeric"
              min={0}
              defaultValue={game.opponentScore ?? ""}
              className="mt-1 w-20 rounded-lg border border-slate-300 px-2 py-2 text-base"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 active:bg-slate-100"
          >
            Update score
          </button>
        </form>
      </div>

      {team.players.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-sm text-slate-600">
            Add {team.name}&apos;s roster before charting plays, so you can attribute
            plays to specific players.
          </p>
          <Link
            href={`/teams/${teamId}/roster`}
            className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white active:bg-slate-700"
          >
            Add roster
          </Link>
        </div>
      ) : (
        <section>
          <h2 className="text-base font-semibold text-slate-900">
            Log play #{game.plays.length + 1}
          </h2>
          <div className="mt-4">
            <PlayForm teamId={teamId} gameId={gameId} players={team.players} />
          </div>
        </section>
      )}

      <section>
        <h2 className="text-base font-semibold text-slate-900">
          Plays ({game.plays.length})
        </h2>
        {game.plays.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No plays logged yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {game.plays.map((play) => (
              <li key={play.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      #{play.playNumber} · Q{play.quarter}
                      {play.down && play.distance !== null
                        ? ` · ${play.down}${["st", "nd", "rd"][play.down - 1] ?? "th"} & ${play.distance}`
                        : ""}{" "}
                      · {GAME_SIDE_LABELS[play.side]}
                    </p>
                    <p className="text-sm text-slate-600">
                      {PLAY_TYPE_LABELS[play.playType]}
                      {play.formation ? ` (${play.formation})` : ""}
                      {play.yardsGained !== null ? ` — ${play.yardsGained} yds` : ""}
                      {play.fumble ? " — FUMBLE" : ""}
                    </p>
                    {play.participants.length > 0 && (
                      <p className="mt-1 text-xs text-slate-500">
                        {play.participants
                          .map(
                            (p) =>
                              `${PARTICIPANT_ROLE_LABELS[p.role]}: ${p.player.name}`,
                          )
                          .join(" · ")}
                      </p>
                    )}
                    {(play.teamScoreAfter !== null || play.opponentScoreAfter !== null) && (
                      <p className="mt-1 text-xs font-medium text-slate-700">
                        Score: {play.teamScoreAfter ?? "?"}-{play.opponentScoreAfter ?? "?"}
                      </p>
                    )}
                    {play.notes && (
                      <p className="mt-1 text-xs italic text-slate-500">{play.notes}</p>
                    )}
                  </div>
                  <form action={deletePlay}>
                    <input type="hidden" name="id" value={play.id} />
                    <input type="hidden" name="teamId" value={teamId} />
                    <input type="hidden" name="gameId" value={gameId} />
                    <ConfirmSubmitButton
                      confirmMessage="Delete this play?"
                      className="shrink-0 text-xs text-red-600"
                    >
                      Delete
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
