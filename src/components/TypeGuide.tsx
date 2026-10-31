import type { TypeGuide as Guide } from "@/content/guides/types";
import { Bullets, FaqList, JsonLd, Steps, faqLd, howToLd } from "./Guide";

// How-to and FAQ shown under the generator on /create/<type>.
export function TypeGuide({ guide }: { guide: Guide }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20">
      <JsonLd data={howToLd(guide.title, guide.steps)} />
      <JsonLd data={faqLd(guide.faq)} />
      <h2 className="mb-6 font-display text-4xl uppercase">{guide.title}</h2>
      {guide.intro.map((p, i) => <p key={i} className="mb-4 text-lg text-ink/85">{p}</p>)}
      <h3 className="mb-4 mt-10 text-2xl font-bold">{guide.stepsTitle}</h3>
      <Steps items={guide.steps} />
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div><h3 className="mb-4 text-2xl font-bold">{guide.usesTitle}</h3><Bullets items={guide.uses} /></div>
        <div><h3 className="mb-4 text-2xl font-bold">{guide.tipsTitle}</h3><Bullets items={guide.tips} /></div>
      </div>
      <div className="mt-14"><FaqList title={guide.faqTitle} items={guide.faq} /></div>
    </section>
  );
}
