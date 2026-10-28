import { setRequestLocale } from "next-intl/server";
import { CardPitch, HowItWorks, LandingHero, Ticker, Trust, TypesGrid } from "@/components/Landing";
import { getPrices } from "@/modules/entitlements/application/settings";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const prices = await getPrices();
  return (
    <main>
      <LandingHero />
      <Ticker />
      <TypesGrid />
      <HowItWorks />
      <CardPitch monthly={`$${prices.monthly}`} yearly={`$${prices.yearly}`} />
      <Trust />
    </main>
  );
}
