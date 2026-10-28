import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Eyebrow, PageHero, PhoneMock } from "@/components/Landing";
import { Pop, Reveal } from "@/components/motion";
import { Tilt } from "@/components/three";
import { Button } from "@/components/ui/Button";
import { NotifyForm } from "@/components/NotifyForm";
import { getPrices } from "@/modules/entitlements/application/settings";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "card" });
  return { title: t("title"), description: t("sub") };
}

export default async function BusinessCardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("card");
  const l = await getTranslations("landing");
  const features = t.raw("features") as { t: string; d: string }[];
  const prices = await getPrices();
  const colors = ["bg-sky", "bg-pink", "bg-lime", "bg-sun"];
  return (
    <main>
      <PageHero eyebrow={l("cardEyebrow")} title={t("title")} sub={t("sub")}>
        <Reveal delay={400}><div className="mt-8 flex justify-center md:justify-start"><Button href="/dashboard" variant="lime" size="lg">{t("cta")}</Button></div></Reveal>
      </PageHero>
      <section className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] items-start gap-12 px-4 py-20 md:grid-cols-[1fr_0.8fr]">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
          {features.map((f, i) => (
            <Reveal key={i} delay={i * 100}>
              <Tilt className={`rounded-[1.75rem] ${colors[i]}`}>
                <div className="min-h-52 rounded-[1.75rem] p-6">
                  <Pop rotate={12}><span className="font-mono text-sm font-bold">0{i + 1}</span></Pop>
                  <p className="mt-6 text-xl font-bold">{f.t}</p>
                  <p className="mt-2 text-sm opacity-80 [overflow-wrap:anywhere]">{f.d}</p>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
        <Reveal delay={200} className="flex flex-col items-center gap-8">
          <Tilt max={14} className="rounded-[2rem]"><PhoneMock /></Tilt>
          <div className="w-full rounded-3xl bg-ink p-6 text-white">
            <Eyebrow light>{l("cardPrice", { monthly: `$${prices.monthly}`, yearly: `$${prices.yearly}` })}</Eyebrow>
            <p className="text-white/75">{t("soon")}</p>
            <NotifyForm />
          </div>
        </Reveal>
      </section>
    </main>
  );
}
