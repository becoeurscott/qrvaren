import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getPublicCard } from "@/modules/cards/application/public";
import { cardUrl } from "@/modules/cards/domain/cardUrl";
import { CardView, type CardLabels } from "@/modules/cards/interface/CardView";
import { BRAND_NAME, SITE_URL } from "@/shared/config";
import { ReportCard, ViewBeacon } from "./CardActions";

type Props = { params: Promise<{ slug: string }> };

// Served from the cache and refreshed when the owner saves (revalidatePath in saveCard).
export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const card = await getPublicCard(slug);
  if (!card || card.status !== "active") return { title: BRAND_NAME, robots: { index: false } };
  return {
    title: card.tagline ? `${card.name} — ${card.tagline}` : card.name,
    description: card.description?.slice(0, 160) ?? card.tagline ?? undefined,
    alternates: { canonical: cardUrl(card.slug) },
    openGraph: { title: card.name, description: card.tagline ?? undefined, url: cardUrl(card.slug), images: card.photo_url ? [card.photo_url] : undefined },
  };
}

export default async function PublicCardPage({ params }: Props) {
  const { slug } = await params;
  const card = await getPublicCard(slug);
  const t = await getTranslations({ locale: card?.locale ?? "en", namespace: "cardPage" });
  const home = `${SITE_URL}/${card?.locale ?? "en"}/business-card`;

  // Never a bare 404: suspended or missing cards explain and point to the site (spec 5.2).
  if (!card || card.status !== "active") {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-center text-white grid-bg">
        <div className="max-w-sm">
          <p className="font-display text-5xl uppercase text-lime">{card ? t("suspendedTitle") : t("missingTitle")}</p>
          <p className="mt-4 text-white/80">{card ? t("suspendedText", { name: card.name }) : t("missingText")}</p>
          <a href={home} className="mt-8 inline-block rounded-full bg-lime px-6 py-3 font-semibold text-ink">{t("makeYours")}</a>
        </div>
      </main>
    );
  }

  const keys = ["call", "save", "directions", "hours", "contact", "links", "gallery", "closed", "website", "email", "phone", "address", "today"] as const;
  const labels = { ...Object.fromEntries(keys.map((k) => [k, t(k)])), days: t.raw("days") } as CardLabels;
  return (
    <main className="min-h-screen px-3 py-6 grid-bg sm:py-12">
      <CardView
        card={card}
        labels={labels}
        vcfHref={`/c/${card.slug}/vcf`}
        footer={
          <div className="mt-8 space-y-3 border-t border-ink/10 pt-5">
            <a href={home} className="block text-center text-xs font-semibold text-slate">{t("madeWith", { brand: BRAND_NAME })}</a>
          </div>
        }
      />
      <div className="mx-auto mt-6 max-w-md">
        <ReportCard slug={card.slug} labels={{ report: t("report"), reportReason: t("reportReason"), reportSend: t("reportSend"), reportThanks: t("reportThanks") }} />
      </div>
      <ViewBeacon slug={card.slug} />
    </main>
  );
}
