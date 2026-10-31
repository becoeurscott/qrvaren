import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link, routing } from "@/i18n/routing";
import { PageHero } from "@/components/Landing";
import { Button } from "@/components/ui/Button";
import { Bullets, JsonLd, Steps, howToLd } from "@/components/Guide";
import { guideContent, tutorialSlugs } from "@/content/guides";
import { BRAND_NAME, SITE_URL } from "@/shared/config";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => tutorialSlugs().map((slug) => ({ locale, slug })));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const g = guideContent(locale).tutorials.find((x) => x.slug === slug);
  if (!g) return {};
  return {
    title: g.title,
    description: g.desc,
    alternates: { canonical: `/${locale}/guides/${slug}`, languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/guides/${slug}`])) },
    openGraph: { type: "article", title: g.title, description: g.desc },
  };
}

export default async function GuidePage({ params }: Props) {
  const { locale, slug } = await params;
  const { ui, tutorials } = guideContent(locale);
  const g = tutorials.find((x) => x.slug === slug);
  if (!g) notFound();
  setRequestLocale(locale);
  const steps = g.sections.flatMap((s) => s.steps ?? []);
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.title,
    description: g.desc,
    inLanguage: locale,
    mainEntityOfPage: `${SITE_URL}/${locale}/guides/${slug}`,
    publisher: { "@type": "Organization", name: BRAND_NAME, logo: { "@type": "ImageObject", url: `${SITE_URL}/apple-icon` } },
  };
  return (
    <main>
      <JsonLd data={article} />
      {steps.length > 0 && <JsonLd data={howToLd(g.title, steps)} />}
      <PageHero eyebrow={ui.minutes.replace("{n}", String(g.minutes))} title={g.title} sub={g.desc} />
      <article className="mx-auto max-w-3xl px-4 py-16">
        <Link href="/guides" className="mb-10 inline-block font-semibold text-violet hover:underline">← {ui.back}</Link>
        {g.sections.map((s) => (
          <section key={s.h} className="mb-12">
            <h2 className="mb-5 font-display text-3xl uppercase">{s.h}</h2>
            {s.p?.map((p, i) => <p key={i} className="mb-4 text-lg text-ink/85">{p}</p>)}
            {s.steps && <Steps items={s.steps} />}
            {s.list && <Bullets items={s.list} />}
          </section>
        ))}
        <Button href={g.cta.href} variant="lime" size="lg">{g.cta.label}</Button>
      </article>
      <section className="mx-auto max-w-3xl px-4 pb-20">
        <h2 className="mb-5 font-display text-3xl uppercase">{ui.related}</h2>
        <ul className="space-y-3">
          {tutorials.filter((x) => x.slug !== slug).map((x) => (
            <li key={x.slug}><Link href={`/guides/${x.slug}`} className="text-lg font-semibold text-violet hover:underline">{x.title}</Link></li>
          ))}
        </ul>
      </section>
    </main>
  );
}
