"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";

// Anonymous page views always; a per-tab session id (unique visitors) only after "accept all".
function sessionId() {
  try {
    if (localStorage.getItem("consent.v1") !== "all") return undefined;
    let id = sessionStorage.getItem("sid");
    if (!id) { id = crypto.randomUUID(); sessionStorage.setItem("sid", id); }
    return id;
  } catch { return undefined; }
}

export function track(name: string, data: Record<string, string | undefined> = {}) {
  const body = JSON.stringify({ name, path: location.pathname, session_id: sessionId(), ...data });
  if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
    fetch("/api/track", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true }).catch(() => {});
  }
}

export function Analytics() {
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    if (document.querySelector("meta[name=robots][content*=noindex]")) return;
    track("pageview", { locale, referrer: document.referrer || undefined });
  }, [pathname, locale]);

  useEffect(() => {
    const onDownload = (e: Event) => {
      const d = (e as CustomEvent<{ type?: string; fmt?: string }>).detail ?? {};
      track("qr_download", { locale, qr_type: d.type, fmt: d.fmt });
    };
    window.addEventListener("qr:downloaded", onDownload);
    return () => window.removeEventListener("qr:downloaded", onDownload);
  }, [locale]);

  return null;
}
