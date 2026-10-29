"use client";

import { useEffect, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { checkSlug, createCard, suggestSlug } from "../application/actions";
import { slugify, type PageKind } from "../domain/card";

/** First step: business name and the permanent card address (suggested, editable, checked live). */
export function CreateCardForm({ hostSuffix, kind = "card" }: { hostSuffix: string; kind?: PageKind }) {
  const t = useTranslations("cardEditor");
  const locale = useLocale() as "en" | "es" | "fr";
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [state, setState] = useState<"idle" | "checking" | "ok" | "taken">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  // Suggest a free address from the name until the user edits the address themself.
  useEffect(() => {
    if (slugTouched || !name.trim()) return;
    const id = setTimeout(async () => {
      setState("checking");
      const s = await suggestSlug(name);
      setSlug(s ?? slugify(name));
      setState(s ? "ok" : "taken");
    }, 350);
    return () => clearTimeout(id);
  }, [name, slugTouched]);

  // Check a hand-edited address.
  useEffect(() => {
    if (!slugTouched || !slug) return;
    setState("checking");
    const id = setTimeout(async () => setState((await checkSlug(slug)) ? "ok" : "taken"), 350);
    return () => clearTimeout(id);
  }, [slug, slugTouched]);

  const input = "w-full rounded-2xl border-2 border-ink/10 bg-white px-4 py-3 text-ink outline-none transition focus:border-violet";
  return (
    <form
      className="mx-auto max-w-xl space-y-5 rounded-[2rem] bg-white p-6 shadow-[0_30px_60px_-30px_rgba(23,20,58,0.4)] sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const r = await createCard({ name, slug, locale, kind });
          if (r.ok) router.refresh();
          else setError(t(`errors.${r.error}` as never));
        });
      }}
    >
      <label className="block text-sm font-semibold">
        <span className="mb-1 block text-slate">{t(kind === "bio" ? "nameLabelBio" : "nameLabel")}</span>
        <input className={input} value={name} maxLength={80} required autoFocus onChange={(e) => setName(e.target.value)} placeholder="Blue Bakery" />
      </label>
      <label className="block text-sm font-semibold">
        <span className="mb-1 block text-slate">{t("addressLabel")}</span>
        <div className="flex items-center overflow-hidden rounded-2xl border-2 border-ink/10 bg-lavender focus-within:border-violet">
          <input className="min-w-0 flex-1 bg-white px-4 py-3 text-ink outline-none" value={slug} maxLength={63}
            onChange={(e) => { setSlugTouched(true); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); }} />
          <span className="shrink-0 px-3 text-sm text-slate">{hostSuffix}</span>
        </div>
        <span className={`mt-1 block text-xs ${state === "taken" ? "text-coral" : state === "ok" ? "text-green-700" : "text-slate"}`}>
          {state === "checking" ? t("checking") : state === "ok" ? `✓ ${t("available")}` : state === "taken" ? t("taken") : t("addressHelp")}
        </span>
      </label>
      {state === "ok" && <p className="text-xs text-slate">{t("addressHelp")}</p>}
      {error && <p className="rounded-xl bg-coral/15 p-3 text-sm">{error}</p>}
      <button disabled={pending || state !== "ok" || !name.trim()}
        className="btn w-full rounded-full bg-ink px-6 py-4 font-semibold text-white transition hover:bg-violet disabled:opacity-40">
        {t("create")}
      </button>
    </form>
  );
}
