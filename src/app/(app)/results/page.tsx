import { prisma } from "@/lib/prisma";
import { ResultsTable } from "@/components/results-table";
import { formatTestValue, PAD_LEVEL_LABELS } from "@/lib/format";

// Always reflect the latest recorded results, never a build-time snapshot.
export const dynamic = "force-dynamic";

type Standing = {
  playerId: string;
  playerName: string;
  jerseyNumber: number | null;
  bestValue: number;
};

export default async function ResultsPage() {
  const [testTypes, results] = await Promise.all([
    prisma.testType.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.testResult.findMany({
      include: { player: true, testType: true },
      orderBy: { recordedOn: "desc" },
    }),
  ]);

  if (results.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
        <h1 className="text-lg font-semibold text-slate-900">No results yet</h1>
        <p className="mt-2 text-sm text-slate-600">
          Results you record on the Entry tab will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Team standings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ranked by each player&apos;s best recorded result.
        </p>
      </div>

      {testTypes.map((testType) => {
        const byPlayer = new Map<string, Standing>();
        for (const result of results) {
          if (result.testTypeId !== testType.id) continue;
          const existing = byPlayer.get(result.playerId);
          const isBetter =
            !existing ||
            (testType.lowerIsBetter
              ? result.value < existing.bestValue
              : result.value > existing.bestValue);
          if (isBetter) {
            byPlayer.set(result.playerId, {
              playerId: result.playerId,
              playerName: result.player.name,
              jerseyNumber: result.player.jerseyNumber,
              bestValue: result.value,
            });
          }
        }

        const standings = Array.from(byPlayer.values()).sort((a, b) =>
          testType.lowerIsBetter ? a.bestValue - b.bestValue : b.bestValue - a.bestValue,
        );

        if (standings.length === 0) return null;

        const average =
          standings.reduce((sum, s) => sum + s.bestValue, 0) / standings.length;

        return (
          <section key={testType.id}>
            <div className="flex items-baseline justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                {testType.name}
              </h2>
              <p className="text-sm text-slate-500">
                Team avg: {formatTestValue(average, testType.valueType)}
              </p>
            </div>
            <ol className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              {standings.map((standing, index) => (
                <li
                  key={standing.playerId}
                  className="flex items-center justify-between gap-3 px-4 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-sm font-semibold text-slate-400">
                      {index + 1}
                    </span>
                    <span className="font-medium text-slate-900">
                      {standing.jerseyNumber !== null && (
                        <span className="text-slate-500">#{standing.jerseyNumber} </span>
                      )}
                      {standing.playerName}
                    </span>
                  </div>
                  <span className="text-sm text-slate-700">
                    {formatTestValue(standing.bestValue, testType.valueType)}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        );
      })}

      <section>
        <h2 className="text-lg font-semibold text-slate-900">All results</h2>
        <p className="mt-1 text-sm text-slate-500">Tap a column to sort.</p>
        <div className="mt-3">
          <ResultsTable
            results={results.map((r) => ({
              id: r.id,
              playerName: r.player.name,
              jerseyNumber: r.player.jerseyNumber,
              testTypeName: r.testType.name,
              valueType: r.testType.valueType,
              value: r.value,
              padLevel: r.padLevel ? PAD_LEVEL_LABELS[r.padLevel] : "—",
              recordedOn: r.recordedOn.toISOString().slice(0, 10),
            }))}
          />
        </div>
      </section>
    </div>
  );
}
