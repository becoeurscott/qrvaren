"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

// Waiting list for the business card (spec 7.4.5: validate demand before building).
export function NotifyForm() {
  const t = useTranslations("card");
  const [done, setDone] = useState(false);
  const [email, setEmail] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/waitlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, locale: document.documentElement.lang }),
    }).catch(() => {});
    setDone(true);
  }
  if (done) return <p className="mt-4 font-semibold text-lime">{t("notified")}</p>;
  return (
    <form onSubmit={submit} className="mt-4 flex gap-2">
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com"
        className="min-w-0 flex-1 rounded-full bg-white/10 px-4 py-3 text-white outline-none ring-1 ring-white/20 focus:ring-lime" />
      <button className="btn rounded-full bg-lime px-5 py-3 font-semibold text-ink">{t("notify")}</button>
    </form>
  );
}
