"use client";

import { useEffect, useState } from "react";

export type SessionUser = { id: string; email?: string | null; profile?: { name?: string | null; avatar_url?: string | null } | null };

let pending: Promise<SessionUser | null> | undefined;

// One lookup per page load, shared by every component that needs it (nav, generator, CTAs).
// Asked of the server: the session cookies are httpOnly, so the browser SDK can't see them.
function loadUser() {
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
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    loadUser().then((u) => live && setUser(u));
    return () => { live = false; };
  }, []);
  return user;
}
