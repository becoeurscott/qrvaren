import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/routing";
import { signOut } from "@/app/actions/auth";
import { getUser, userDb } from "@/shared/auth";
import { getMyCard } from "@/modules/cards/application/actions";
import { cardHostLabel, cardUrl } from "@/modules/cards/domain/cardUrl";
import { THEMES } from "@/modules/cards/interface/CardView";

export const metadata: Metadata = { robots: { index: false } };

// Signed-in area: the user's card ("Mes cartes" once created), QR codes and scans.
export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);
  const t = await getTranslations("dash");
  const name = (user.profile as { name?: string } | null)?.name || user.email;
  const e = await getTranslations("cardEditor");
  const card = await getMyCard();
  let views = 0, scans = 0;
  if (card) {
    const since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
    const { data } = await (await userDb()).from("card_view_daily").select("views, scans").eq("card_id", card.id).gte("day", since);
    for (const r of (data ?? []) as { views: number; scans: number }[]) { views += r.views; scans += r.scans; }
  }
  const badge = card ? { draft: "bg-sun", active: "bg-lime", suspended: "bg-coral text-white", hidden: "bg-ink text-white" }[card.status] : "";

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-32">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl uppercase">{t("hello", { name: String(name).split("@")[0] })}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button href="/create" variant="ink">{t("newQr")}</Button>
          <form action={signOut}>
            <input type="hidden" name="locale" value={locale} />
            <button className="rounded-full px-5 py-3 font-semibold ring-2 ring-ink/15 transition hover:bg-white">{t("logout")}</button>
          </form>
        </div>
      </div>

      {card && (
        <section className="mt-10">
          <h2 className="mb-4 font-display text-3xl uppercase">{t("myCards")}</h2>
          <Reveal>
            <div className="flex flex-col gap-5 rounded-[1.75rem] bg-white p-5 sm:flex-row sm:items-center sm:p-6">
              <div className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl ${THEMES[card.theme ?? "lavender"].cover}`}>
                {card.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={card.logo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-display text-4xl uppercase text-white">{card.name.charAt(0)}</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-2xl uppercase leading-none [overflow-wrap:anywhere]">{card.name}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase text-ink ${badge}`}>{e(`status.${card.status}`)}</span>
                </div>
                <a href={cardUrl(card.slug)} target="_blank" rel="noopener" className="mt-1 block text-sm font-semibold text-violet underline underline-offset-4 [overflow-wrap:anywhere]">{cardHostLabel(card.slug)}</a>
                <p className="mt-1 text-sm text-slate">{e("stats", { views, scans, links: views - scans })}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/dashboard/card" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">{t("editCard")}</Link>
                {card.status === "active" && <a href={cardUrl(card.slug)} target="_blank" rel="noopener" className="rounded-full bg-lime px-5 py-3 text-sm font-semibold text-ink">{e("viewCard")}</a>}
              </div>
            </div>
          </Reveal>
        </section>
      )}

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {!card && <Reveal>
          <div className="flex h-full flex-col justify-between rounded-[1.75rem] bg-violet p-6 text-white grid-bg">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-lime">{t("card")}</p>
              <p className="mt-3 text-white/85">{t("cardSoon")}</p>
            </div>
            <Link href="/dashboard/card" className="mt-6 inline-flex w-max rounded-full bg-lime px-4 py-2 text-sm font-bold text-ink">{t("soon")} →</Link>
          </div>
        </Reveal>}
        {(["qrs", "scans"] as const).map((k, i) => (
          <Reveal key={k} delay={(i + 1) * 100}>
            <div className="rounded-[1.75rem] bg-white p-6">
              <p className="text-sm font-bold uppercase tracking-widest text-slate">{t(k)}</p>
              <p className="mt-3 font-display text-5xl text-violet">{k === "scans" ? scans : 0}</p>
              <p className="mt-2 text-sm text-slate">{k === "scans" && card ? t("scans30") : t("empty")}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </main>
  );
}
