"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { createBrowserClient } from "@insforge/sdk/ssr";
import { saveCard } from "../application/actions";
import { DAYS, SOCIALS, type Card, type CardContent, type Day, type MediaRef } from "../domain/card";
import { CardView, type CardLabels } from "./CardView";

const MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = /^image\/(png|jpeg|webp)$/;
let storage: ReturnType<typeof createBrowserClient>["storage"] | undefined;

/** Uploads one image to the public card-media bucket and returns its url + key. */
async function upload(file: File, prefix: string): Promise<MediaRef> {
  if (!IMAGE_TYPES.test(file.type) || file.size > MAX_BYTES) throw new Error("upload");
  storage ??= createBrowserClient().storage;
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const { data, error } = await storage.from("card-media").upload(`${prefix}/${crypto.randomUUID()}.${ext}`, file);
  if (error || !data) throw new Error("upload");
  return { url: data.url, key: data.key };
}

const pick = (c: Card): CardContent => ({
  name: c.name, tagline: c.tagline ?? "", description: c.description ?? "", phone: c.phone ?? "", email: c.email ?? "",
  website: c.website ?? "", address: c.address ?? "", hours: c.hours ?? [], socials: c.socials ?? {}, links: c.links ?? [],
  gallery: c.gallery ?? [], logo_url: c.logo_url, logo_key: c.logo_key, photo_url: c.photo_url, photo_key: c.photo_key, locale: c.locale,
});

