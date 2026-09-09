"use client";

import { useActionState } from "react";
import { addPlay, type AddPlayState } from "@/app/(app)/teams/[teamId]/games/[gameId]/actions";
import { GAME_SIDE_LABELS, PLAY_TYPE_LABELS } from "@/lib/constants";

type Player = { id: string; name: string; jerseyNumber: number | null };

const initialState: AddPlayState = { ok: false };

function playerLabel(player: Player): string {
  return player.jerseyNumber !== null ? `#${player.jerseyNumber} ${player.name}` : player.name;
}

function RoleSelect({ name, label, players }: { name: string; label: string; players: Player[] }) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-medium text-slate-600">
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue=""
        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
      >
        <option value="">—</option>
        {players.map((player) => (
          <option key={player.id} value={player.id}>
            {playerLabel(player)}
          </option>
        ))}
      </select>
    </div>
  );
}

export function PlayForm({
  teamId,
  gameId,
  players,
}: {
  teamId: string;
  gameId: string;
  players: Player[];
}) {
  const [state, formAction, pending] = useActionState(addPlay, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="teamId" value={teamId} />
      <input type="hidden" name="gameId" value={gameId} />

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="quarter" className="block text-sm font-medium text-slate-700">
            Quarter
          </label>
          <input
            id="quarter"
            name="quarter"
            type="number"
            inputMode="numeric"
            min={1}
            max={5}
            required
            defaultValue={1}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
        <div>
          <label htmlFor="down" className="block text-sm font-medium text-slate-700">
            Down
          </label>
          <input
            id="down"
            name="down"
            type="number"
            inputMode="numeric"
            min={1}
            max={4}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
        <div>
          <label htmlFor="distance" className="block text-sm font-medium text-slate-700">
            To go
          </label>
          <input
            id="distance"
            name="distance"
            type="number"
            inputMode="numeric"
            min={0}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="side" className="block text-sm font-medium text-slate-700">
          Side of ball
        </label>
        <select
          id="side"
          name="side"
          required
          defaultValue=""
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          <option value="" disabled>
            Select side
          </option>
          {Object.entries(GAME_SIDE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="playType" className="block text-sm font-medium text-slate-700">
          Play type
        </label>
        <select
          id="playType"
          name="playType"
          required
          defaultValue=""
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          <option value="" disabled>
            Select play type
          </option>
          {Object.entries(PLAY_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="formation" className="block text-sm font-medium text-slate-700">
          Formation (optional)
        </label>
        <input
          id="formation"
          name="formation"
          type="text"
          autoComplete="off"
          placeholder="e.g. Shotgun, I-Form, 4-3"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-base focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="yardsGained" className="block text-sm font-medium text-slate-700">
            Yards (+/-)
          </label>
          <input
            id="yardsGained"
            name="yardsGained"
            type="number"
            inputMode="numeric"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-base focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
        <div className="flex items-end pb-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" name="fumble" className="h-4 w-4" />
            Fumble
          </label>
        </div>
      </div>

      <fieldset className="rounded-lg border border-slate-200 p-3">
        <legend className="px-1 text-sm font-medium text-slate-700">Who was involved</legend>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <RoleSelect name="ballCarrierId" label="Ball carrier" players={players} />
          <RoleSelect name="passerId" label="Passer" players={players} />
          <RoleSelect name="receiverId" label="Receiver" players={players} />
          <RoleSelect name="tackleId" label="Tackle" players={players} />
        </div>
      </fieldset>

      <details className="rounded-lg border border-slate-200 p-3">
        <summary className="cursor-pointer text-sm font-medium text-slate-700">
          More roles &amp; scoring (optional)
        </summary>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <RoleSelect name="assistTackleId" label="Assist tackle" players={players} />
            <RoleSelect name="sackId" label="Sack" players={players} />
            <RoleSelect name="forcedFumbleId" label="Forced fumble" players={players} />
            <RoleSelect name="fumbleRecoveryId" label="Fumble recovery" players={players} />
            <RoleSelect name="interceptionId" label="Interception" players={players} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-600">
              If this play scored, enter the score right after it
            </p>
            <div className="mt-1 grid grid-cols-2 gap-3">
              <input
                name="teamScoreAfter"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="Our score"
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
              <input
                name="opponentScoreAfter"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="Opponent score"
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
        </div>
      </details>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="text-sm text-green-600" role="status">
          Play saved.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-slate-900 px-4 py-3 text-base font-medium text-white active:bg-slate-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save play"}
      </button>
    </form>
  );
}
