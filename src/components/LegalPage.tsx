import { getTranslations } from "next-intl/server";
import { PageHero } from "./Landing";
import { Reveal } from "./motion";
import { CONTACT_EMAIL, LEGAL, legalReady } from "@/shared/config";

type Section = { h: string; p: string[] };

/** Shared layout for the privacy policy, terms of use and copyright policy. Texts live in messages under legal.*. */
export async function LegalPage({ doc }: { doc: "privacy" | "terms" | "copyright" }) {
  const t = await getTranslations("legal");
  const sections = t.raw(`${doc}.sections`) as Section[];
  return (
    <main>
      <PageHero eyebrow={t("updated")} title={t(`${doc}.title`)} sub={t(`${doc}.intro`)} />
      <section className="mx-auto max-w-3xl px-4 py-16">
        <ol className="space-y-4">
          {sections.map((s, i) => (
            <Reveal key={i} y={30}>
              <li className="rounded-[1.75rem] bg-white p-6 sm:p-8">
                <h2 className="flex items-baseline gap-3 text-xl font-bold">
                  <span className="font-mono text-sm text-violet">{String(i + 1).padStart(2, "0")}</span>
                  {s.h}
                </h2>
                <div className="mt-3 space-y-3 text-slate">
                  {s.p.map((para, j) => <p key={j}>{para}</p>)}
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
        <div className="mt-8 rounded-[1.75rem] bg-ink p-6 text-white sm:p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-lime">{t("contact")}</p>
          {CONTACT_EMAIL ? (
            <a href={`mailto:${CONTACT_EMAIL}`} className="mt-2 inline-block text-xl font-semibold underline decoration-lime underline-offset-4">
              {CONTACT_EMAIL}
            </a>
          ) : (
            <p className="mt-2 text-white/80">{t("contactSoon")}</p>
          )}
          {legalReady() && (
            <p className="mt-4 text-sm text-white/70">{t("operator")}: {LEGAL.name}, {LEGAL.address}, {LEGAL.country}</p>
          )}
        </div>
      </section>
    </main>
  );
}
