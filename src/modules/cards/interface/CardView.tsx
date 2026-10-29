import type { ReactNode } from "react";
import { DAYS, SOCIALS, mapsLink, socialUrl, telLink, type CardContent, type CardTheme, type Day } from "../domain/card";
import { presetIconDataUrl } from "@/modules/qr/interface/presetIcons";

// The card as customers see it. Shared by the public page and the editor preview, so the preview
// is exactly the live card. No hooks: renders on the server and in the browser.

export type CardLabels = {
  call: string; save: string; directions: string; hours: string; contact: string; links: string; gallery: string;
  closed: string; website: string; email: string; phone: string; address: string; today: string;
  days: Record<Day, string>;
};

const SOCIAL_ICON = { instagram: "instagram", facebook: "facebook", tiktok: "tiktok", x: "x", linkedin: "linkedin", youtube: "youtube", whatsapp: "whatsapp" } as const;

// Templates: same layout, different colours. Keys match CARD_THEMES.
export const THEMES: Record<CardTheme, {
  article: string; cover: string; ring: string; initial: string; muted: string; action: string; primary: string; link: string; panel: string; heading: string;
}> = {
  lavender: {
    article: "bg-lavender text-ink", cover: "bg-violet grid-bg", ring: "border-lavender", initial: "bg-sun text-ink", muted: "text-slate",
    action: "bg-white text-ink shadow-sm", primary: "!bg-lime", link: "bg-ink text-white", panel: "bg-white", heading: "text-violet",
  },
  midnight: {
    article: "bg-ink text-white", cover: "bg-gradient-to-br from-violet to-ink", ring: "border-ink", initial: "bg-lime text-ink", muted: "text-white/70",
    action: "bg-white/10 text-white", primary: "!bg-lime !text-ink", link: "bg-lime text-ink", panel: "bg-white/5 ring-1 ring-white/10", heading: "text-lime",
  },
  minimal: {
    article: "bg-white text-ink ring-1 ring-ink/10", cover: "bg-[#f1f1f4]", ring: "border-white", initial: "bg-ink text-white", muted: "text-slate",
    action: "bg-[#f1f1f4] text-ink", primary: "!bg-ink !text-white", link: "border-2 border-ink text-ink", panel: "bg-[#f1f1f4]", heading: "text-ink",
  },
  sunset: {
    article: "bg-[#fff4e6] text-ink", cover: "bg-gradient-to-br from-coral via-pink to-sun", ring: "border-[#fff4e6]", initial: "bg-sun text-ink", muted: "text-slate",
    action: "bg-white text-ink shadow-sm", primary: "!bg-coral !text-white", link: "bg-coral text-white", panel: "bg-white", heading: "text-coral",
  },
};

