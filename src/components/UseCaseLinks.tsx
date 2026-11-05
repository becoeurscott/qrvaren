import { Link } from "@/i18n/routing";
import { useCaseContent } from "@/content/usecases";

// Internal links between the /create landing pages, so each use-case page is reachable and passes relevance.
export function UseCaseLinks({ locale, current }: { locale: string; current?: string }) {
  const { related, items } = useCaseContent(locale);
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <h2 className="mb-6 font-display text-3xl uppercase">{related}</h2>
      <ul className="flex flex-wrap gap-3">
        {items.filter((u) => u.slug !== current).map((u) => (
          <li key={u.slug}>
            <Link href={`/create/${u.slug}`} className="inline-block rounded-full bg-white px-5 py-2.5 font-semibold shadow-sm ring-1 ring-ink/10 transition hover:-translate-y-0.5 hover:text-violet">
              {u.h1}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
