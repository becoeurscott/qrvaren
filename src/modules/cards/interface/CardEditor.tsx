"use client";

import { useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { COUNTRIES, flag, joinPhone, splitPhone } from "../domain/phone";
import { createBrowserClient } from "@insforge/sdk/ssr";
import { saveCard, startCheckout } from "../application/actions";
import { CARD_THEMES, DAYS, SOCIALS, withScheme, type Card, type CardContent, type Day, type MediaRef } from "../domain/card";
import { CardView, THEMES, type CardLabels } from "./CardView";

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
  theme: c.theme ?? "lavender",
});

export function CardEditor({ card, previewLabels, publish }: {
  card: Card; previewLabels: CardLabels;
  /** Set when the card isn't live yet (draft or suspended): a save then offers checkout. */
  publish?: { locale: string; prices: { monthly: number | string; yearly: number | string } };
}) {
  const [askPublish, setAskPublish] = useState(false);
  const t = useTranslations("cardEditor");
  const [c, setC] = useState<CardContent>(() => pick(card));
  const [status, setStatus] = useState<"idle" | "saved" | string>("idle");
  const [errPath, setErrPath] = useState<string | null>(null);
  // Kept apart from the number because +1 is shared (US, Canada…).
  const [phoneIso, setPhoneIso] = useState(() => splitPhone(card.phone ?? "").iso);
  const locale = useLocale();
  const names = useMemo(() => new Intl.DisplayNames([locale], { type: "region" }), [locale]);
  const countryName = (iso: string) => names.of(iso) ?? iso;
  const [busy, setBusy] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = <K extends keyof CardContent>(k: K, v: CardContent[K]) => { setC((s) => ({ ...s, [k]: v })); setStatus("idle"); setErrPath(null); };

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
  // Field the server rejected ("website", "links.1.url"…): outlined in red with the message below it.
  const bad = (path: string) => errPath === path || errPath?.startsWith(`${path}.`);
  const inputFor = (path: string) => `${input} ${bad(path) ? "!border-coral" : ""}`;
  const hint = (path: string) => bad(path) && errorKey ? <span className="mt-1 block text-xs font-semibold text-coral">{t(`errors.${errorKey}` as never)}</span> : null;
  const field = (k: "name" | "tagline" | "phone" | "email" | "website" | "address", type = "text", max = 120) => (
    <label className="block text-sm font-semibold" data-field={k}>
      <span className="mb-1 block text-slate">{t(`fields.${k}`)}</span>
      <input className={inputFor(k)} type={k === "website" ? "text" : type} inputMode={k === "website" ? "url" : undefined} maxLength={max}
        value={(c[k] as string) ?? ""} onChange={(e) => set(k, e.target.value)}
        onBlur={k === "website" ? (e) => set(k, withScheme(e.target.value.trim())) : undefined}
        placeholder={k === "website" ? "www.example.com" : k === "phone" ? "+1 555 010 2030" : undefined} />
      {hint(k)}
    </label>
  );
  const save = () => start(async () => {
    const r = await saveCard(c);
    setErrPath(r.ok ? null : r.error);
    setStatus(r.ok ? "saved" : r.error.split(".")[0]);
    if (r.ok && publish) setAskPublish(true);
    if (!r.ok) document.querySelector(`[data-field="${r.error.split(".").slice(0, 2).join(".")}"], [data-field="${r.error.split(".")[0]}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
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
            <label className="block text-sm font-semibold" data-field="phone">
              <span className="mb-1 block text-slate">{t("fields.phone")}</span>
              <div className={`flex overflow-hidden rounded-2xl border-2 bg-white transition focus-within:border-violet ${bad("phone") ? "border-coral" : "border-ink/10"}`}>
                <select aria-label={t("fields.country")} value={phoneIso} className="max-w-[6.5rem] shrink-0 border-r-2 border-ink/10 bg-lavender px-2 text-ink outline-none"
                  onChange={(e) => { setPhoneIso(e.target.value); set("phone", joinPhone(e.target.value, splitPhone(c.phone ?? "", phoneIso).local)); }}>
                  {COUNTRIES.map((k) => <option key={k.iso} value={k.iso}>{flag(k.iso)} {countryName(k.iso)} +{k.dial}</option>)}
                </select>
                <input type="tel" maxLength={30} className="min-w-0 flex-1 px-4 py-3 text-ink outline-none" placeholder="555 010 2030"
                  value={splitPhone(c.phone ?? "", phoneIso).local} onChange={(e) => set("phone", joinPhone(phoneIso, e.target.value))} />
              </div>
              {hint("phone")}
            </label>
            {field("email", "email")}{field("website", "url", 300)}{field("address", "text", 200)}
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
              <div key={i} data-field={`links.${i}`}>
                <div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-[1fr_2fr_auto]">
                  <input className={inputFor(`links.${i}.label`)} placeholder={t("fields.linkLabel")} maxLength={40} value={l.label}
                    onChange={(e) => set("links", c.links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                  <input className={inputFor(`links.${i}.url`)} placeholder="www.example.com" inputMode="url" maxLength={300} value={l.url}
                    onChange={(e) => set("links", c.links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
                    onBlur={(e) => set("links", c.links.map((x, j) => (j === i ? { ...x, url: withScheme(e.target.value.trim()) } : x)))} />
                  <button type="button" className="text-sm underline" onClick={() => set("links", c.links.filter((_, j) => j !== i))}>{t("fields.remove")}</button>
                </div>
                {hint(`links.${i}`)}
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
          <h2 className={h2}>{t("sections.theme")}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CARD_THEMES.map((k) => (
              <button key={k} type="button" onClick={() => set("theme", k)} aria-pressed={c.theme === k}
                className={`overflow-hidden rounded-2xl text-left text-sm font-bold ring-2 transition ${c.theme === k ? "ring-violet" : "ring-ink/10 hover:ring-ink/30"}`}>
                <span className={`block h-12 ${THEMES[k].cover}`} />
                <span className={`flex items-center justify-between px-3 py-2 ${THEMES[k].article}`}>
                  {t(`themes.${k}`)}
                  <span className={`h-3 w-3 rounded-full ${THEMES[k].primary.replace(/!/g, "")}`} />
                </span>
              </button>
            ))}
          </div>
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

      {/* After a save, an unpublished card is offered checkout right away (or kept as a draft). */}
      {askPublish && publish && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/60 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true"
          aria-labelledby="publish-title" onClick={(e) => e.target === e.currentTarget && setAskPublish(false)}>
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 text-ink shadow-2xl sm:p-8">
            <p className="text-sm font-bold uppercase tracking-widest text-violet">✓ {t("saved")}</p>
            <h2 id="publish-title" className="mt-2 font-display text-3xl uppercase leading-none">{t("publishAsk.title")}</h2>
            <p className="mt-3 text-slate">{t("publishAsk.text")}</p>
            <div className="mt-6 space-y-2">
              {(["yearly", "monthly"] as const).map((plan) => (
                <form key={plan} action={startCheckout}>
                  <input type="hidden" name="locale" value={publish.locale} />
                  <input type="hidden" name="plan" value={plan} />
                  <button className={`btn w-full rounded-full px-6 py-4 font-semibold ${plan === "yearly" ? "bg-lime text-ink" : "bg-ink text-white"}`}>
                    {t(plan, { price: `$${publish.prices[plan]}` })}
                  </button>
                </form>
              ))}
              <button type="button" autoFocus onClick={() => setAskPublish(false)} className="w-full rounded-full px-6 py-3 text-sm font-semibold underline underline-offset-4">
                {t("publishAsk.draft")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
