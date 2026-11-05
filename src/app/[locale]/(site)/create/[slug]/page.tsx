import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { PageHero, Ticker, Trust, TypesGrid } from "@/components/Landing";
import { Reveal } from "@/components/motion";
import { Generator } from "@/modules/qr/interface/Generator";
import { allTypeSlugs, typeFromSlug } from "@/modules/qr/interface/slugs";
import { presetFromSlug, presetSlugs } from "@/modules/qr/domain/presets";
import { guideContent } from "@/content/guides";
import { TypeGuide } from "@/components/TypeGuide";
import { UseCaseLinks } from "@/components/UseCaseLinks";
import { useCaseFromSlug, useCaseSlugs } from "@/content/usecases";
import { BRAND_NAME } from "@/shared/config";

type Props = { params: Promise<{ locale: string; slug: string }> };

// One page per QR type (wifi-qr-code...) and per use-case template (instagram-qr-code...).
export function generateStaticParams() {
  const slugs = [...allTypeSlugs(), ...presetSlugs(), ...useCaseSlugs()];
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}
export const dynamicParams = false;

function resolve(slug: string) {
  if (useCaseSlugs().includes(slug)) return { useCase: true as const };
  const preset = presetFromSlug(slug);
  if (preset) return { preset, ns: `seoPresets.${preset}` as const };
  const type = typeFromSlug(slug);
  if (type) return { type, ns: `seo.${type}` as const };
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = resolve(slug);
  if (!page) return {};
  let title: string, description: string;
  if ("useCase" in page) {
    const u = useCaseFromSlug(locale, slug)!;
    title = u.title; description = u.desc;
  } else {
    const t = await getTranslations({ locale, namespace: page.ns });
    title = t("title"); description = t("desc");
  }
  return {
    title,
    description,
    openGraph: { type: "website", url: `/${locale}/create/${slug}`, siteName: BRAND_NAME, title, description, locale },
    twitter: { card: "summary_large_image", title, description },
    alternates: {
      canonical: `/${locale}/create/${slug}`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/create/${slug}`])),
    },
  };
}

export default async function TypePage({ params }: Props) {
  const { locale, slug } = await params;
  const page = resolve(slug);
  if (!page) notFound();
  setRequestLocale(locale);
  if ("useCase" in page) {
    const u = useCaseFromSlug(locale, slug)!;
    const h = await getTranslations("hero");
    return (
      <main>
        <PageHero eyebrow={h("badge")} title={u.h1} sub={u.desc} />
        <div className="relative z-10 mx-auto -mt-20 max-w-6xl px-4">
          <Reveal delay={200} y={60}>
            <Generator initialType={u.type} />
          </Reveal>
        </div>
        <TypeGuide guide={u.guide} />
        <UseCaseLinks locale={locale} current={slug} />
        <TypesGrid />
        <Trust />
      </main>
    );
  }
  const t = await getTranslations(page.ns);
  const h = await getTranslations("hero");
  return (
    <main>
      <PageHero eyebrow={h("badge")} title={t("h1")} sub={t("desc")} />
      <div className="relative z-10 mx-auto -mt-20 max-w-6xl px-4">
        <Reveal delay={200} y={60}>
          <Generator initialType={page.type} initialPreset={page.preset} />
        </Reveal>
      </div>
      {page.type && <TypeGuide guide={guideContent(locale).types[page.type]} />}
      <UseCaseLinks locale={locale} current={slug} />
      <Ticker />
      <TypesGrid />
      <Trust />
    </main>
  );
}
