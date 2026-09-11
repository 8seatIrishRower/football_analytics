"use client";

import { useActionState, useState } from "react";
import {
  importRosterFromCsv,
  type ImportRosterState,
} from "@/app/(app)/teams/[teamId]/roster/actions";
import { ROSTER_CSV_COLUMNS } from "@/lib/roster-csv";

const initialState: ImportRosterState = { ok: false };

const TEMPLATE_HEADER = ROSTER_CSV_COLUMNS.join(",");

export function RosterCsvImportForm({ teamId }: { teamId: string }) {
  const [state, formAction, pending] = useActionState(importRosterFromCsv, initialState);
  const [csvText, setCsvText] = useState("");

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setCsvText(await file.text());
  }

  return (
    <details className="rounded-lg border border-slate-200 p-3">
      <summary className="cursor-pointer text-sm font-medium text-slate-700">
        Import roster from CSV
      </summary>
      <form action={formAction} className="mt-4 space-y-3">
        <input type="hidden" name="teamId" value={teamId} />
        <input type="hidden" name="csv" value={csvText} />

        <div>
          <label htmlFor="rosterCsvFile" className="block text-sm font-medium text-slate-700">
            CSV file
          </label>
          <input
            id="rosterCsvFile"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
          />
        </div>

        <div>
          <label htmlFor="rosterCsvPaste" className="block text-sm font-medium text-slate-700">
            Or paste CSV text
          </label>
          <textarea
            id="rosterCsvPaste"
            rows={6}
            value={csvText}
            onChange={(event) => setCsvText(event.target.value)}
            placeholder={TEMPLATE_HEADER}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-xs focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          <p className="mt-1 text-xs text-slate-500">
            First row must be a header with these column names (only <code>name</code> is
            required):
            <br />
            <code className="break-all">{TEMPLATE_HEADER}</code>
            <br />
            <code>positions</code> accepts multiple values separated by <code>;</code> (e.g.{" "}
            <code>QB;ATH</code>). <code>height</code> accepts <code>6-3</code> or a total number
            of inches.
          </p>
        </div>

        {state.error && (
          <p className="text-sm text-red-600" role="alert">
            {state.error}
          </p>
        )}
        {state.ok && (
          <div className="text-sm text-green-600" role="status">
            <p>Imported {state.imported} player(s).</p>
            {state.warnings && state.warnings.length > 0 && (
              <ul className="mt-1 list-disc pl-5 text-amber-600">
                {state.warnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={pending || !csvText.trim()}
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 active:bg-slate-100 disabled:opacity-60"
        >
          {pending ? "Importing…" : "Import CSV"}
        </button>
      </form>
    </details>
  );
}
