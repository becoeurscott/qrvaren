import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link, routing } from "@/i18n/routing";
import { PageHero } from "@/components/Landing";
import { guideContent } from "@/content/guides";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { ui } = guideContent(locale);
  return {
    title: ui.guidesTitle,
    description: ui.guidesSub,
    alternates: { canonical: `/${locale}/guides`, languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/guides`])) },
  };
}

export default async function GuidesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { ui, tutorials } = guideContent(locale);
  return (
    <main>
      <PageHero eyebrow={ui.guides} title={ui.guidesTitle} sub={ui.guidesSub} />
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-20 sm:grid-cols-2 lg:grid-cols-3">
        {tutorials.map((g, i) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className="group flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/10 transition hover:-translate-y-1 hover:shadow-lg">
            <span className="mb-4 font-mono text-xs font-bold text-violet">{String(i + 1).padStart(2, "0")} · {ui.minutes.replace("{n}", String(g.minutes))}</span>
            <h2 className="mb-3 text-xl font-bold leading-snug">{g.title}</h2>
            <p className="mb-6 flex-1 text-ink/75">{g.desc}</p>
            <span className="font-semibold text-violet group-hover:underline">{ui.read} →</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
