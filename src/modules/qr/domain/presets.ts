import { normalizeUrl, type QrType } from "./encoders";
import type { TemplateStyle } from "./templates";

// Use-case templates: a brand or purpose with its own fields, link builder, colors, icon and caption.
// Templates with `type` reuse an existing QR type (its fields and encoder); the others build a link.

export type PresetField = {
  key: string;
  label: "username" | "phone" | "message" | "address" | "link";
  kind?: "tel" | "url" | "multiline";
};

export type Preset = {
  brand: string;
  /** SEO page slug; templates with `type` use that type's page instead. */
  slug?: string;
  type?: QrType;
  fields?: PresetField[];
  build?: (f: Record<string, string>) => string | null;
  style: TemplateStyle;
  /** Key in gen.frameTexts. */
  caption: string;
  /** Group used for the SEO description. */
  kind: "social" | "chat" | "pay" | "place" | "music" | "call" | "type";
};

const USERNAME: PresetField[] = [{ key: "username", label: "username" }];

/** "@name", "name" or a pasted profile URL on the right site → profile URL. */
export function profileUrl(raw: string | undefined, base: string, host: string): string | null {
  const v = (raw ?? "").trim();
  if (!v) return null;
  if (v.includes(host) || /^https?:\/\//i.test(v)) {
    const u = normalizeUrl(v);
    return u && new URL(u).hostname.replace(/^www\./, "").endsWith(host) ? u : null;
  }
  const name = v.replace(/^@/, "");
  return /^[A-Za-z0-9._-]{1,60}$/.test(name) ? `${base}${name}` : null;
}

const digits = (s: string | undefined) => (s ?? "").replace(/\D/g, "");

export function whatsappUrl(phone: string | undefined, message?: string): string | null {
  const n = digits(phone);
  if (n.length < 7 || n.length > 15) return null;
  return `https://wa.me/${n}${message?.trim() ? `?text=${encodeURIComponent(message.trim())}` : ""}`;
}

export function telUri(phone: string | undefined): string | null {
  const v = (phone ?? "").trim();
  const n = digits(v);
  if (n.length < 3 || n.length > 15) return null;
  return `tel:${v.startsWith("+") ? "+" : ""}${n}`;
}

