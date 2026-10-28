"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@insforge/sdk/ssr";

export type SessionUser = { id: string; email?: string | null; profile?: { name?: string | null; avatar_url?: string | null } | null };

let client: ReturnType<typeof createBrowserClient> | undefined;
let pending: Promise<SessionUser | null> | undefined;

// One lookup per page load, shared by every component that needs it (nav, generator, CTAs).
function loadUser() {
  pending ??= (async () => {
    try {
      client ??= createBrowserClient();
      const { data } = await client.auth.getCurrentUser();
      return (data?.user as SessionUser | null) ?? null;
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
