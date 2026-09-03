import { isAuthSecretConfigured, isCoachPasswordConfigured } from "@/lib/auth";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>;
}) {
  const params = await searchParams;
  const from = params.from && params.from.startsWith("/") ? params.from : "/";

  const missing: string[] = [];
  if (!isCoachPasswordConfigured()) missing.push("COACH_PASSWORD");
  if (!isAuthSecretConfigured()) missing.push("AUTH_SECRET");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Youth Football Tracker
        </h1>

        {missing.length > 0 ? (
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-medium">Setup needed</p>
            <p className="mt-1">
              This app is missing a required setting on the server:{" "}
              <strong>{missing.join(" and ")}</strong>.
            </p>
            <p className="mt-2">
              In Vercel, go to your project&apos;s Settings → Environment
              Variables, add {missing.length > 1 ? "these" : "this"} value
              {missing.length > 1 ? "s" : ""}, then redeploy.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-slate-500">
              Enter the coach password to continue.
            </p>

            <form action={login} className="mt-6 space-y-4">
              <input type="hidden" name="from" value={from} />
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoFocus
                  autoComplete="current-password"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-base focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>

              {params.error && (
                <p className="text-sm text-red-600" role="alert">
                  That password isn&apos;t right. Try again.
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-slate-900 px-4 py-3 text-base font-medium text-white active:bg-slate-700"
              >
                Log in
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