export function mapsUrl(address: string | undefined): string | null {
  const v = (address ?? "").trim();
  return v.length >= 3 ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v)}` : null;
}

/** A pasted link that must belong to the given site (e.g. a Spotify share link). */
export function siteLink(raw: string | undefined, host: string): string | null {
  const u = normalizeUrl(raw ?? "");
  return u && new URL(u).hostname.replace(/^www\./, "").endsWith(host) ? u : null;
}

const social = (brand: string, slug: string, base: string, host: string, style: TemplateStyle, caption = "followUs"): Preset => ({
  brand, slug, kind: "social", fields: USERNAME, caption, style,
  build: (f) => profileUrl(f.username, base, host),
});

export const PRESETS = {
  instagram: social("Instagram", "instagram-qr-code", "https://www.instagram.com/", "instagram.com",
    { fg: "#833ab4", fg2: "#c13584", eye: "#c13584", bg: "#ffffff", dots: "rounded", frame: true, frameColor: "#c13584" }),
  whatsapp: {
    brand: "WhatsApp", slug: "whatsapp-qr-code", kind: "chat", caption: "chatWithUs",
    fields: [{ key: "phone", label: "phone", kind: "tel" }, { key: "message", label: "message", kind: "multiline" }],
    build: (f) => whatsappUrl(f.phone, f.message),
    style: { fg: "#075e54", eye: "#128c7e", bg: "#ffffff", dots: "rounded", frame: true, frameColor: "#128c7e" },
  },
  snapchat: social("Snapchat", "snapchat-qr-code", "https://www.snapchat.com/add/", "snapchat.com",
    { fg: "#000000", bg: "#fffc00", dots: "dots", frame: true, frameColor: "#000000" }, "addMe"),
  tiktok: social("TikTok", "tiktok-qr-code", "https://www.tiktok.com/@", "tiktok.com",
    { fg: "#010101", eye: "#e11d48", bg: "#ffffff", dots: "rounded", frame: true, frameColor: "#010101" }),
  facebook: social("Facebook", "facebook-qr-code", "https://www.facebook.com/", "facebook.com",
    { fg: "#1877f2", eye: "#0b4fb3", bg: "#ffffff", dots: "rounded", frame: true, frameColor: "#1877f2" }),
  youtube: social("YouTube", "youtube-qr-code", "https://www.youtube.com/@", "youtube.com",
    { fg: "#cc0000", eye: "#282828", bg: "#ffffff", dots: "square", frame: true, frameColor: "#cc0000" }, "subscribe"),
  x: social("X (Twitter)", "x-twitter-qr-code", "https://x.com/", "x.com",
    { fg: "#000000", bg: "#ffffff", dots: "square", frame: true, frameColor: "#000000" }),
  linkedin: social("LinkedIn", "linkedin-qr-code", "https://www.linkedin.com/in/", "linkedin.com",
    { fg: "#0a66c2", eye: "#004182", bg: "#ffffff", dots: "classy", frame: true, frameColor: "#0a66c2" }, "connect"),
  telegram: social("Telegram", "telegram-qr-code", "https://t.me/", "t.me",
    { fg: "#0b72a8", eye: "#0b5a85", bg: "#f0f9ff", dots: "rounded", frame: true, frameColor: "#0b72a8" }, "joinUs"),
  venmo: {
    ...social("Venmo", "venmo-qr-code", "https://venmo.com/u/", "venmo.com",
      { fg: "#0074de", eye: "#004e96", bg: "#ffffff", dots: "rounded", frame: true, frameColor: "#0074de" }, "payMe"),
    kind: "pay",
  },
  paypal: {
    ...social("PayPal", "paypal-qr-code", "https://www.paypal.me/", "paypal.me",
      { fg: "#003087", eye: "#0062c4", bg: "#ffffff", dots: "classy", frame: true, frameColor: "#003087" }, "payMe"),
    kind: "pay",
  },
  spotify: {
    brand: "Spotify", slug: "spotify-qr-code", kind: "music", caption: "listenNow",
    fields: [{ key: "link", label: "link", kind: "url" }],
    build: (f) => siteLink(f.link, "spotify.com"),
    style: { fg: "#121212", eye: "#127a3b", bg: "#ffffff", dots: "dots", frame: true, frameColor: "#121212" },
  },
  maps: {
    brand: "Google Maps", slug: "google-maps-qr-code", kind: "place", caption: "findUs",
    fields: [{ key: "address", label: "address" }],
    build: (f) => mapsUrl(f.address),
    style: { fg: "#17143a", eye: "#c5221f", bg: "#ffffff", dots: "rounded", frame: true, frameColor: "#c5221f" },
  },
  phone: {
    brand: "Phone call", slug: "phone-call-qr-code", kind: "call", caption: "callUs",
    fields: [{ key: "phone", label: "phone", kind: "tel" }],
    build: (f) => telUri(f.phone),
    style: { fg: "#17143a", eye: "#15803d", bg: "#ffffff", dots: "rounded", frame: true, frameColor: "#15803d" },
  },
  wifi: {
    brand: "WiFi", type: "wifi", kind: "type", caption: "freeWifi",
    style: { fg: "#17143a", eye: "#5546ff", bg: "#ffffff", dots: "rounded", frame: true, frameColor: "#5546ff" },
  },
  contact: {
    brand: "Contact", type: "vcard", kind: "type", caption: "saveContact",
    style: { fg: "#17143a", eye: "#c2410c", bg: "#ffffff", dots: "classy", frame: true, frameColor: "#17143a" },
  },
} satisfies Record<string, Preset>;

export type PresetId = keyof typeof PRESETS;
export const PRESET_IDS = Object.keys(PRESETS) as PresetId[];
export const presetFromSlug = (slug: string): PresetId | undefined =>
  PRESET_IDS.find((id) => (PRESETS[id] as Preset).slug === slug);
export const presetSlugs = () => PRESET_IDS.map((id) => (PRESETS[id] as Preset).slug).filter((s): s is string => !!s);
