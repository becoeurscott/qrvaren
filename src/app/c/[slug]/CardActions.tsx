"use client";

import { useEffect, useState } from "react";
import { recordCardView, reportCard } from "@/modules/cards/application/public";

/** Counts one view per browser tab, after the page is shown (the page itself is cached). */
export function ViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `card-view:${slug}`;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, "1"); } catch {}
    recordCardView(slug);
  }, [slug]);
  return null;
}

/** "Report this card" link that opens a short form (spec 3.3: report button on every public card). */
export function ReportCard({ slug, labels }: { slug: string; labels: { report: string; reportReason: string; reportSend: string; reportThanks: string } }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  if (done) return <p className="text-center text-xs text-white/70">{labels.reportThanks}</p>;
  if (!open) return <button onClick={() => setOpen(true)} className="mx-auto block text-xs text-white/60 underline">{labels.report}</button>;
  return (
    <form
      className="space-y-2"
      onSubmit={async (e) => { e.preventDefault(); if (await reportCard(slug, text)) setDone(true); }}
    >
      <label className="block text-xs text-white/80">
        {labels.reportReason}
        <textarea required maxLength={500} rows={3} value={text} onChange={(e) => setText(e.target.value)}
          className="mt-1 w-full rounded-xl bg-white/10 p-2 text-sm text-white outline-none ring-1 ring-white/20 focus:ring-lime" />
      </label>
      <button className="rounded-full bg-lime px-4 py-2 text-xs font-bold text-ink">{labels.reportSend}</button>
    </form>
  );
}
