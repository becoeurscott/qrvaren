import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { BRAND_NAME, SITE_URL } from "@/shared/config";
import { CardPitch, HowItWorks, LandingHero, Ticker, Trust, TypesGrid } from "@/components/Landing";
import { Reveal } from "@/components/motion";
import { Generator } from "@/modules/qr/interface/Generator";
import { getPrices } from "@/modules/entitlements/application/settings";

type Faq = { q: string; a: string };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    title: { absolute: `${t("title")} | ${BRAND_NAME}` },
    description: t("desc"),
    alternates: {
      canonical: `/${locale}`,
      languages: { ...Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])), "x-default": `/${routing.defaultLocale}` },
    },
    openGraph: { type: "website", url: `/${locale}`, siteName: BRAND_NAME, title: t("title"), description: t("desc"), locale },
    twitter: { card: "summary_large_image", title: t("title"), description: t("desc") },
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const faq = t.raw("faq") as Faq[];
  const prices = await getPrices();
  // WebApplication + FAQPage structured data; FAQ content mirrors the visible section below.
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: BRAND_NAME,
      url: `${SITE_URL}/${locale}`,
      description: t("desc"),
      applicationCategory: "DesignApplication",
      operatingSystem: "Any",
      inLanguage: locale,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <LandingHero />
      <section id="generator" className="relative z-10 mx-auto mt-6 max-w-6xl px-4 pb-16 md:-mt-12">
        <h2 className="mb-6 text-center font-display text-3xl uppercase leading-tight sm:text-4xl">{t("gen")}</h2>
        <Reveal y={40}><Generator /></Reveal>
      </section>
      <Ticker />
      <TypesGrid />
      <HowItWorks />
      <CardPitch monthly={`$${prices.monthly}`} yearly={`$${prices.yearly}`} />
      <section className="mx-auto max-w-3xl px-4 py-20">
        <h2 className="mb-8 font-display text-4xl uppercase">{t("faqTitle")}</h2>
        {faq.map((f) => (
          <details key={f.q} className="border-b border-ink/15 py-4">
            <summary className="cursor-pointer text-lg font-bold">{f.q}</summary>
            <p className="mt-2 text-ink/80">{f.a}</p>
          </details>
        ))}
      </section>
      <Trust />
    </main>
  );
}
