import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/Landing";
import { Reveal } from "@/components/motion";
import { LoginButton } from "@/components/LoginButton";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("title"), robots: { index: false } };
}

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  return (
    <main>
      <PageHero title={t("title")} sub={t("sub")} />
      <section className="mx-auto max-w-md px-4 py-20">
        <Reveal>
          <div className="rounded-[2rem] bg-white p-8 shadow-[0_30px_60px_-30px_rgba(23,20,58,0.4)]">
            <LoginButton label={t("google")} soon={t("soon")} />
            <p className="mt-6 text-sm text-slate">{t("why")}</p>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
