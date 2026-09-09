"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addTestResult, type AddResultState } from "@/app/(app)/actions";
import { PAD_LEVEL_LABELS } from "@/lib/format";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

type Player = { id: string; name: string; jerseyNumber: number | null };
type TestType = {
  id: string;
  name: string;
  unit: string;
  valueType: "TIME" | "DISTANCE";
};

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
  const secondsRef = useRef<HTMLInputElement>(null);
  const feetRef = useRef<HTMLInputElement>(null);
  const inchesRef = useRef<HTMLInputElement>(null);

  const [testTypeId, setTestTypeId] = useState(testTypes[0]?.id ?? "");
  const selectedTest = testTypes.find((t) => t.id === testTypeId);
  const isDistance = selectedTest?.valueType === "DISTANCE";

  useEffect(() => {
    if (state.ok) {
      if (secondsRef.current) secondsRef.current.value = "";
      if (feetRef.current) feetRef.current.value = "";
      if (inchesRef.current) inchesRef.current.value = "";
      if (dateRef.current) dateRef.current.value = todayIso();
      (secondsRef.current ?? feetRef.current)?.focus();
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
          value={testTypeId}
          onChange={(e) => setTestTypeId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          {testTypes.map((testType) => (
            <option key={testType.id} value={testType.id}>
              {testType.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="padLevel" className="block text-sm font-medium text-slate-700">
          Pads/helmet
        </label>
        <select
          id="padLevel"
          name="padLevel"
          required
          defaultValue=""
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          <option value="" disabled>
            Select pad level
          </option>
          {Object.entries(PAD_LEVEL_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {isDistance ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="valueFeet" className="block text-sm font-medium text-slate-700">
              Feet
            </label>
            <input
              ref={feetRef}
              id="valueFeet"
              name="valueFeet"
              type="number"
              inputMode="numeric"
              min={0}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-base focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label htmlFor="valueInches" className="block text-sm font-medium text-slate-700">
              Inches
            </label>
            <input
              ref={inchesRef}
              id="valueInches"
              name="valueInches"
              type="number"
              step="0.25"
              min={0}
              max={11.75}
              inputMode="decimal"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-base focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
        </div>
      ) : (
        <div>
          <label htmlFor="valueSeconds" className="block text-sm font-medium text-slate-700">
            Result (seconds)
          </label>
          <input
            ref={secondsRef}
            id="valueSeconds"
            name="valueSeconds"
            type="number"
            step="0.01"
            inputMode="decimal"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-base focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
      )}

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
