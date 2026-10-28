import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero, Ticker, Trust } from "@/components/Landing";
import { Reveal } from "@/components/motion";
import { Generator } from "@/modules/qr/interface/Generator";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "create" });
  return { title: t("title"), description: t("sub"), alternates: { canonical: `/${locale}/create`, languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/create`])) } };
}

export default async function CreatePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("create");
  const h = await getTranslations("hero");
  return (
    <main>
      <PageHero eyebrow={h("badge")} title={t("title")} sub={t("sub")} />
      <div className="relative z-10 mx-auto -mt-20 max-w-6xl px-4">
        <Reveal delay={200} y={60}><Generator /></Reveal>
      </div>
      <Ticker />
      <Trust />
    </main>
  );
}
