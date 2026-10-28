import { describe, expect, it } from "vitest";
import { PRESETS, PRESET_IDS, mapsUrl, presetFromSlug, profileUrl, siteLink, telUri, whatsappUrl, type Preset } from "./presets";
import { contrastRatio, readabilityIssues } from "./contrast";
import { allTypeSlugs } from "../interface/slugs";
import en from "../../../../messages/en.json";
import fr from "../../../../messages/fr.json";
import es from "../../../../messages/es.json";

describe("link builders", () => {
  it("builds profile URLs from @name, name or a pasted URL", () => {
    expect(profileUrl("@cafe.ny", "https://www.instagram.com/", "instagram.com")).toBe("https://www.instagram.com/cafe.ny");
    expect(profileUrl("cafe_ny", "https://www.tiktok.com/@", "tiktok.com")).toBe("https://www.tiktok.com/@cafe_ny");
    expect(profileUrl("instagram.com/cafe.ny", "https://www.instagram.com/", "instagram.com")).toBe("https://instagram.com/cafe.ny");
  });
  it("rejects spaces and links to another site", () => {
    expect(profileUrl("my cafe", "https://www.instagram.com/", "instagram.com")).toBeNull();
    expect(profileUrl("https://evil.com/x", "https://www.instagram.com/", "instagram.com")).toBeNull();
  });
  it("builds WhatsApp links with an encoded message", () => {
    expect(whatsappUrl("+1 (555) 010-2030", "Hi! Table for 2?")).toBe("https://wa.me/15550102030?text=Hi!%20Table%20for%202%3F");
    expect(whatsappUrl("12")).toBeNull();
  });
  it("builds tel, maps and site links", () => {
    expect(telUri("+1 555 010 2030")).toBe("tel:+15550102030");
    expect(mapsUrl("350 5th Ave, New York")).toBe("https://www.google.com/maps/search/?api=1&query=350%205th%20Ave%2C%20New%20York");
    expect(siteLink("open.spotify.com/artist/123", "spotify.com")).toBe("https://open.spotify.com/artist/123");
    expect(siteLink("https://example.com", "spotify.com")).toBeNull();
  });
});

describe("presets", () => {
  it.each(PRESET_IDS)("%s style scans reliably and its caption is legible", (id) => {
    const s = (PRESETS[id] as Preset).style;
    expect(readabilityIssues({ fg: s.fg, bg: s.bg, extra: [s.fg2, s.eye], logoRatio: 0.22 })).toEqual([]);
    expect(contrastRatio(s.bg, s.frameColor)).toBeGreaterThanOrEqual(3);
  });

  it.each(PRESET_IDS)("%s has a builder or a type, and translated texts", (id) => {
    const p = PRESETS[id] as Preset;
    expect(!!p.type || (!!p.build && !!p.fields?.length)).toBe(true);
    for (const m of [en, fr, es]) {
      const caption = (m.gen.frameTexts as Record<string, string>)[p.caption];
      expect(caption, p.caption).toBeTruthy();
      expect(caption.length, caption).toBeLessThanOrEqual(20);
      for (const f of p.fields ?? []) expect((m.gen.presetFields as Record<string, string>)[f.label]).toBeTruthy();
      if (p.slug) expect((m.seoPresets as Record<string, { h1: string }>)[id]?.h1).toBeTruthy();
    }
  });

  it("slugs are unique and do not collide with type pages", () => {
    const slugs = PRESET_IDS.map((id) => (PRESETS[id] as Preset).slug).filter(Boolean);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(allTypeSlugs()).not.toContain(s);
    expect(presetFromSlug("whatsapp-qr-code")).toBe("whatsapp");
  });
});
