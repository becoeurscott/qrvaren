"use client";

import { useState } from "react";
import { signOut } from "@/app/actions/auth";
import { useSession } from "@/shared/useSession";

/** "Log out", shown only once signed in. Reloads the home page so the whole site sees the signed-out state. */
export function LogoutButton({ label, locale, className }: { label: string; locale: string; className?: string }) {
  const user = useSession();
  const [busy, setBusy] = useState(false);
  if (!user) return null;
  return (
    <button type="button" disabled={busy} className={className}
      onClick={async () => {
        setBusy(true);
        try { await signOut(); } finally { window.location.assign(`/${locale}`); }
      }}>
      {busy ? "…" : label}
    </button>
  );
}
