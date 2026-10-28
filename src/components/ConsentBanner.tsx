"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const KEY = "consent.v1";

export function ConsentBanner() {
  const t = useTranslations("consent");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { setOpen(!localStorage.getItem(KEY)); } catch { setOpen(true); }
  }, []);

  const choose = (v: "all" | "essential") => {
    try { localStorage.setItem(KEY, v); } catch {}
    window.dispatchEvent(new CustomEvent("consent", { detail: v }));
    setOpen(false);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-2xl flex-col gap-3 rounded-3xl bg-ink p-4 text-xs text-white shadow-2xl sm:inset-x-4 sm:bottom-4 sm:flex-row sm:items-center sm:text-sm">
      <p className="flex-1">{t("text")}</p>
      <div className="flex shrink-0 gap-2">
        <button onClick={() => choose("essential")} className="rounded-full px-4 py-2 font-semibold ring-1 ring-white/30">{t("decline")}</button>
        <button onClick={() => choose("all")} className="rounded-full bg-lime px-4 py-2 font-semibold text-ink">{t("accept")}</button>
      </div>
    </div>
  );
}
