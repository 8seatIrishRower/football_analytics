"use client";

import { useActionState, useEffect, useRef } from "react";
import { addTestResult, type AddResultState } from "@/app/(app)/actions";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

type Player = { id: string; name: string; jerseyNumber: number | null };
type TestType = { id: string; name: string; unit: string };

const initialState: AddResultState = { ok: false };

export function EntryForm({
  players,
  testTypes,
}: {
  players: Player[];
  testTypes: TestType[];
}) {
  const [state, formAction, pending] = useActionState(addTestResult, initialState);
  const dateRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.ok) {
      if (valueRef.current) valueRef.current.value = "";
      if (dateRef.current) dateRef.current.value = todayIso();
      valueRef.current?.focus();
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="playerId" className="block text-sm font-medium text-slate-700">
          Player
        </label>
        <select
          id="playerId"
          name="playerId"
          required
          defaultValue=""
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          <option value="" disabled>
            Select a player
          </option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.jerseyNumber !== null ? `#${player.jerseyNumber} ` : ""}
              {player.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="testTypeId" className="block text-sm font-medium text-slate-700">
          Test
        </label>
        <select
          id="testTypeId"
          name="testTypeId"
          required
          defaultValue={testTypes[0]?.id ?? ""}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          {testTypes.map((testType) => (
            <option key={testType.id} value={testType.id}>
              {testType.name} ({testType.unit})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="value" className="block text-sm font-medium text-slate-700">
            Result
          </label>
          <input
            ref={valueRef}
            id="value"
            name="value"
            type="number"
            step="0.01"
            inputMode="decimal"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-base focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
        <div>
          <label htmlFor="recordedOn" className="block text-sm font-medium text-slate-700">
            Date
          </label>
          <input
            ref={dateRef}
            id="recordedOn"
            name="recordedOn"
            type="date"
            required
            defaultValue={todayIso()}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-base focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="text-sm text-green-600" role="status">
          Saved.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-slate-900 px-4 py-3 text-base font-medium text-white active:bg-slate-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save result"}
      </button>
    </form>
  );
}
