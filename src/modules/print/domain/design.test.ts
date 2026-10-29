import { describe, expect, it } from "vitest";
import { BLEED, SIZES, TEMPLATE_IDS, bounds, outsideSafe, resize, sideSvg, template, type Info } from "./design";

const info: Info = { name: "Blue Bakery", title: "Owner", phone: "+1 555 010 2030", email: "hi@blue.com", website: "https://blue.com", address: "", qr: "https://qrvaren.online/c/blue" };

describe("print design", () => {
  it("every template keeps text and codes inside the safe area", () => {
    for (const size of ["us", "eu"] as const)
      for (const id of TEMPLATE_IDS) {
        const d = template(id, info, size);
        for (const el of [...d.front.els, ...d.back.els]) expect(outsideSafe(el, size), `${id}/${size}/${el.kind}`).toBe(false);
      }
  });

  it("every template puts a QR code with the card link on a side", () => {
    for (const id of TEMPLATE_IDS) {
      const d = template(id, info, "us");
      expect([...d.front.els, ...d.back.els].some((e) => e.kind === "qr" && e.data === info.qr)).toBe(true);
    }
  });

  it("extends the background into the bleed and escapes text", () => {
    const d = template("classic", { ...info, name: "A & B <co>" }, "us");
    const { svg, w, h } = sideSvg(d.front, "us", {}, { bleed: true });
    expect(w).toBe(SIZES.us.w + 2 * BLEED);
    expect(h).toBe(SIZES.us.h + 2 * BLEED);
    expect(svg).toContain(`viewBox="${-BLEED} ${-BLEED}`);
    expect(svg).toContain("A &amp; B &lt;co&gt;");
  });

  it("measures multi-line text and rescales between sizes", () => {
    const d = template("classic", info, "us");
    const t = d.front.els.find((e) => e.kind === "text" && e.text.includes("\n"))!;
    expect(bounds(t).h).toBeGreaterThan(t.kind === "text" ? t.size * 2 : 0);
    const eu = resize(d, "eu");
    expect(eu.size).toBe("eu");
    expect(eu.front.els.length).toBe(d.front.els.length);
  });
});
