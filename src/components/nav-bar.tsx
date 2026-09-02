import Link from "next/link";
import { logout } from "@/app/login/actions";

const links = [
  { href: "/", label: "Entry" },
  { href: "/players", label: "Players" },
  { href: "/results", label: "Results" },
];

export function NavBar() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-4 py-3">
        <nav className="flex gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 active:bg-slate-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 active:bg-slate-100"
          >
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}
