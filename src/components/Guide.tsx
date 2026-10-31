import type { Faq } from "@/content/guides/types";

// Shared building blocks for the type-page how-tos and the /guides articles.
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }} />;
}

export function Steps({ items }: { items: string[] }) {
  return (
    <ol className="space-y-3">
      {items.map((s, i) => (
        <li key={i} className="flex gap-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-violet font-mono text-sm font-bold text-white">{i + 1}</span>
          <span className="pt-1 text-ink/85">{s}</span>
        </li>
      ))}
    </ol>
  );
}

export function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((s, i) => (
        <li key={i} className="flex gap-3 text-ink/85"><span className="text-violet" aria-hidden>✺</span>{s}</li>
      ))}
    </ul>
  );
}

export function FaqList({ title, items }: { title: string; items: Faq[] }) {
  return (
    <div>
      <h2 className="mb-4 font-display text-3xl uppercase">{title}</h2>
      {items.map((f) => (
        <details key={f.q} className="border-b border-ink/15 py-4">
          <summary className="cursor-pointer text-lg font-bold">{f.q}</summary>
          <p className="mt-2 text-ink/80">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export const faqLd = (items: Faq[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

export const howToLd = (name: string, steps: string[]) => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  name,
  step: steps.map((text, i) => ({ "@type": "HowToStep", position: i + 1, text })),
});
