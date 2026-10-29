import { describe, expect, it } from "vitest";
import { DEFAULT_LOGO, DesignSchema, PRESET_IDS, backgroundCss, logoFraming, presetDesign, resolveDesign } from "./design";

describe("design", () => {
  it("every preset is a complete, valid design", () => {
    for (const id of PRESET_IDS) expect(DesignSchema.safeParse(presetDesign(id)).success, id).toBe(true);
  });

  it("old rows (theme only, empty design) keep their preset look", () => {
    expect(resolveDesign("midnight", {}).bg.color).toBe("#17143a");
    expect(resolveDesign("lavender", {}).header.layout).toBe("banner");
  });

  it("saved overrides win, invalid ones fall back to the preset", () => {
    expect(resolveDesign("lavender", { buttons: { style: "outline" } }).buttons.style).toBe("outline");
    expect(resolveDesign("lavender", { text: "red" }).text).toBe(presetDesign("lavender").text);
    expect(resolveDesign("unknown", null).font).toBe("bricolage");
  });

  it("builds gradient and image backgrounds", () => {
    const bg = presetDesign("sunset").bg;
    expect(backgroundCss(bg)).toMatch(/^linear-gradient\(180deg/);
    expect(backgroundCss({ ...bg, type: "image", image_url: "https://x.test/a.png" })).toContain('url("https://x.test/a.png")');
    expect(backgroundCss({ ...bg, type: "image", image_url: null })).toBe(bg.color);
  });

  it("keeps the logo framing, and old rows get the default one", () => {
    expect(resolveDesign("lavender", {}).logo).toEqual(DEFAULT_LOGO);
    expect(resolveDesign("lavender", { logo: { fit: "contain", zoom: 1.4, x: -20, y: 10 } }).logo).toEqual({ fit: "contain", zoom: 1.4, x: -20, y: 10 });
    expect(resolveDesign("lavender", { logo: { zoom: 9 } }).logo).toEqual(presetDesign("lavender").logo);
  });

  it("fits wide or tall logos whole and lets square ones fill", () => {
    expect(logoFraming(800, 200).fit).toBe("contain");
    expect(logoFraming(200, 600).fit).toBe("contain");
    expect(logoFraming(500, 520)).toEqual(DEFAULT_LOGO);
  });
});
