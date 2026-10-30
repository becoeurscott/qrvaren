import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getUser, userDb } from "@/shared/auth";
import { getPrices } from "@/modules/entitlements/application/settings";
import { Generator } from "@/modules/qr/interface/Generator";
import { getMyCard, openBillingPortal } from "../application/actions";
import type { PageKind } from "../domain/card";
import { cardHostLabel, cardQrUrl, cardUrl } from "../domain/cardUrl";
import { CreateCardForm } from "./CreateCardForm";
import { CardEditor } from "./CardEditor";
import { RenewalCheckout } from "./RenewalCheckout";
import type { CardLabels } from "./CardView";

export type DashboardQuery = { paid?: string; canceled?: string; billing?: string };

/** Editor page for one product: business card or link-in-bio page (create, publish, stats, edit, QR). */
export async function PageDashboard({ kind, locale, q }: { kind: PageKind; locale: string; q: DashboardQuery }) {
  setRequestLocale(locale);
  const path = kind === "bio" ? "/dashboard/bio" : "/dashboard/card";
  const user = await getUser();
  if (!user) redirect(`/${locale}/login?next=${path}`);
  const t = await getTranslations("cardEditor");
  const p = await getTranslations("cardPage");
  const card = await getMyCard(kind);

  const notice = q.paid ? t("paidThanks") : q.canceled ? t("canceled") : q.billing === "unavailable" ? t("billingUnavailable") : q.billing === "error" ? t("billingError") : q.billing === "consent" ? t("renewal.required") : null;
  const header = (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
      <div>
        <Link href="/dashboard" className="text-sm font-semibold text-violet">← {t("back")}</Link>
        <h1 className="mt-2 font-display text-5xl uppercase">{card ? card.name : t(kind === "bio" ? "createTitleBio" : "createTitle")}</h1>
        {!card && <p className="mt-2 max-w-xl text-slate">{t(kind === "bio" ? "createSubBio" : "createSub")}</p>}
      </div>
    </div>
  );

  if (!card) {
    return (
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-32">
        {header}
        <CreateCardForm kind={kind} hostSuffix={cardHostLabel("x").replace(/^x/, "")} />
      </main>
    );
  }

  const all = await getPrices();
  const prices = kind === "bio" ? { monthly: all.bioMonthly, yearly: all.bioYearly } : { monthly: all.monthly, yearly: all.yearly };
  const fmtDate = (d?: string | null) => (d ? new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(d)) : "");
  const db = await userDb();
  const since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const [{ data: views }, { data: clicks }] = await Promise.all([
    db.from("card_view_daily").select("views, scans").eq("card_id", card.id).gte("day", since),
    db.from("card_click_daily").select("target, clicks").eq("card_id", card.id).gte("day", since),
  ]);
  const viewRows = (views ?? []) as { views: number; scans: number }[];
  const viewCount = viewRows.reduce((n, r) => n + r.views, 0);
  const scanCount = viewRows.reduce((n, r) => n + r.scans, 0);
  const clickTotals = new Map<string, number>();
  for (const r of (clicks ?? []) as { target: string; clicks: number }[]) clickTotals.set(r.target, (clickTotals.get(r.target) ?? 0) + r.clicks);
  const clickList = [...clickTotals].sort((a, b) => b[1] - a[1]);
  const keys = ["call", "save", "directions", "hours", "contact", "links", "gallery", "closed", "website", "email", "phone", "address", "today"] as const;
  const previewLabels = { ...Object.fromEntries(keys.map((k) => [k, p(k)])), days: p.raw("days") } as CardLabels;
  const url = cardUrl(card.slug);
  const badge = { draft: "bg-sun", active: "bg-lime", suspended: "bg-coral text-white", hidden: "bg-ink text-white" }[card.status];

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-32">
      {header}
      {notice && <p className="mb-6 rounded-2xl bg-violet/10 p-4 font-medium">{notice}</p>}

      {/* Status and billing */}
      <section className="mb-6 grid gap-4 rounded-[1.75rem] bg-ink p-6 text-white md:grid-cols-[1.4fr_1fr] md:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase text-ink ${badge}`}>{t(`status.${card.status}`)}</span>
            <a href={url} target="_blank" rel="noopener" className="font-semibold underline decoration-lime underline-offset-4 [overflow-wrap:anywhere]">{cardHostLabel(card.slug)}</a>
          </div>
          <p className="mt-3 text-white/80">{t(`statusText.${card.status}`, { date: fmtDate(card.expires_at) })}</p>
          {card.status === "active" && card.paid_until && <p className="mt-1 text-sm text-white/60">{t("paidUntil", { date: fmtDate(card.paid_until) })}</p>}
          <p className="mt-1 text-sm text-white/60">{t("stats", { views: viewCount, scans: scanCount, links: viewCount - scanCount })}</p>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          {card.status === "draft" || card.status === "suspended" ? (
            <RenewalCheckout locale={locale} kind={kind} prices={prices} dark />
          ) : (
            <>
              <a href={url} target="_blank" rel="noopener" className="btn rounded-full bg-lime px-5 py-3 text-sm font-semibold text-ink">{t(kind === "bio" ? "viewBio" : "viewCard")}</a>
              <form action={openBillingPortal}>
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="kind" value={kind} />
                <button className="rounded-full px-5 py-3 text-sm font-semibold ring-2 ring-white/30">{t("manageBilling")}</button>
              </form>
            </>
          )}
        </div>
      </section>

      <section className="mb-6 rounded-[1.75rem] bg-white p-6">
        <h2 className="mb-3 font-display text-xl uppercase tracking-wide">{t("clicksTitle")}</h2>
        {clickList.length === 0 ? <p className="text-slate">{t("noClicks")}</p> : (
          <ul className="flex flex-wrap gap-2">
            {clickList.map(([k, n]) => (
              <li key={k} className="rounded-full bg-lavender px-4 py-2 text-sm"><span className="font-semibold">{t(`targets.${k}` as never)}</span> · {n}</li>
            ))}
          </ul>
        )}
      </section>

      <CardEditor card={card} previewLabels={previewLabels}
        publish={card.status === "draft" || card.status === "suspended" ? { locale, prices: { monthly: prices.monthly, yearly: prices.yearly } } : undefined} />

      <section className="mt-12">
        <h2 className="mb-4 font-display text-3xl uppercase">{t(kind === "bio" ? "qrTitleBio" : "qrTitle")}</h2>
        <Generator initialType="url" initialFields={{ url: cardQrUrl(card.slug) }} />
      </section>
    </main>
  );
}
