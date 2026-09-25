"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RealtimeRefresh } from "@/components/RealtimeRefresh";

const MENU = [
  { href: "/", label: "หน้าแรก" },
  { href: "/reports", label: "รายงาน" },
  { href: "/urgent", label: "เร่งด่วน" },
  { href: "/history", label: "ประวัติ" },
] as const;

export function NavBar({ urgentCount }: { urgentCount: number }) {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="hidden shrink-0 py-3 text-sm font-semibold text-zinc-900 sm:block dark:text-zinc-50"
        >
          Tanky Support
        </Link>
        <ul className="flex flex-1 gap-1 overflow-x-auto sm:justify-end">
          {MENU.map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`relative flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                      : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  {label}
                  {href === "/urgent" && urgentCount > 0 && (
                    <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                      {urgentCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
        <RealtimeRefresh />
      </div>
    </nav>
  );
}
