import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/routing";
import { signOut } from "@/app/actions/auth";
import { getUser, userDb } from "@/shared/auth";
import { getMyPages } from "@/modules/cards/application/actions";
import { cardHostLabel, cardUrl } from "@/modules/cards/domain/cardUrl";
import { backgroundCss, resolveDesign } from "@/modules/cards/domain/design";
import { logoStyle } from "@/modules/cards/interface/CardView";

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
  const pages = await getMyPages();
  const stats = new Map<string, { views: number; scans: number }>();
  if (pages.length) {
    const since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
    const { data } = await (await userDb()).from("card_view_daily").select("card_id, views, scans").in("card_id", pages.map((p) => p.id)).gte("day", since);
    for (const r of (data ?? []) as { card_id: string; views: number; scans: number }[]) {
      const s = stats.get(r.card_id) ?? { views: 0, scans: 0 };
      stats.set(r.card_id, { views: s.views + r.views, scans: s.scans + r.scans });
    }
  }
  const scans = [...stats.values()].reduce((n, s) => n + s.scans, 0);
  const missing = (["card", "bio"] as const).filter((k) => !pages.some((p) => p.kind === k));
  const BADGE = { draft: "bg-sun", active: "bg-lime", suspended: "bg-coral text-white", hidden: "bg-ink text-white" } as const;

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

      {pages.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-display text-3xl uppercase">{t("myCards")}</h2>
          <div className="space-y-3">
            {pages.map((page) => {
              const st = stats.get(page.id) ?? { views: 0, scans: 0 };
              const d = resolveDesign(page.theme, page.design);
              const path = page.kind === "bio" ? "/dashboard/bio" : "/dashboard/card";
              return (
                <Reveal key={page.id}>
                  <div className="flex flex-col gap-5 rounded-[1.75rem] bg-white p-5 sm:flex-row sm:items-center sm:p-6">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl" style={{ background: backgroundCss(d.bg) }}>
                      {page.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={page.logo_url} alt="" className="h-full w-full" style={logoStyle(d.logo)} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-display text-4xl uppercase" style={{ color: d.accent }}>{page.name.charAt(0)}</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-violet">{t(page.kind === "bio" ? "bio" : "card")}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className="font-display text-2xl uppercase leading-none [overflow-wrap:anywhere]">{page.name}</p>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase text-ink ${BADGE[page.status]}`}>{e(`status.${page.status}`)}</span>
                      </div>
                      <a href={cardUrl(page.slug)} target="_blank" rel="noopener" className="mt-1 block text-sm font-semibold text-violet underline underline-offset-4 [overflow-wrap:anywhere]">{cardHostLabel(page.slug)}</a>
                      <p className="mt-1 text-sm text-slate">{e("stats", { views: st.views, scans: st.scans, links: st.views - st.scans })}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link href={path} className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">{t("edit")}</Link>
                      {page.status === "active" && <a href={cardUrl(page.slug)} target="_blank" rel="noopener" className="rounded-full bg-lime px-5 py-3 text-sm font-semibold text-ink">{t("open")}</a>}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {missing.map((k) => (
          <Reveal key={k}>
            <div className={`flex h-full flex-col justify-between rounded-[1.75rem] p-6 text-white ${k === "bio" ? "bg-ink" : "bg-violet grid-bg"}`}>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-lime">{t(k)}</p>
                <p className="mt-3 text-white/85">{t(k === "bio" ? "bioPitch" : "cardSoon")}</p>
              </div>
              <Link href={k === "bio" ? "/dashboard/bio" : "/dashboard/card"} className="mt-6 inline-flex w-max rounded-full bg-lime px-4 py-2 text-sm font-bold text-ink">{t(k === "bio" ? "bioCta" : "soon")} →</Link>
            </div>
          </Reveal>
        ))}
        <Reveal>
          <div className="flex h-full flex-col justify-between rounded-[1.75rem] bg-lime p-6 text-ink">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest">{t("printTitle")}</p>
              <p className="mt-3 text-ink/80">{t("printText")}</p>
            </div>
            <Link href="/dashboard/print" className="mt-6 inline-flex w-max rounded-full bg-ink px-4 py-2 text-sm font-bold text-white">{t("printCta")} →</Link>
          </div>
        </Reveal>
        {(["qrs", "scans"] as const).map((k, i) => (
          <Reveal key={k} delay={(i + 1) * 100}>
            <div className="rounded-[1.75rem] bg-white p-6">
              <p className="text-sm font-bold uppercase tracking-widest text-slate">{t(k)}</p>
              <p className="mt-3 font-display text-5xl text-violet">{k === "scans" ? scans : 0}</p>
              <p className="mt-2 text-sm text-slate">{k === "scans" && pages.length ? t("scans30") : t("empty")}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </main>
  );
}
