import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/Landing";
import { Reveal } from "@/components/motion";
import { Tilt } from "@/components/three";
import { Button } from "@/components/ui/Button";
import { getPrices } from "@/modules/entitlements/application/settings";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });
  return { title: t("title"), description: t("sub"), alternates: { canonical: `/${locale}/pricing`, languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/pricing`])) } };
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pricing");
  const prices = await getPrices();
  const plans = [
    { key: "free", price: t("free.price"), period: "", items: t.raw("free.items") as string[], href: "/create", variant: "ink" as const, bg: "bg-white" },
    { key: "monthly", price: `$${prices.monthly}`, period: t("monthly.period"), items: t.raw("monthly.items") as string[], href: "/dashboard", variant: "lime" as const, bg: "bg-violet text-white" },
    { key: "yearly", price: `$${prices.yearly}`, period: t("yearly.period"), items: t.raw("monthly.items") as string[], href: "/dashboard", variant: "lime" as const, bg: "bg-ink text-white", badge: t("yearly.badge") },
  ];
  return (
    <main>
      <PageHero title={t("title")} sub={t("sub")} />
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-20 md:grid-cols-3">
        {plans.map((p, i) => (
          <Reveal key={p.key} delay={i * 120}>
            <Tilt max={8} className={`rounded-[2rem] ${p.bg}`}>
              <div className="relative flex min-h-[28rem] flex-col rounded-[2rem] p-8 shadow-[0_30px_60px_-30px_rgba(23,20,58,0.4)]">
                {p.badge && <span className="absolute right-6 top-6 rounded-full bg-lime px-3 py-1 text-xs font-bold text-ink">{p.badge}</span>}
                <p className="text-sm font-bold uppercase tracking-widest opacity-70">{t(`${p.key}.name`)}</p>
                <p className="mt-4 font-display text-6xl">{p.price}<span className="text-xl opacity-70">{p.period}</span></p>
                <ul className="mt-8 flex-1 space-y-3">
                  {p.items.map((it) => <li key={it} className="flex gap-3"><span className="text-lime">✓</span>{it}</li>)}
                </ul>
                <div className="mt-8"><Button href={p.href} variant={p.variant}>{t(`${p.key}.cta`)}</Button></div>
              </div>
            </Tilt>
          </Reveal>
        ))}
      </section>
    </main>
  );
}
