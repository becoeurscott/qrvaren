import type { ReactNode } from "react";

// Small building blocks shared by the admin pages, in the site's Varen palette.
export const input = "w-full rounded-xl bg-lavender px-3 py-2 text-sm outline-none ring-violet focus:ring-2";
export const btn = "rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet";
export const btnGhost = "rounded-full px-3 py-1.5 text-sm font-semibold ring-2 ring-ink/10 transition hover:bg-lavender";
export const btnDanger = "rounded-full px-3 py-1.5 text-sm font-semibold text-coral ring-2 ring-coral/30 transition hover:bg-coral hover:text-white";

export function PageHead({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {sub && <p className="text-sm font-bold uppercase tracking-widest text-violet">{sub}</p>}
        <h1 className="mt-1 font-display text-4xl uppercase md:text-5xl">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[1.75rem] bg-white p-6 ${className}`}>
      {title && <h2 className="mb-4 font-display text-xl uppercase tracking-wide">{title}</h2>}
      {children}
    </section>
  );
}

export function Flash({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null;
  return <p className={`mb-4 rounded-2xl px-4 py-3 text-sm font-semibold ${error ? "bg-coral/15 text-coral" : "bg-lime"}`}>{error ?? ok}</p>;
}

/** Hidden fields every admin form sends: where to return and the secret panel slug. */
export function Ctx({ back, panel }: { back: string; panel: string }) {
  return (<><input type="hidden" name="back" value={back} /><input type="hidden" name="panel" value={panel} /></>);
}

export type AdminProps = { params: Promise<{ locale: string; panel: string }>; searchParams: Promise<{ ok?: string; error?: string; q?: string; edit?: string }> };
