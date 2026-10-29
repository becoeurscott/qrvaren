import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getUser, userDb } from "@/shared/auth";
import { getPrices } from "@/modules/entitlements/application/settings";
import { getMyCard, openBillingPortal, startCheckout } from "@/modules/cards/application/actions";
import { cardHostLabel, cardUrl } from "@/modules/cards/domain/cardUrl";
import { CreateCardForm } from "@/modules/cards/interface/CreateCardForm";
import { CardEditor } from "@/modules/cards/interface/CardEditor";
import type { CardLabels } from "@/modules/cards/interface/CardView";
import { Generator } from "@/modules/qr/interface/Generator";

export const metadata: Metadata = { robots: { index: false } };

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ paid?: string; canceled?: string; billing?: string }> };

export default async function CardDashboardPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const q = await searchParams;
  setRequestLocale(locale);
  const user = await getUser();
  if (!user) redirect(`/${locale}/login?next=/dashboard/card`);
  const t = await getTranslations("cardEditor");
  const p = await getTranslations("cardPage");
  const card = await getMyCard();

  const notice = q.paid ? t("paidThanks") : q.canceled ? t("canceled") : q.billing === "unavailable" ? t("billingUnavailable") : q.billing === "error" ? t("billingError") : null;
  const header = (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
      <div>
        <Link href="/dashboard" className="text-sm font-semibold text-violet">← {t("back")}</Link>
        <h1 className="mt-2 font-display text-5xl uppercase">{card ? card.name : t("createTitle")}</h1>
        {!card && <p className="mt-2 max-w-xl text-slate">{t("createSub")}</p>}
      </div>
    </div>
  );

  if (!card) {
    return (
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-32">
        {header}
        <CreateCardForm hostSuffix={cardHostLabel("x").replace(/^x/, "")} />
      </main>
    );
  }

  const prices = await getPrices();
  const fmtDate = (d?: string | null) => (d ? new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(d)) : "");
  const db = await userDb();
  const since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const { data: views } = await db.from("card_view_daily").select("views").eq("card_id", card.id).gte("day", since);
  const viewCount = ((views ?? []) as { views: number }[]).reduce((n, r) => n + r.views, 0);
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
          <p className="mt-1 text-sm text-white/60">{t("views", { n: viewCount })}</p>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          {card.status === "draft" || card.status === "suspended" ? (
            (["monthly", "yearly"] as const).map((plan) => (
              <form key={plan} action={startCheckout}>
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="plan" value={plan} />
                <button className={`btn rounded-full px-5 py-3 text-sm font-semibold ${plan === "yearly" ? "bg-lime text-ink" : "bg-white text-ink"}`}>
                  {t(plan, { price: `$${plan === "yearly" ? prices.yearly : prices.monthly}` })}
                </button>
              </form>
            ))
          ) : (
            <>
              <a href={url} target="_blank" rel="noopener" className="btn rounded-full bg-lime px-5 py-3 text-sm font-semibold text-ink">{t("viewCard")}</a>
              <form action={openBillingPortal}>
                <input type="hidden" name="locale" value={locale} />
                <button className="rounded-full px-5 py-3 text-sm font-semibold ring-2 ring-white/30">{t("manageBilling")}</button>
              </form>
            </>
          )}
        </div>
      </section>

      <CardEditor card={card} previewLabels={previewLabels}
        publish={card.status === "draft" || card.status === "suspended" ? { locale, prices: { monthly: prices.monthly, yearly: prices.yearly } } : undefined} />

      <section className="mt-12">
        <h2 className="mb-4 font-display text-3xl uppercase">{t("qrTitle")}</h2>
        <Generator initialType="url" initialFields={{ url }} />
      </section>
    </main>
  );
}
