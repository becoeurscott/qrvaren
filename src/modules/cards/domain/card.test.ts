import { describe, expect, it } from "vitest";
import { CardContentSchema, RESERVED_SLUGS, cardVCard, isValidSlug, slugCandidates, slugify, socialUrl } from "./card";
import { RESERVED } from "../../../../infra/card-subdomains/worker.js";

describe("slugs", () => {
  it("turns business names into subdomain-safe slugs", () => {
    expect(slugify("Café Le Petit Coin")).toBe("cafe-le-petit-coin");
    expect(slugify("  Joe's Pizza & Grill!! ")).toBe("joe-s-pizza-and-grill");
    expect(slugify("Ñandú Tacos")).toBe("nandu-tacos");
    expect(slugify("!!!")).toBe("card");
    expect(slugify("a".repeat(80))).toHaveLength(63);
  });
  it("proposes suffixed candidates and skips reserved names", () => {
    expect(slugCandidates("Blue Bakery", 3)).toEqual(["blue-bakery", "blue-bakery-2", "blue-bakery-3"]);
    expect(slugCandidates("Admin", 2)).toEqual(["admin-2", "admin-3"]);
  });
  it("validates slugs", () => {
    expect(isValidSlug("blue-bakery")).toBe(true);
    expect(isValidSlug("-blue")).toBe(false);
    expect(isValidSlug("www")).toBe(false);
  });
  it("keeps the app and the subdomain worker reserved lists in sync", () => {
    for (const s of RESERVED) expect(RESERVED_SLUGS.has(s), s).toBe(true);
  });
});

describe("card content", () => {
  const base = { name: "Blue Bakery", hours: [], socials: {}, links: [], gallery: [], locale: "en" as const };
  it("accepts a minimal card and normalizes empty fields", () => {
    const r = CardContentSchema.parse({ ...base, tagline: "", website: "" });
    expect(r.tagline).toBeNull();
    expect(r.website).toBeNull();
  });
  it("rejects bad email, phone, website and hours", () => {
    expect(CardContentSchema.safeParse({ ...base, email: "nope" }).success).toBe(false);
    expect(CardContentSchema.safeParse({ ...base, phone: "12" }).success).toBe(false);
    expect(CardContentSchema.safeParse({ ...base, website: "javascript:alert(1)" }).success).toBe(false);
    expect(CardContentSchema.safeParse({ ...base, hours: [{ d: "mon", o: "25:00" }] }).success).toBe(false);
  });
  it("drops empty social handles", () => {
    expect(CardContentSchema.parse({ ...base, socials: { instagram: "@bb", tiktok: "" } }).socials).toEqual({ instagram: "@bb" });
  });
});

describe("links and vCard", () => {
  it("builds social links", () => {
    expect(socialUrl("instagram", "@bluebakery")).toBe("https://www.instagram.com/bluebakery");
    expect(socialUrl("whatsapp", "+1 555 010 2030")).toBe("https://wa.me/15550102030");
  });
  it("writes an escaped vCard with the card page", () => {
    const v = cardVCard({ name: "Joe; Pizza", phone: "+1 555", email: "a@b.co", address: "1 Main St, NYC" }, "https://joe.qrvaren.online");
    expect(v).toContain("FN:Joe\\; Pizza");
    expect(v).toContain("ADR;TYPE=WORK:;;1 Main St\\, NYC;;;;");
    expect(v).toContain("URL;TYPE=card:https://joe.qrvaren.online");
    expect(v.startsWith("BEGIN:VCARD\r\n")).toBe(true);
  });
});
