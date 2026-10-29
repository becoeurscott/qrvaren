import { z } from "zod";
import { profileUrl, whatsappUrl } from "../../qr/domain/presets";

// Business card model shared by the editor, the public page and the vCard download.

export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type Day = (typeof DAYS)[number];
export type Hours = { d: Day; o?: string; c?: string; closed?: boolean }[];

export const SOCIALS = ["instagram", "facebook", "tiktok", "x", "linkedin", "youtube", "whatsapp"] as const;
export type Social = (typeof SOCIALS)[number];

export type MediaRef = { url: string; key: string };

export type CardContent = {
  name: string;
  tagline?: string | null;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  hours: Hours;
  socials: Partial<Record<Social, string>>;
  links: { label: string; url: string }[];
  gallery: MediaRef[];
  logo_url?: string | null;
  logo_key?: string | null;
  photo_url?: string | null;
  photo_key?: string | null;
  locale: "en" | "es" | "fr";
};

export type Card = CardContent & {
  id: string;
  slug: string;
  status: "draft" | "active" | "suspended" | "hidden";
  plan?: "monthly" | "yearly" | null;
  paid_until?: string | null;
  expires_at?: string | null;
};

// Must match public.reserved_slugs and infra/card-subdomains/worker.js.
export const RESERVED_SLUGS = new Set([
  "www", "admin", "api", "app", "c", "mail", "email", "smtp", "ftp", "cdn", "static", "status", "help", "support", "blog",
  "dashboard", "login", "qrvaren", "create", "pricing", "privacy", "terms", "panel", "card", "cards", "cartes", "tarjetas",
]);
export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

/** "Café Le Petit Coin" -> "cafe-le-petit-coin" (subdomain-safe). */
export function slugify(name: string): string {
  const s = name
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63)
    .replace(/-+$/g, "");
  return s || "card";
}

/** Candidates to try in order: base, base-2, base-3... (reserved names start at -2). */
export function slugCandidates(name: string, count = 6): string[] {
  const base = slugify(name);
  const out = RESERVED_SLUGS.has(base) ? [] : [base];
  for (let i = 2; out.length < count; i++) out.push(`${base.slice(0, 60)}-${i}`);
  return out;
}

export const isValidSlug = (s: string) => SLUG_RE.test(s) && !RESERVED_SLUGS.has(s);

const optText = (max: number) => z.string().trim().max(max).optional().nullable().transform((v) => (v ? v : null));
/** "example.com" → "https://example.com"; links that already have a scheme are kept. */
export const withScheme = (v: string) => (v && !/^[a-z][a-z0-9+.-]*:/i.test(v) ? `https://${v.replace(/^\/+/, "")}` : v);
const url = z.string().trim().max(300).transform(withScheme).refine((v) => /^https?:\/\/[^\s.]+\.[^\s]+$/i.test(v), "url");
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

/** Validates editor input before it is written (the database re-checks lengths and formats). */
export const CardContentSchema = z.object({
  name: z.string().trim().min(1).max(80),
  tagline: optText(120),
  description: optText(1000),
  phone: optText(40).refine((v) => !v || (v.replace(/\D/g, "").length >= 6 && v.replace(/\D/g, "").length <= 15), "phone"),
  email: optText(120).refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "email"),
  website: z.union([url, z.literal("")]).nullable().optional().transform((v) => (v ? v : null)),
  address: optText(200),
  hours: z.array(z.object({ d: z.enum(DAYS), o: time.optional(), c: time.optional(), closed: z.boolean().optional() })).max(7),
  socials: z.partialRecord(z.enum(SOCIALS), z.string().trim().max(200)).transform((o) =>
    Object.fromEntries(Object.entries(o).filter(([, v]) => v)) as Partial<Record<Social, string>>),
  links: z.array(z.object({ label: z.string().trim().min(1).max(40), url })).max(8),
  gallery: z.array(z.object({ url: z.string().url(), key: z.string().min(1) })).max(8),
  logo_url: z.string().url().nullable().optional(),
  logo_key: z.string().nullable().optional(),
  photo_url: z.string().url().nullable().optional(),
  photo_key: z.string().nullable().optional(),
  locale: z.enum(["en", "es", "fr"]),
});

/** Public link for a social handle (usernames or pasted profile links). */
export function socialUrl(kind: Social, value: string): string | null {
  switch (kind) {
    case "instagram": return profileUrl(value, "https://www.instagram.com/", "instagram.com");
    case "facebook": return profileUrl(value, "https://www.facebook.com/", "facebook.com");
    case "tiktok": return profileUrl(value, "https://www.tiktok.com/@", "tiktok.com");
    case "x": return profileUrl(value, "https://x.com/", "x.com");
    case "linkedin": return profileUrl(value, "https://www.linkedin.com/in/", "linkedin.com");
    case "youtube": return profileUrl(value, "https://www.youtube.com/@", "youtube.com");
    case "whatsapp": return whatsappUrl(value);
  }
}

export const mapsLink = (address: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
export const telLink = (phone: string) => `tel:${phone.trim().startsWith("+") ? "+" : ""}${phone.replace(/\D/g, "")}`;

// vCard 3.0 escaping
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([;,])/g, "\\$1");

/** "Save contact" file for the card. */
export function cardVCard(card: Pick<CardContent, "name" | "tagline" | "phone" | "email" | "website" | "address">, pageUrl: string): string {
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${esc(card.name)}`, `ORG:${esc(card.name)}`];
  if (card.tagline) lines.push(`TITLE:${esc(card.tagline)}`);
  if (card.phone) lines.push(`TEL;TYPE=WORK,VOICE:${esc(card.phone)}`);
  if (card.email) lines.push(`EMAIL;TYPE=WORK:${esc(card.email)}`);
  if (card.website) lines.push(`URL:${esc(card.website)}`);
  if (card.address) lines.push(`ADR;TYPE=WORK:;;${esc(card.address)};;;;`);
  lines.push(`URL;TYPE=card:${esc(pageUrl)}`, "END:VCARD");
  return lines.join("\r\n");
}

/** Today's opening hours for the card, or null when not given. */
export function hoursFor(hours: Hours, day: Day) {
  return hours.find((h) => h.d === day) ?? null;
}
