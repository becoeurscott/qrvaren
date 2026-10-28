import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { PageHero, Ticker, Trust, TypesGrid } from "@/components/Landing";
import { Reveal } from "@/components/motion";
import { Generator } from "@/modules/qr/interface/Generator";
import { allTypeSlugs, typeFromSlug } from "@/modules/qr/interface/slugs";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => allTypeSlugs().map((slug) => ({ locale, slug })));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const type = typeFromSlug(slug);
  if (!type) return {};
  const t = await getTranslations({ locale, namespace: `seo.${type}` });
  return {
    title: t("title"),
    description: t("desc"),
    alternates: {
      canonical: `/${locale}/create/${slug}`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/create/${slug}`])),
    },
  };
}

export default async function TypePage({ params }: Props) {
  const { locale, slug } = await params;
  const type = typeFromSlug(slug);
  if (!type) notFound();
  setRequestLocale(locale);
  const t = await getTranslations(`seo.${type}`);
  const h = await getTranslations("hero");
  return (
    <main>
      <PageHero eyebrow={h("badge")} title={t("h1")} sub={t("desc")} />
      <div className="relative z-10 mx-auto -mt-20 max-w-6xl px-4">
        <Reveal delay={200} y={60}><Generator initialType={type} /></Reveal>
      </div>
      <Ticker />
      <TypesGrid />
      <Trust />
    </main>
  );
}
