// Pure encoders: turn user input into the string stored in the QR code.
// "direct" types embed the data; redirected types (pdf, card, tracked url) point to our /r/ route.

export const QR_TYPES = ["url", "wifi", "text", "vcard", "email", "sms", "pdf", "card"] as const;
export type QrType = (typeof QR_TYPES)[number];

export type WifiInput = { ssid: string; password?: string; encryption: "WPA" | "WEP" | "nopass"; hidden?: boolean };
export type VCardInput = {
  firstName: string;
  lastName?: string;
  org?: string;
  title?: string;
  phone?: string;
  email?: string;
  url?: string;
  address?: string;
};
export type EmailInput = { to: string; subject?: string; body?: string };
export type SmsInput = { phone: string; message?: string };

export type QrInput =
  | { type: "url"; url: string }
  | { type: "text"; text: string }
  | { type: "wifi"; wifi: WifiInput }
  | { type: "vcard"; vcard: VCardInput }
  | { type: "email"; email: EmailInput }
  | { type: "sms"; sms: SmsInput }
  | { type: "pdf"; redirectUrl: string }
  | { type: "card"; redirectUrl: string };

// WIFI and MECARD-style escaping: \ ; , : " must be backslash-escaped.
const escWifi = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");
// vCard 3.0 escaping.
const escVCard = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([;,])/g, "\\$1");

export function normalizeUrl(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(withScheme);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Returns the payload string, or null when the input is not valid yet. */
export function encode(input: QrInput): string | null {
  switch (input.type) {
    case "url":
      return normalizeUrl(input.url);
    case "text":
      return input.text.length ? input.text : null;
    case "wifi": {
      const w = input.wifi;
      if (!w.ssid.trim()) return null;
      if (w.encryption !== "nopass" && !w.password) return null;
      const parts = [`T:${w.encryption}`, `S:${escWifi(w.ssid)}`];
      if (w.encryption !== "nopass") parts.push(`P:${escWifi(w.password ?? "")}`);
      if (w.hidden) parts.push("H:true");
      return `WIFI:${parts.join(";")};;`;
    }
    case "vcard": {
      const c = input.vcard;
      if (!c.firstName.trim()) return null;
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${escVCard(c.lastName ?? "")};${escVCard(c.firstName)};;;`,
        `FN:${escVCard([c.firstName, c.lastName].filter(Boolean).join(" "))}`,
      ];
      if (c.org) lines.push(`ORG:${escVCard(c.org)}`);
      if (c.title) lines.push(`TITLE:${escVCard(c.title)}`);
      if (c.phone) lines.push(`TEL;TYPE=CELL:${escVCard(c.phone)}`);
      if (c.email) lines.push(`EMAIL:${escVCard(c.email)}`);
      if (c.url) lines.push(`URL:${escVCard(c.url)}`);
      if (c.address) lines.push(`ADR:;;${escVCard(c.address)};;;;`);
      lines.push("END:VCARD");
      return lines.join("\n");
    }
    case "email": {
      const e = input.email;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.to.trim())) return null;
      const q = new URLSearchParams();
      if (e.subject) q.set("subject", e.subject);
      if (e.body) q.set("body", e.body);
      const qs = q.toString().replace(/\+/g, "%20");
      return `mailto:${e.to.trim()}${qs ? `?${qs}` : ""}`;
    }
    case "sms": {
      const phone = input.sms.phone.replace(/[^\d+]/g, "");
      if (phone.length < 3) return null;
      return `SMSTO:${phone}:${input.sms.message ?? ""}`;
    }
    case "pdf":
    case "card":
      return input.redirectUrl || null;
  }
}

// Max bytes for byte-mode QR, version 40. We cap lower so codes stay scannable when printed.
export const CAPACITY_BYTES = { L: 2953, M: 2331, Q: 1663, H: 1273 } as const;
export const READABLE_LIMIT_BYTES = 900;

export type CapacityCheck = { ok: true; bytes: number } | { ok: false; bytes: number; reason: "too_long" };

export function checkCapacity(payload: string, ecl: keyof typeof CAPACITY_BYTES): CapacityCheck {
  const bytes = new TextEncoder().encode(payload).length;
  const limit = Math.min(CAPACITY_BYTES[ecl], READABLE_LIMIT_BYTES);
  return bytes <= limit ? { ok: true, bytes } : { ok: false, bytes, reason: "too_long" };
}
