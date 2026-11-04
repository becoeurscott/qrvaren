import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { PageHero } from "@/components/Landing";
import { Reveal } from "@/components/motion";
import { Bullets, FaqList, JsonLd, Steps, faqLd, howToLd } from "@/components/Guide";
import { Scanner } from "@/modules/qr/interface/Scanner";
import { BRAND_NAME, SITE_URL } from "@/shared/config";

type Props = { params: Promise<{ locale: string }> };
type Faq = { q: string; a: string };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "scanner" });
  return {
    title: { absolute: `${t("title")} | ${BRAND_NAME}` },
    description: t("desc"),
    alternates: { canonical: `/${locale}/qr-code-scanner`, languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/qr-code-scanner`])) },
  };
}

export default async function ScannerPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("scanner");
  const how = t.raw("how") as string[];
  const faq = t.raw("faq") as Faq[];
  const app = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${BRAND_NAME} ${t("h1")}`,
    url: `${SITE_URL}/${locale}/qr-code-scanner`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
  return (
    <main>
      <JsonLd data={app} />
      <JsonLd data={howToLd(t("howTitle"), how)} />
      <JsonLd data={faqLd(faq)} />
      <PageHero eyebrow={t("nav")} title={t("h1")} sub={t("desc")} />
      <div className="relative z-10 mx-auto -mt-20 max-w-5xl px-4">
        <Reveal delay={200} y={60}><Scanner /></Reveal>
      </div>
      <section className="mx-auto max-w-3xl px-4 py-20">
        <h2 className="mb-6 font-display text-4xl uppercase">{t("howTitle")}</h2>
        <Steps items={how} />
        <h2 className="mb-6 mt-14 font-display text-4xl uppercase">{t("phoneTitle")}</h2>
        <Bullets items={t.raw("phone") as string[]} />
        <div className="mt-14"><FaqList title={t("faqTitle")} items={faq} /></div>
      </section>
    </main>
  );
}
