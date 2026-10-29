import type { CSSProperties, ReactNode } from "react";
import { DAYS, SOCIALS, mapsLink, socialUrl, telLink, type CardContent, type Day, type PageKind } from "../domain/card";
import { backgroundCss, resolveDesign, type Design } from "../domain/design";
import { fontFamily, pageFontVars } from "./fonts";
import { presetIconDataUrl } from "@/modules/qr/interface/presetIcons";

// A card or bio page as visitors see it. Shared by the public page and the editor preview, so the
// preview is exactly the live page. Every colour, font and shape comes from the design.
// No hooks: renders on the server and in the browser.

export type CardLabels = {
  call: string; save: string; directions: string; hours: string; contact: string; links: string; gallery: string;
  closed: string; website: string; email: string; phone: string; address: string; today: string;
  days: Record<Day, string>;
};

const SOCIAL_ICON = { instagram: "instagram", facebook: "facebook", tiktok: "tiktok", x: "x", linkedin: "linkedin", youtube: "youtube", whatsapp: "whatsapp" } as const;
const RADIUS = { square: "6px", rounded: "16px", pill: "9999px" } as const;

/** Inline style for the logo image inside its frame: fill or fit, then the user's zoom and offset. */
export function logoStyle(l: Design["logo"], fit: Design["logo"]["fit"] = l.fit): CSSProperties {
  // No transform when untouched: a transformed image gets its own graphics layer, which costs memory on phones.
  const moved = l.x !== 0 || l.y !== 0 || l.zoom !== 1;
  return { objectFit: fit, ...(moved ? { transform: `translate(${l.x}%, ${l.y}%) scale(${l.zoom})` } : {}) };
}

/** Inline style for a link button in the design's button style. */
export function buttonStyle(d: Design): CSSProperties {
  const b = d.buttons;
  const radius = RADIUS[b.radius];
  switch (b.style) {
    // Outline: border and label share the button colour, so the label always reads on the page.
    case "outline": return { borderRadius: radius, border: `2px solid ${b.color}`, color: b.color, background: "transparent" };
    case "shadow": return { borderRadius: radius, border: `2px solid ${d.text}`, color: b.text, background: b.color, boxShadow: `4px 4px 0 ${d.text}` };
    case "soft": return { borderRadius: radius, color: b.text, background: `${b.color}cc`, backdropFilter: "blur(6px)" };
    default: return { borderRadius: radius, color: b.text, background: b.color };
  }
}

