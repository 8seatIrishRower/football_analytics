import { prisma } from "@/lib/prisma";
import { POSITIONS } from "@/lib/constants";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { addPlayer, deletePlayer } from "./actions";

// Always reflect the current roster, never a build-time snapshot.
export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const players = await prisma.player.findMany({
    orderBy: [{ jerseyNumber: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-lg font-semibold text-slate-900">Add a player</h1>
        <form action={addPlayer} className="mt-4 space-y-4">
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
            <div>
              <label htmlFor="birthYear" className="block text-sm font-medium text-slate-700">
                Birth year
              </label>
              <input
                id="birthYear"
                name="birthYear"
                type="number"
                inputMode="numeric"
                min={2000}
                max={2025}
                placeholder="e.g. 2018"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
          </div>

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

          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 px-4 py-3 text-base font-medium text-white active:bg-slate-700 sm:w-auto"
          >
            Add player
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">
          Roster ({players.length})
        </h2>
        {players.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            No players yet. Add your first player above.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {players.map((player) => (
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
                    {[player.positions.join(", "), player.birthYear]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                </div>
                <form action={deletePlayer}>
                  <input type="hidden" name="id" value={player.id} />
                  <ConfirmSubmitButton
                    confirmMessage={`Remove ${player.name} and all of their recorded results?`}
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
