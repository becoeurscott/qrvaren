import type { ReactNode } from "react";
import { DAYS, SOCIALS, mapsLink, socialUrl, telLink, type CardContent, type Day } from "../domain/card";
import { presetIconDataUrl } from "@/modules/qr/interface/presetIcons";

// The card as customers see it. Shared by the public page and the editor preview, so the preview
// is exactly the live card. No hooks: renders on the server and in the browser.

export type CardLabels = {
  call: string; save: string; directions: string; hours: string; contact: string; links: string; gallery: string;
  closed: string; website: string; email: string; phone: string; address: string; today: string;
  days: Record<Day, string>;
};

const SOCIAL_ICON = { instagram: "instagram", facebook: "facebook", tiktok: "tiktok", x: "x", linkedin: "linkedin", youtube: "youtube", whatsapp: "whatsapp" } as const;

export function CardView({ card, labels, vcfHref, today, footer }: {
  card: CardContent; labels: CardLabels; vcfHref?: string; today?: Day; footer?: ReactNode;
}) {
  const socials = SOCIALS.map((k) => [k, card.socials[k] ? socialUrl(k, card.socials[k]!) : null] as const).filter(([, u]) => u);
  const action = "flex flex-col items-center gap-1 rounded-2xl bg-white py-3 text-xs font-bold text-ink shadow-sm transition active:scale-95";
  return (
    <article className="mx-auto w-full max-w-md overflow-hidden rounded-[2rem] bg-lavender text-ink shadow-[0_30px_60px_-30px_rgba(23,20,58,0.45)]">
      {/* Cover + logo */}
      <div className="relative h-40 bg-violet grid-bg">
        {card.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.photo_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
      </div>
      <div className="px-5 pb-6">
        <div className="relative z-10 -mt-12 flex items-end gap-3">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-3xl border-4 border-lavender bg-white">
            {card.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={card.logo_url} alt={card.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-sun font-display text-4xl uppercase">{card.name.charAt(0) || "?"}</div>
            )}
          </div>
        </div>
        <h1 className="mt-3 font-display text-4xl uppercase leading-none [overflow-wrap:anywhere]">{card.name || "—"}</h1>
        {card.tagline && <p className="mt-1 text-slate">{card.tagline}</p>}

        {/* Call, save contact, directions */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          {card.phone ? <a className={`${action} !bg-lime`} href={telLink(card.phone)}><span aria-hidden className="text-xl">📞</span>{labels.call}</a>
            : <span className={`${action} opacity-40`}><span aria-hidden className="text-xl">📞</span>{labels.call}</span>}
          <a className={action} href={vcfHref ?? "#"} download><span aria-hidden className="text-xl">💾</span>{labels.save}</a>
          {card.address ? <a className={action} href={mapsLink(card.address)} target="_blank" rel="noopener"><span aria-hidden className="text-xl">🧭</span>{labels.directions}</a>
            : <span className={`${action} opacity-40`}><span aria-hidden className="text-xl">🧭</span>{labels.directions}</span>}
        </div>

        {card.description && <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed">{card.description}</p>}

        {socials.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {socials.map(([k, u]) => (
              <a key={k} href={u!} target="_blank" rel="noopener" aria-label={k} className="h-11 w-11 overflow-hidden rounded-xl transition active:scale-95">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={presetIconDataUrl(SOCIAL_ICON[k])} alt="" className="h-full w-full" />
              </a>
            ))}
          </div>
        )}

        {card.links.length > 0 && (
          <section className="mt-5 space-y-2" aria-label={labels.links}>
            {card.links.map((l, i) => (
              <a key={i} href={l.url} target="_blank" rel="noopener" className="flex items-center justify-between rounded-2xl bg-ink px-4 py-3 font-semibold text-white">
                <span className="truncate">{l.label}</span><span aria-hidden>↗</span>
              </a>
            ))}
          </section>
        )}

        {(card.phone || card.email || card.website || card.address) && (
          <section className="mt-5 rounded-2xl bg-white p-4 text-sm" aria-label={labels.contact}>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-violet">{labels.contact}</h2>
            <dl className="space-y-2">
              {card.phone && <Row k={labels.phone}><a className="underline" href={telLink(card.phone)}>{card.phone}</a></Row>}
              {card.email && <Row k={labels.email}><a className="underline [overflow-wrap:anywhere]" href={`mailto:${card.email}`}>{card.email}</a></Row>}
              {card.website && <Row k={labels.website}><a className="underline [overflow-wrap:anywhere]" href={card.website} target="_blank" rel="noopener">{card.website.replace(/^https?:\/\/(www\.)?/, "")}</a></Row>}
              {card.address && <Row k={labels.address}><a className="underline" href={mapsLink(card.address)} target="_blank" rel="noopener">{card.address}</a></Row>}
            </dl>
          </section>
        )}

        {card.hours.length > 0 && (
          <section className="mt-5 rounded-2xl bg-white p-4 text-sm" aria-label={labels.hours}>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-violet">{labels.hours}</h2>
            <ul className="space-y-1">
              {DAYS.filter((d) => card.hours.some((h) => h.d === d)).map((d) => {
                const h = card.hours.find((x) => x.d === d)!;
                return (
                  <li key={d} className={`flex justify-between gap-3 ${d === today ? "font-bold text-violet" : ""}`}>
                    <span>{labels.days[d]}{d === today ? ` · ${labels.today}` : ""}</span>
                    <span>{h.closed || !h.o || !h.c ? labels.closed : `${h.o} – ${h.c}`}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {card.gallery.length > 0 && (
          <section className="mt-5 grid grid-cols-3 gap-2" aria-label={labels.gallery}>
            {card.gallery.map((g) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={g.key} src={g.url} alt="" loading="lazy" className="aspect-square w-full rounded-xl object-cover" />
            ))}
          </section>
        )}

        {footer}
      </div>
    </article>
  );
}

function Row({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 shrink-0 text-slate">{k}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}
