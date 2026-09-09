"use client";

import { useMemo, useState } from "react";
import { deleteTestResult } from "@/app/(app)/actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { formatTestValue } from "@/lib/format";

type Row = {
  id: string;
  playerName: string;
  jerseyNumber: number | null;
  testTypeName: string;
  valueType: "TIME" | "DISTANCE";
  value: number;
  padLevel: string;
  recordedOn: string;
};

type SortKey = "player" | "test" | "value" | "padLevel" | "date";

const columns: { key: SortKey; label: string }[] = [
  { key: "player", label: "Player" },
  { key: "test", label: "Test" },
  { key: "value", label: "Result" },
  { key: "padLevel", label: "Pads" },
  { key: "date", label: "Date" },
];

function sortValue(row: Row, key: SortKey): string | number {
  switch (key) {
    case "player":
      return row.playerName.toLowerCase();
    case "test":
      return row.testTypeName.toLowerCase();
    case "value":
      return row.value;
    case "padLevel":
      return row.padLevel;
    case "date":
      return row.recordedOn;
  }
}

export function ResultsTable({ results }: { results: Row[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    const copy = [...results];
    copy.sort((a, b) => {
      const av = sortValue(a, sortKey);
      const bv = sortValue(b, sortKey);
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortAsc ? cmp : -cmp;
    });
    return copy;
  }, [results, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortAsc((asc) => !asc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {columns.map((column) => (
              <th key={column.key} className="px-3 py-2 font-medium text-slate-600">
                <button
                  type="button"
                  onClick={() => toggleSort(column.key)}
                  className="flex items-center gap-1"
                >
                  {column.label}
                  {sortKey === column.key && (
                    <span aria-hidden>{sortAsc ? "▲" : "▼"}</span>
                  )}
                </button>
              </th>
            ))}
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sorted.map((row) => (
            <tr key={row.id}>
              <td className="px-3 py-2 whitespace-nowrap">
                {row.jerseyNumber !== null && (
                  <span className="text-slate-500">#{row.jerseyNumber} </span>
                )}
                {row.playerName}
              </td>
              <td className="px-3 py-2 whitespace-nowrap">{row.testTypeName}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                {formatTestValue(row.value, row.valueType)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap">{row.padLevel}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.recordedOn}</td>
              <td className="px-3 py-2 text-right">
                <form action={deleteTestResult}>
                  <input type="hidden" name="id" value={row.id} />
                  <ConfirmSubmitButton
                    confirmMessage="Delete this result?"
                    className="text-red-600"
                  >
                    Delete
                  </ConfirmSubmitButton>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