export function CardView({ card, labels, vcfHref, today, footer }: {
  card: CardContent; labels: CardLabels; vcfHref?: string; today?: Day; footer?: ReactNode;
}) {
  const socials = SOCIALS.map((k) => [k, card.socials[k] ? socialUrl(k, card.socials[k]!) : null] as const).filter(([, u]) => u);
  const th = THEMES[card.theme ?? "lavender"] ?? THEMES.lavender;
  const action = `flex flex-col items-center gap-1 rounded-2xl py-3 text-xs font-bold transition active:scale-95 ${th.action}`;
  // data-track: the public page counts taps on these (see ClickTracker).
  return (
    <article className={`mx-auto w-full max-w-md overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-30px_rgba(23,20,58,0.45)] ${th.article}`}>
      {/* Cover + logo */}
      <div className={`relative h-40 ${th.cover}`}>
        {card.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.photo_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
      </div>
      <div className="px-5 pb-6">
        <div className="relative z-10 -mt-12 flex items-end gap-3">
          <div className={`h-24 w-24 shrink-0 overflow-hidden rounded-3xl border-4 bg-white ${th.ring}`}>
            {card.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={card.logo_url} alt={card.name} className="h-full w-full object-cover" />
            ) : (
              <div className={`flex h-full w-full items-center justify-center font-display text-4xl uppercase ${th.initial}`}>{card.name.charAt(0) || "?"}</div>
            )}
          </div>
        </div>
        <h1 className="mt-3 font-display text-4xl uppercase leading-none [overflow-wrap:anywhere]">{card.name || "—"}</h1>
        {card.tagline && <p className={`mt-1 ${th.muted}`}>{card.tagline}</p>}

        {/* Call, save contact, directions */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          {card.phone ? <a className={`${action} ${th.primary}`} href={telLink(card.phone)} data-track="call"><span aria-hidden className="text-xl">📞</span>{labels.call}</a>
            : <span className={`${action} opacity-40`}><span aria-hidden className="text-xl">📞</span>{labels.call}</span>}
          <a className={action} href={vcfHref ?? "#"} download data-track="save"><span aria-hidden className="text-xl">💾</span>{labels.save}</a>
          {card.address ? <a className={action} href={mapsLink(card.address)} target="_blank" rel="noopener" data-track="directions"><span aria-hidden className="text-xl">🧭</span>{labels.directions}</a>
            : <span className={`${action} opacity-40`}><span aria-hidden className="text-xl">🧭</span>{labels.directions}</span>}
        </div>

        {card.description && <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed">{card.description}</p>}

        {socials.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {socials.map(([k, u]) => (
              <a key={k} href={u!} target="_blank" rel="noopener" aria-label={k} data-track={k} className="h-11 w-11 overflow-hidden rounded-xl transition active:scale-95">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={presetIconDataUrl(SOCIAL_ICON[k])} alt="" className="h-full w-full" />
              </a>
            ))}
          </div>
        )}

        {card.links.length > 0 && (
          <section className="mt-5 space-y-2" aria-label={labels.links}>
            {card.links.map((l, i) => (
              <a key={i} href={l.url} target="_blank" rel="noopener" data-track="link" className={`flex items-center justify-between rounded-2xl px-4 py-3 font-semibold ${th.link}`}>
                <span className="truncate">{l.label}</span><span aria-hidden>↗</span>
              </a>
            ))}
          </section>
        )}

        {(card.phone || card.email || card.website || card.address) && (
          <section className={`mt-5 rounded-2xl p-4 text-sm ${th.panel}`} aria-label={labels.contact}>
            <h2 className={`mb-2 text-xs font-bold uppercase tracking-widest ${th.heading}`}>{labels.contact}</h2>
            <dl className="space-y-2">
              {card.phone && <Row k={labels.phone} muted={th.muted}><a className="underline" href={telLink(card.phone)} data-track="call">{card.phone}</a></Row>}
              {card.email && <Row k={labels.email} muted={th.muted}><a className="underline [overflow-wrap:anywhere]" href={`mailto:${card.email}`} data-track="email">{card.email}</a></Row>}
              {card.website && <Row k={labels.website} muted={th.muted}><a className="underline [overflow-wrap:anywhere]" href={card.website} target="_blank" rel="noopener" data-track="website">{card.website.replace(/^https?:\/\/(www\.)?/, "")}</a></Row>}
              {card.address && <Row k={labels.address} muted={th.muted}><a className="underline" href={mapsLink(card.address)} target="_blank" rel="noopener" data-track="directions">{card.address}</a></Row>}
            </dl>
          </section>
        )}

        {card.hours.length > 0 && (
          <section className={`mt-5 rounded-2xl p-4 text-sm ${th.panel}`} aria-label={labels.hours}>
            <h2 className={`mb-2 text-xs font-bold uppercase tracking-widest ${th.heading}`}>{labels.hours}</h2>
            <ul className="space-y-1">
              {DAYS.filter((d) => card.hours.some((h) => h.d === d)).map((d) => {
                const h = card.hours.find((x) => x.d === d)!;
                return (
                  <li key={d} className={`flex justify-between gap-3 ${d === today ? `font-bold ${th.heading}` : ""}`}>
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

function Row({ k, muted, children }: { k: string; muted: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className={`w-20 shrink-0 ${muted}`}>{k}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}
