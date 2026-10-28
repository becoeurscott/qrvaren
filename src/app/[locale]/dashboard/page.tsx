import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { robots: { index: false } };

// App shell for signed-in users. Real data arrives with Phase 2 (auth + cards).
export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dash");
  const tiles = [
    { k: "card", n: "—" },
    { k: "qrs", n: "0" },
    { k: "scans", n: "0" },
  ];
  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-32">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-5xl uppercase">{t("title")}</h1>
        <Button href="/create" variant="ink">{t("newQr")}</Button>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {tiles.map((x, i) => (
          <Reveal key={x.k} delay={i * 100}>
            <div className="rounded-[1.75rem] bg-white p-6">
              <p className="text-sm font-bold uppercase tracking-widest text-slate">{t(x.k)}</p>
              <p className="mt-3 font-display text-5xl text-violet">{x.n}</p>
              <p className="mt-2 text-sm text-slate">{t("empty")}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </main>
  );
}