export function CardEditor({ card, previewLabels }: { card: Card; previewLabels: CardLabels }) {
  const t = useTranslations("cardEditor");
  const [c, setC] = useState<CardContent>(() => pick(card));
  const [status, setStatus] = useState<"idle" | "saved" | string>("idle");
  const [busy, setBusy] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = <K extends keyof CardContent>(k: K, v: CardContent[K]) => { setC((s) => ({ ...s, [k]: v })); setStatus("idle"); };

  async function onImage(kind: "logo" | "photo", file?: File) {
    if (!file) return;
    setBusy(kind);
    try {
      const m = await upload(file, card.id);
      setC((s) => ({ ...s, [`${kind}_url`]: m.url, [`${kind}_key`]: m.key }));
      setStatus("idle");
    } catch { setStatus("upload"); } finally { setBusy(null); }
  }
  async function onGallery(files: FileList | null) {
    if (!files) return;
    setBusy("gallery");
    try {
      const room = 8 - c.gallery.length;
      const added = await Promise.all([...files].slice(0, room).map((f) => upload(f, card.id)));
      setC((s) => ({ ...s, gallery: [...s.gallery, ...added].slice(0, 8) }));
      setStatus("idle");
    } catch { setStatus("upload"); } finally { setBusy(null); }
  }
  function setHour(d: Day, patch: Partial<{ o: string; c: string; closed: boolean }>) {
    setC((s) => {
      const cur = s.hours.find((h) => h.d === d) ?? { d };
      const next = { ...cur, ...patch };
      const empty = !next.closed && !next.o && !next.c;
      return { ...s, hours: DAYS.map((x) => (x === d ? (empty ? null : next) : s.hours.find((h) => h.d === x) ?? null)).filter(Boolean) as CardContent["hours"] };
    });
    setStatus("idle");
  }

  const input = "w-full rounded-2xl border-2 border-ink/10 bg-white px-4 py-3 text-ink outline-none transition focus:border-violet";
  const box = "rounded-[1.75rem] bg-white p-5 sm:p-6";
  const h2 = "mb-4 font-display text-xl uppercase tracking-wide";
  const field = (k: "name" | "tagline" | "phone" | "email" | "website" | "address", type = "text", max = 120) => (
    <label className="block text-sm font-semibold">
      <span className="mb-1 block text-slate">{t(`fields.${k}`)}</span>
      <input className={input} type={type} maxLength={max} value={(c[k] as string) ?? ""} onChange={(e) => set(k, e.target.value)}
        placeholder={k === "website" ? "https://" : k === "phone" ? "+1 555 010 2030" : undefined} />
    </label>
  );
  const save = () => start(async () => {
    const r = await saveCard(c);
    setStatus(r.ok ? "saved" : r.error.split(".")[0]);
  });
  const errorKey = status !== "idle" && status !== "saved" ? (["name", "email", "phone", "website", "links", "upload", "slug_taken", "auth"].includes(status) ? status : "invalid") : null;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <div className="min-w-0 space-y-4">
        <section className={box}>
          <h2 className={h2}>{t("sections.identity")}</h2>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
            {field("name", "text", 80)}
            {field("tagline")}
            <label className="block text-sm font-semibold sm:col-span-2">
              <span className="mb-1 block text-slate">{t("fields.description")}</span>
              <textarea className={input} rows={4} maxLength={1000} value={c.description ?? ""} onChange={(e) => set("description", e.target.value)} />
            </label>
            {(["logo", "photo"] as const).map((k) => (
              <div key={k} className="text-sm font-semibold">
                <span className="mb-1 block text-slate">{t(`fields.${k}`)}</span>
                <div className="flex items-center gap-3">
                  {c[`${k}_url`] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c[`${k}_url`]!} alt="" className={`h-14 w-14 rounded-xl object-cover ${k === "photo" ? "w-24" : ""}`} />
                  )}
                  <label className="cursor-pointer rounded-full bg-lime px-4 py-2 text-sm">
                    {busy === k ? "…" : t("fields.upload")}
                    <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => onImage(k, e.target.files?.[0])} />
                  </label>
                  {c[`${k}_url`] && <button type="button" className="text-sm underline" onClick={() => setC((s) => ({ ...s, [`${k}_url`]: null, [`${k}_key`]: null }))}>{t("fields.remove")}</button>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={box}>
          <h2 className={h2}>{t("sections.contact")}</h2>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
            {field("phone", "tel", 40)}{field("email", "email")}{field("website", "url", 300)}{field("address", "text", 200)}
          </div>
        </section>

        <section className={box}>
          <h2 className={h2}>{t("sections.hours")}</h2>
          <div className="space-y-2">
            {DAYS.map((d) => {
              const h = c.hours.find((x) => x.d === d);
              return (
                <div key={d} className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="w-24 font-semibold">{t(`days.${d}`)}</span>
                  <input type="time" aria-label={`${t(`days.${d}`)} ${t("open")}`} disabled={h?.closed} value={h?.o ?? ""} onChange={(e) => setHour(d, { o: e.target.value })}
                    className="rounded-xl border-2 border-ink/10 px-2 py-1 disabled:opacity-40" />
                  <span>–</span>
                  <input type="time" aria-label={`${t(`days.${d}`)} ${t("close")}`} disabled={h?.closed} value={h?.c ?? ""} onChange={(e) => setHour(d, { c: e.target.value })}
                    className="rounded-xl border-2 border-ink/10 px-2 py-1 disabled:opacity-40" />
                  <label className="ml-auto flex items-center gap-1.5">
                    <input type="checkbox" checked={!!h?.closed} onChange={(e) => setHour(d, { closed: e.target.checked })} /> {t("fields.closed")}
                  </label>
                </div>
              );
            })}
          </div>
        </section>

        <section className={box}>
          <h2 className={h2}>{t("sections.socials")}</h2>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
            {SOCIALS.map((k) => (
              <label key={k} className="block text-sm font-semibold">
                <span className="mb-1 block capitalize text-slate">{k === "x" ? "X" : k}</span>
                <input className={input} maxLength={200} value={c.socials[k] ?? ""} placeholder={k === "whatsapp" ? "+1 555 010 2030" : "@yourname"}
                  onChange={(e) => set("socials", { ...c.socials, [k]: e.target.value })} />
              </label>
            ))}
          </div>
        </section>

        <section className={box}>
          <h2 className={h2}>{t("sections.links")}</h2>
          <div className="space-y-2">
            {c.links.map((l, i) => (
              <div key={i} className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-[1fr_2fr_auto]">
                <input className={input} placeholder={t("fields.linkLabel")} maxLength={40} value={l.label}
                  onChange={(e) => set("links", c.links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                <input className={input} placeholder="https://" maxLength={300} value={l.url}
                  onChange={(e) => set("links", c.links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
                <button type="button" className="text-sm underline" onClick={() => set("links", c.links.filter((_, j) => j !== i))}>{t("fields.remove")}</button>
              </div>
            ))}
            {c.links.length < 8 && (
              <button type="button" className="rounded-full bg-lavender px-4 py-2 text-sm font-semibold" onClick={() => set("links", [...c.links, { label: "", url: "" }])}>
                + {t("fields.addLink")}
              </button>
            )}
          </div>
        </section>

        <section className={box}>
          <h2 className={h2}>{t("sections.gallery")}</h2>
          <div className="grid grid-cols-4 gap-2">
            {c.gallery.map((g) => (
              <div key={g.key} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.url} alt="" className="aspect-square w-full rounded-xl object-cover" />
                <button type="button" aria-label={t("fields.remove")} onClick={() => set("gallery", c.gallery.filter((x) => x.key !== g.key))}
                  className="absolute right-1 top-1 h-6 w-6 rounded-full bg-ink text-xs text-white">×</button>
              </div>
            ))}
          </div>
          {c.gallery.length < 8 && (
            <label className="mt-3 inline-block cursor-pointer rounded-full bg-lime px-4 py-2 text-sm font-semibold">
              {busy === "gallery" ? "…" : `+ ${t("fields.addPhoto")}`}
              <input type="file" multiple accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => onGallery(e.target.files)} />
            </label>
          )}
        </section>

        <section className={box}>
          <h2 className={h2}>{t("sections.language")}</h2>
          <div className="flex gap-2">
            {(["en", "fr", "es"] as const).map((l) => (
              <button key={l} type="button" onClick={() => set("locale", l)}
                className={`rounded-full px-4 py-2 text-sm font-bold uppercase ${c.locale === l ? "bg-ink text-white" : "bg-lavender"}`}>{l}</button>
            ))}
          </div>
        </section>

        {/* Sticky save bar */}
        <div className="sticky bottom-3 z-10 flex items-center gap-3 rounded-full bg-ink p-2 pl-5 text-white shadow-2xl">
          <span className="flex-1 text-sm">
            {pending ? t("saving") : status === "saved" ? `✓ ${t("saved")}` : errorKey ? <span className="text-sun">{t(`errors.${errorKey}` as never)}</span> : null}
          </span>
          <button type="button" onClick={save} disabled={pending || !!busy} className="btn rounded-full bg-lime px-6 py-3 font-semibold text-ink disabled:opacity-50">
            {t("save")}
          </button>
        </div>
      </div>

      <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <p className="mb-3 text-sm font-bold uppercase tracking-widest text-slate">{t("preview")}</p>
        <CardView card={c} labels={previewLabels} />
      </aside>
    </div>
  );
}
