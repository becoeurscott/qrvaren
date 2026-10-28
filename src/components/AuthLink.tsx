"use client";

import { Link } from "@/i18n/routing";
import { useSession } from "@/shared/useSession";

/** "Log in" for visitors, "Dashboard" (with initial) once signed in. */
export function AuthLink({ login, dashboard, className }: { login: string; dashboard: string; className?: string }) {
  const user = useSession();
  if (user) {
    const initial = (user.profile?.name || user.email || "?").trim().charAt(0).toUpperCase();
    return (
      <Link href="/dashboard" className={`flex items-center gap-2 ${className ?? ""}`}>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime text-xs font-bold text-ink" aria-hidden>{initial}</span>
        {dashboard}
      </Link>
    );
  }
  return <Link href="/login" className={className}>{login}</Link>;
}