export function CardView({ card, kind = "card", labels, vcfHref, today, footer, framed = true }: {
  card: CardContent; kind?: PageKind; labels: CardLabels; vcfHref?: string; today?: Day; footer?: ReactNode;
  /** Rounded, shadowed frame (editor preview, card dashboard). The public page shows it full-bleed. */
  framed?: boolean;
}) {
  const d = resolveDesign(card.theme, card.design);
  const socials = SOCIALS.map((k) => [k, card.socials[k] ? socialUrl(k, card.socials[k]!) : null] as const).filter(([, u]) => u);
  const btn = buttonStyle(d);
  const panel: CSSProperties = { background: d.panel, borderRadius: RADIUS[d.buttons.radius === "pill" ? "rounded" : d.buttons.radius] };
  const heading: CSSProperties = { color: d.accent };
  const avatar = card.logo_url ?? null;
  const initial = (card.name || "?").charAt(0);
  const titleFont = fontFamily(d.header.title_font ?? d.font);
  const title = d.header.title === "logo" && d.header.title_logo_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={d.header.title_logo_url} alt={card.name} className="mx-auto max-h-20 max-w-[80%] object-contain" />
  ) : (
    <h1 className="text-4xl uppercase leading-none [overflow-wrap:anywhere]" style={{ fontFamily: titleFont, color: d.header.title_color ?? d.text }}>{card.name || "—"}</h1>
  );
  const pic = (cls: string, style?: CSSProperties, contain = false) => (
    <div className={`shrink-0 overflow-hidden ${cls}`} style={{ background: avatar && contain ? "transparent" : d.panel, ...style }}>
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt={card.name} className="h-full w-full" style={logoStyle(d.logo, contain ? "contain" : undefined)} />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-5xl uppercase" style={{ fontFamily: titleFont, color: d.accent }}>{initial}</div>
      )}
    </div>
  );
  // Tiles (call, save, directions) on business cards only.
  const tile = "flex flex-col items-center gap-1 py-3 text-xs font-bold transition active:scale-95";
  const tileStyle: CSSProperties = { background: d.panel, color: d.text, borderRadius: RADIUS[d.buttons.radius === "pill" ? "rounded" : d.buttons.radius] };
  const layout = d.header.layout;

  return (
    <article
      className={`${pageFontVars} mx-auto w-full max-w-md overflow-hidden ${framed ? "rounded-[2rem] shadow-[0_30px_60px_-30px_rgba(23,20,58,0.45)]" : ""}`}
      style={{ background: framed ? backgroundCss(d.bg) : "transparent", color: d.text, fontFamily: fontFamily(d.font) }}
    >
      {/* Header */}
      {layout === "hero" ? (
        <div className="relative h-80 overflow-hidden">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" className="absolute inset-0 h-full w-full" style={logoStyle(d.logo)} />
          ) : <div className="absolute inset-0" style={{ background: d.accent }} />}
          <div className="absolute inset-x-0 bottom-0 h-2/3" style={{ background: `linear-gradient(to top, ${d.bg.color}, transparent)` }} />
        </div>
      ) : layout === "banner" ? (
        <div className="relative h-36" style={{ background: d.accent }}>
          {card.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={card.photo_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
        </div>
      ) : null}

      <div className="px-5 pb-6 text-center">
        {layout === "classic" && <div className="flex justify-center pt-10">{pic("h-24 w-24 rounded-full")}</div>}
        {layout === "banner" && <div className="relative z-10 -mt-12 flex justify-center">{pic("h-24 w-24 rounded-full", { border: `4px solid ${d.bg.color}` })}</div>}
        {layout === "cutout" && <div className="flex justify-center pt-8">{pic("h-56 w-56", undefined, true)}</div>}
        {layout === "shape" && (
          <div className="flex justify-center pt-10">{pic("h-44 w-52", { borderRadius: "62% 38% 55% 45% / 48% 58% 42% 52%" })}</div>
        )}
        <div className={layout === "hero" ? "-mt-16 relative" : "mt-4"}>{title}</div>
        {card.tagline && <p className="mt-2" style={{ color: d.muted }}>{card.tagline}</p>}

        {kind === "card" && (
          <div className="mt-5 grid grid-cols-3 gap-2">
            {card.phone ? <a className={tile} style={{ ...tileStyle, ...btn, border: undefined, boxShadow: undefined }} href={telLink(card.phone)} data-track="call"><span aria-hidden className="text-xl">📞</span>{labels.call}</a>
              : <span className={`${tile} opacity-40`} style={tileStyle}><span aria-hidden className="text-xl">📞</span>{labels.call}</span>}
            <a className={tile} style={tileStyle} href={vcfHref ?? "#"} download data-track="save"><span aria-hidden className="text-xl">💾</span>{labels.save}</a>
            {card.address ? <a className={tile} style={tileStyle} href={mapsLink(card.address)} target="_blank" rel="noopener" data-track="directions"><span aria-hidden className="text-xl">🧭</span>{labels.directions}</a>
              : <span className={`${tile} opacity-40`} style={tileStyle}><span aria-hidden className="text-xl">🧭</span>{labels.directions}</span>}
          </div>
        )}

        {card.description && <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed">{card.description}</p>}

        {socials.length > 0 && (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {socials.map(([k, u]) => (
              <a key={k} href={u!} target="_blank" rel="noopener" aria-label={k} data-track={k} className="h-11 w-11 overflow-hidden rounded-xl transition active:scale-95">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={presetIconDataUrl(SOCIAL_ICON[k])} alt="" className="h-full w-full" />
              </a>
            ))}
          </div>
        )}

        {card.links.length > 0 && (
          <section className="mt-5 space-y-3" aria-label={labels.links}>
            {card.links.map((l, i) => (
              <a key={i} href={l.url} target="_blank" rel="noopener" data-track="link" style={btn}
                className="relative flex min-h-14 items-center justify-center px-10 py-3 font-semibold transition active:scale-[0.98]">
                <span className="truncate">{l.label}</span><span aria-hidden className="absolute right-4">↗</span>
              </a>
            ))}
          </section>
        )}

        {(card.phone || card.email || card.website || card.address) && (
          <section className="mt-5 p-4 text-left text-sm" style={panel} aria-label={labels.contact}>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-widest" style={heading}>{labels.contact}</h2>
            <dl className="space-y-2">
              {card.phone && <Row k={labels.phone} muted={d.muted}><a className="underline" href={telLink(card.phone)} data-track="call">{card.phone}</a></Row>}
              {card.email && <Row k={labels.email} muted={d.muted}><a className="underline [overflow-wrap:anywhere]" href={`mailto:${card.email}`} data-track="email">{card.email}</a></Row>}
              {card.website && <Row k={labels.website} muted={d.muted}><a className="underline [overflow-wrap:anywhere]" href={card.website} target="_blank" rel="noopener" data-track="website">{card.website.replace(/^https?:\/\/(www\.)?/, "")}</a></Row>}
              {card.address && <Row k={labels.address} muted={d.muted}><a className="underline" href={mapsLink(card.address)} target="_blank" rel="noopener" data-track="directions">{card.address}</a></Row>}
            </dl>
          </section>
        )}

        {card.hours.length > 0 && (
          <section className="mt-5 p-4 text-left text-sm" style={panel} aria-label={labels.hours}>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-widest" style={heading}>{labels.hours}</h2>
            <ul className="space-y-1">
              {DAYS.filter((x) => card.hours.some((h) => h.d === x)).map((x) => {
                const h = card.hours.find((y) => y.d === x)!;
                return (
                  <li key={x} className={`flex justify-between gap-3 ${x === today ? "font-bold" : ""}`} style={x === today ? heading : undefined}>
                    <span>{labels.days[x]}{x === today ? ` · ${labels.today}` : ""}</span>
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
      <dt className="w-20 shrink-0" style={{ color: muted }}>{k}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}
