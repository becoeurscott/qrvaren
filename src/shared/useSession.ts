"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type SessionUser = { id: string; email?: string | null; profile?: { name?: string | null; avatar_url?: string | null } | null };

let pending: Promise<SessionUser | null> | undefined;
let pendingPath: string | undefined;

// One lookup per route, shared by every component that needs it (nav, generator, CTAs).
// Re-asked on navigation so sign-in/out (server actions + client redirect) shows up in the
// persistent nav. Asked of the server: the session cookies are httpOnly.
function loadUser(path: string) {
  if (pendingPath !== path) {
    pending = undefined;
    pendingPath = path;
  }
  pending ??= (async () => {
    try {
      const r = await fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" });
      if (!r.ok) return null;
      return ((await r.json()) as { user: SessionUser | null }).user;
    } catch {
      return null;
    }
  })();
  return pending;
}

/** undefined while loading, null when signed out. Static pages stay static: this runs in the browser. */
export function useSession() {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    loadUser(pathname).then((u) => live && setUser(u));
    return () => { live = false; };
  }, [pathname]);
  return user;
}
