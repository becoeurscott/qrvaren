import { describe, expect, it } from "vitest";
import { TEMPLATES, TEMPLATE_KEYS, FRAME_TEXTS } from "./templates";
import { contrastRatio, readabilityIssues } from "./contrast";
import { QR_TYPES } from "./encoders";
import en from "../../../../messages/en.json";
import fr from "../../../../messages/fr.json";
import es from "../../../../messages/es.json";

describe("QR templates", () => {
  it.each(TEMPLATE_KEYS)("%s scans reliably", (key) => {
    const t = TEMPLATES[key] as (typeof TEMPLATES)[typeof key] & { fg2?: string; eye?: string };
    expect(readabilityIssues({ fg: t.fg, bg: t.bg, extra: [t.fg2, t.eye] })).toEqual([]);
  });

  it.each(TEMPLATE_KEYS)("%s frame caption is legible", (key) => {
    const t = TEMPLATES[key];
    // The caption is drawn in the background color on top of the frame color.
    if (t.frame) expect(contrastRatio(t.bg, t.frameColor)).toBeGreaterThanOrEqual(3);
  });

  it("every type has frame captions, translated and short enough", () => {
    for (const type of QR_TYPES) {
      expect(FRAME_TEXTS[type].length).toBeGreaterThan(0);
      for (const key of FRAME_TEXTS[type]) {
        for (const m of [en, fr, es]) {
          const text = (m.gen.frameTexts as Record<string, string>)[key];
          expect(text, key).toBeTruthy();
          expect(text.length, text).toBeLessThanOrEqual(20);
        }
      }
    }
  });

  it("every template has a name in each language", () => {
    for (const key of TEMPLATE_KEYS) for (const m of [en, fr, es]) expect((m.gen.templates as Record<string, string>)[key]).toBeTruthy();
  });
});
