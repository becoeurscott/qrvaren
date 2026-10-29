import { describe, expect, it } from "vitest";
import { DesignSchema, PRESET_IDS, backgroundCss, presetDesign, resolveDesign } from "./design";

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
});
