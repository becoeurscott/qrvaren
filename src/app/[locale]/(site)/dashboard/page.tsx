import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/Button";
import { signOut } from "@/app/actions/auth";
import { getUser } from "@/shared/auth";

export const metadata: Metadata = { robots: { index: false } };

// Signed-in area. Card editor, stored QR codes and scan stats arrive with Phase 2.
export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);
  const t = await getTranslations("dash");
  const name = (user.profile as { name?: string } | null)?.name || user.email;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-32">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-violet">{t("signedInAs")} {user.email}</p>
          <h1 className="mt-2 font-display text-5xl uppercase">{t("hello", { name: String(name).split("@")[0] })}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button href="/create" variant="ink">{t("newQr")}</Button>
          <form action={signOut}>
            <input type="hidden" name="locale" value={locale} />
            <button className="rounded-full px-5 py-3 font-semibold ring-2 ring-ink/15 transition hover:bg-white">{t("logout")}</button>
          </form>
        </div>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <Reveal>
          <div className="flex h-full flex-col justify-between rounded-[1.75rem] bg-violet p-6 text-white grid-bg">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-lime">{t("card")}</p>
              <p className="mt-3 text-white/85">{t("cardSoon")}</p>
            </div>
            <span className="mt-6 inline-flex w-max rounded-full bg-lime px-4 py-2 text-sm font-bold text-ink">{t("soon")}</span>
          </div>
        </Reveal>
        {(["qrs", "scans"] as const).map((k, i) => (
          <Reveal key={k} delay={(i + 1) * 100}>
            <div className="rounded-[1.75rem] bg-white p-6">
              <p className="text-sm font-bold uppercase tracking-widest text-slate">{t(k)}</p>
              <p className="mt-3 font-display text-5xl text-violet">0</p>
              <p className="mt-2 text-sm text-slate">{t("empty")}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </main>
  );
}
