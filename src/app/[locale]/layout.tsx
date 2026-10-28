import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Anton, Bricolage_Grotesque } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { BRAND_NAME, SITE_URL } from "@/shared/config";
import { Analytics } from "@/components/Analytics";
import "../globals.css";

const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${BRAND_NAME} — ${t("title1")} ${t("title2")}`, template: `%s — ${BRAND_NAME}` },
    description: t("sub"),
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <html lang={locale}>
      <body className={`${anton.variable} ${bricolage.variable} font-sans antialiased`}>
        <NextIntlClientProvider>
          {children}
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
