import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getMyTeam } from "@/lib/my-team";
import { EntryForm } from "@/components/entry-form";

// This page reads live data straight from Postgres on every request; it
// must never be served from a stale build-time snapshot.
export const dynamic = "force-dynamic";

export default async function EntryPage() {
  const myTeam = await getMyTeam();
  const [players, testTypes] = await Promise.all([
    myTeam
      ? prisma.player.findMany({
          where: { teamId: myTeam.id },
          select: { id: true, name: true, jerseyNumber: true },
          orderBy: [{ jerseyNumber: "asc" }, { name: "asc" }],
        })
      : Promise.resolve([]),
    prisma.testType.findMany({
      select: { id: true, name: true, unit: true, valueType: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  if (players.length === 0 || testTypes.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
        <h1 className="text-lg font-semibold text-slate-900">
          Let&apos;s get set up
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {players.length === 0
            ? "You need at least one player before recording results."
            : "No test types are set up yet."}
        </p>
        {players.length === 0 && (
          <Link
            href="/players"
            className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white active:bg-slate-700"
          >
            Add players
          </Link>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-900">Record a result</h1>
      <p className="mt-1 text-sm text-slate-500">
        Pick the player and test, enter the result, and save.
      </p>
      <div className="mt-6">
        <EntryForm players={players} testTypes={testTypes} />
      </div>
    </div>
  );
}
