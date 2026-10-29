import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getUser } from "@/shared/auth";
import { SITE_URL } from "@/shared/config";
import { getMyCard } from "@/modules/cards/application/actions";
import { cardUrl } from "@/modules/cards/domain/cardUrl";
import { PrintDesigner } from "@/modules/print/interface/PrintDesigner";

export const metadata: Metadata = { robots: { index: false } };

// Printable business card designer, prefilled from the user's hosted card when there is one.
export default async function PrintPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await getUser();
  if (!user) redirect(`/${locale}/login?next=/dashboard/print`);
  const t = await getTranslations("print");
  const card = await getMyCard();
  const initial = {
    name: card?.name ?? (user.profile as { name?: string } | null)?.name ?? "",
    title: card?.tagline ?? "",
    phone: card?.phone ?? "",
    email: card?.email ?? user.email ?? "",
    website: card?.website ?? "",
    address: card?.address ?? "",
    logo: card?.logo_url ?? undefined,
    qr: card ? cardUrl(card.slug) : SITE_URL,
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-32">
      <Link href="/dashboard" className="text-sm font-semibold text-violet">← {t("backLink")}</Link>
      <h1 className="mt-2 font-display text-5xl uppercase">{t("title")}</h1>
      <p className="mb-8 mt-2 max-w-2xl text-slate">{t("sub")}</p>
      <PrintDesigner initial={initial} />
    </main>
  );
}
