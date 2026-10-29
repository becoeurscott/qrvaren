// Printable business card: a front and a back made of positioned elements, in points (72 per inch).
// The same SVG drives the editor preview and the PDF, so the download matches what the user placed.

export const SIZES = {
  us: { w: 252, h: 144, label: "3.5 × 2 in" },
  eu: { w: 241, h: 156, label: "85 × 55 mm" },
} as const;
export type SizeId = keyof typeof SIZES;

/** Printers ask for 1/8 in of background past the cut line. */
export const BLEED = 9;
/** Text and codes inside this margin can be trimmed off. */
export const SAFE = 9;

export const FONTS = {
  sans: "Helvetica, Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "'Courier New', Courier, monospace",
  rounded: "'Trebuchet MS', Verdana, sans-serif",
  display: "Impact, 'Arial Black', sans-serif",
} as const;
export type FontId = keyof typeof FONTS;

type Box = { id: string; x: number; y: number };
export type TextEl = Box & { kind: "text"; text: string; w: number; size: number; color: string; font: FontId; bold: boolean; align: "start" | "middle" | "end" };
export type QrEl = Box & { kind: "qr"; data: string; size: number; fg: string; bg: string };
export type ImageEl = Box & { kind: "image"; src: string; w: number; h: number; round: boolean };
export type ShapeEl = Box & { kind: "shape"; w: number; h: number; fill: string; radius: number };
export type El = TextEl | QrEl | ImageEl | ShapeEl;
export type Side = { bg: string; els: El[] };
export type Design = { size: SizeId; front: Side; back: Side };

export type Info = { name: string; title: string; phone: string; email: string; website: string; address: string; logo?: string; qr: string };

export const uid = () => Math.random().toString(36).slice(2, 9);

export const LINE = 1.25;
export const textLines = (t: TextEl) => (t.text || " ").split("\n");

/** Size of an element on the card (text height follows its line count). */
export function bounds(el: El): { x: number; y: number; w: number; h: number } {
  switch (el.kind) {
    case "text": return { x: el.x, y: el.y, w: el.w, h: textLines(el).length * el.size * LINE };
    case "qr": return { x: el.x, y: el.y, w: el.size, h: el.size };
    default: return { x: el.x, y: el.y, w: el.w, h: el.h };
  }
}

/** True when part of the element sits outside the safe area (it may be cut at the printer). */
export function outsideSafe(el: El, size: SizeId): boolean {
  if (el.kind === "shape") return false;
  const b = bounds(el), { w, h } = SIZES[size];
  return b.x < SAFE - 0.5 || b.y < SAFE - 0.5 || b.x + b.w > w - SAFE + 0.5 || b.y + b.h > h - SAFE + 0.5;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * One side as a standalone SVG. `qrImages` maps a QR element id to its rendered SVG data URL
 * (codes are drawn by the QR module, asynchronously). With bleed, the background extends 1/8 in.
 */
export function sideSvg(side: Side, size: SizeId, qrImages: Record<string, string>, opts: { bleed?: boolean } = {}): { svg: string; w: number; h: number } {
  const { w, h } = SIZES[size];
  const b = opts.bleed ? BLEED : 0;
  const W = w + 2 * b, H = h + 2 * b;
  const parts: string[] = [`<rect x="${-b}" y="${-b}" width="${W}" height="${H}" fill="${esc(side.bg)}"/>`];
  for (const el of side.els) {
    if (el.kind === "shape") {
      // Shapes touching an edge run into the bleed so no white line shows after the cut.
      const x0 = el.x <= 0.5 ? -b : el.x, y0 = el.y <= 0.5 ? -b : el.y;
      const x1 = el.x + el.w >= w - 0.5 ? w + b : el.x + el.w, y1 = el.y + el.h >= h - 0.5 ? h + b : el.y + el.h;
      parts.push(`<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="${el.radius}" fill="${esc(el.fill)}"/>`);
    } else if (el.kind === "text") {
      const ax = el.align === "middle" ? el.x + el.w / 2 : el.align === "end" ? el.x + el.w : el.x;
      const spans = textLines(el).map((line, i) => `<tspan x="${ax}" y="${el.y + el.size * (0.95 + i * LINE)}">${esc(line) || " "}</tspan>`).join("");
      parts.push(`<text font-family="${esc(FONTS[el.font])}" font-size="${el.size}" font-weight="${el.bold ? 700 : 400}" fill="${esc(el.color)}" text-anchor="${el.align}" xml:space="preserve">${spans}</text>`);
    } else if (el.kind === "qr") {
      const src = qrImages[el.id];
      if (src) parts.push(`<image x="${el.x}" y="${el.y}" width="${el.size}" height="${el.size}" href="${esc(src)}"/>`);
      else parts.push(`<rect x="${el.x}" y="${el.y}" width="${el.size}" height="${el.size}" fill="${esc(el.bg)}" stroke="${esc(el.fg)}" stroke-dasharray="4 3"/>`);
    } else if (el.src) {
      const clip = el.round ? `<clipPath id="c${el.id}"><ellipse cx="${el.x + el.w / 2}" cy="${el.y + el.h / 2}" rx="${el.w / 2}" ry="${el.h / 2}"/></clipPath>` : "";
      parts.push(`${clip}<image x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" preserveAspectRatio="xMidYMid ${el.round ? "slice" : "meet"}" href="${esc(el.src)}"${el.round ? ` clip-path="url(#c${el.id})"` : ""}/>`);
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="${-b} ${-b} ${W} ${H}">${parts.join("")}</svg>`;
  return { svg, w: W, h: H };
}

// ---- Templates ----

const text = (p: Partial<TextEl> & Pick<TextEl, "x" | "y" | "text">): TextEl =>
  ({ id: uid(), kind: "text", w: 160, size: 9, color: "#17143a", font: "sans", bold: false, align: "start", ...p });
const qr = (p: Partial<QrEl> & Pick<QrEl, "x" | "y" | "data">): QrEl => ({ id: uid(), kind: "qr", size: 72, fg: "#17143a", bg: "#ffffff", ...p });
const shape = (p: Partial<ShapeEl> & Pick<ShapeEl, "x" | "y" | "w" | "h">): ShapeEl => ({ id: uid(), kind: "shape", fill: "#c6f432", radius: 0, ...p });
const logo = (src: string | undefined, p: Pick<ImageEl, "x" | "y" | "w" | "h"> & Partial<ImageEl>): ImageEl[] =>
  src ? [{ id: uid(), kind: "image", src, round: false, ...p }] : [];

const contact = (i: Info) => [i.phone, i.email, i.website.replace(/^https?:\/\/(www\.)?/, ""), i.address].filter(Boolean).join("\n");

export const TEMPLATE_IDS = ["classic", "bold", "minimal", "night", "corporate", "elegant", "split", "creative", "nature", "tech"] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

/** A full design for the given details, laid out for the chosen size. */
export function template(id: TemplateId, i: Info, size: SizeId): Design {
  const { w, h } = SIZES[size];
  const name = i.name || "Your Name";
  const lines = contact(i) || "+1 555 010 2030\nhello@example.com";
  const q = Math.round(h * 0.5);
  const n = lines.split("\n").length;
  // Contact block sitting on the bottom safe margin, for a given text size.
  const bottom = (size: number, gap = 18) => h - gap - n * size * LINE;
  switch (id) {
    case "corporate": {
      const band = Math.round(w * 0.36), x0 = band + 14;
      return {
        size,
        front: { bg: "#ffffff", els: [
          shape({ x: 0, y: 0, w: band, h, fill: "#1e2a4a" }),
          ...(i.logo ? logo(i.logo, { x: band / 2 - 22, y: h / 2 - 22, w: 44, h: 44 })
            : [text({ x: SAFE + 4, y: h / 2 - 18, w: band - 2 * SAFE - 8, text: name.charAt(0).toUpperCase(), size: 28, color: "#ffffff", font: "display", align: "middle" })]),
          text({ x: x0, y: 22, w: w - x0 - 18, text: name, size: 13, bold: true, color: "#1e2a4a" }),
          text({ x: x0, y: 40, w: w - x0 - 18, text: i.title, size: 8, color: "#2f6fd6" }),
          shape({ x: x0, y: 54, w: 24, h: 1.5, fill: "#2f6fd6" }),
          text({ x: x0, y: bottom(7), w: w - x0 - 18, text: lines, size: 7, color: "#3b3852" }),
        ] },
        back: { bg: "#1e2a4a", els: [
          qr({ x: w / 2 - q / 2, y: h / 2 - q / 2 - 8, data: i.qr, size: q, fg: "#1e2a4a", bg: "#ffffff" }),
          text({ x: 18, y: h / 2 + q / 2 - 2, w: w - 36, text: "SCAN ME", size: 7.5, color: "#ffffff", bold: true, align: "middle" }),
        ] },
      };
    }
    case "elegant":
      return {
        size,
        front: { bg: "#111111", els: [
          shape({ x: SAFE + 3, y: SAFE + 3, w: w - 2 * SAFE - 6, h: 0.75, fill: "#d4b373" }),
          shape({ x: SAFE + 3, y: h - SAFE - 3.75, w: w - 2 * SAFE - 6, h: 0.75, fill: "#d4b373" }),
          text({ x: 18, y: h / 2 - 28, w: w - 36, text: name, size: 16, font: "serif", color: "#d4b373", align: "middle" }),
          shape({ x: w / 2 - 20, y: h / 2 - 4, w: 40, h: 1, fill: "#d4b373" }),
          text({ x: 18, y: h / 2 + 4, w: w - 36, text: i.title, size: 7.5, color: "#e9e2d0", align: "middle" }),
          text({ x: 18, y: h - 34, w: w - 36, text: lines.split("\n").slice(0, 2).join("  ·  "), size: 7, color: "#bfb7a3", align: "middle" }),
        ] },
        back: { bg: "#d4b373", els: [
          qr({ x: w / 2 - q / 2, y: h / 2 - q / 2 - 8, data: i.qr, size: q, fg: "#111111", bg: "#d4b373" }),
          text({ x: 18, y: h / 2 + q / 2 - 2, w: w - 36, text: name, size: 8, font: "serif", color: "#111111", align: "middle" }),
        ] },
      };
    case "split": {
      const top = Math.round(h * 0.48), q2 = Math.round(h * 0.42);
      return {
        size,
        front: { bg: "#ffffff", els: [
          shape({ x: 0, y: 0, w, h: top, fill: "#ff6b4a" }),
          text({ x: 18, y: 20, w: w - 36, text: name, size: 17, color: "#ffffff", font: "display" }),
          text({ x: 18, y: 44, w: w - 36, text: i.title, size: 8, color: "#fff3ee", bold: true }),
          text({ x: 18, y: bottom(7), w: w - q2 - 46, text: lines, size: 7, color: "#2b2b2b" }),
          qr({ x: w - q2 - 18, y: h - q2 - 18, data: i.qr, size: q2, fg: "#2b2b2b", bg: "#ffffff" }),
        ] },
        back: { bg: "#ff6b4a", els: [
          ...logo(i.logo, { x: w / 2 - 26, y: h / 2 - 40, w: 52, h: 52 }),
          text({ x: 18, y: i.logo ? h / 2 + 18 : h / 2 - 12, w: w - 36, text: name, size: 18, color: "#ffffff", font: "display", align: "middle" }),
        ] },
      };
    }
    case "creative":
      return {
        size,
        front: { bg: "#ffd23f", els: [
          shape({ x: w - 90, y: -40, w: 140, h: 140, fill: "#ff5d8f", radius: 70 }),
          shape({ x: w - 70, y: h - 45, w: 90, h: 90, fill: "#3a86ff", radius: 45 }),
          text({ x: 18, y: 22, w: w - 110, text: name, size: 18, color: "#17143a", font: "display" }),
          text({ x: 18, y: 46, w: w - 110, text: i.title, size: 8, color: "#17143a", bold: true }),
          text({ x: 18, y: bottom(7.5), w: w - 110, text: lines, size: 7.5, color: "#17143a" }),
        ] },
        back: { bg: "#17143a", els: [
          qr({ x: w / 2 - q / 2, y: h / 2 - q / 2 - 8, data: i.qr, size: q, fg: "#17143a", bg: "#ffd23f" }),
          text({ x: 18, y: h / 2 + q / 2 - 2, w: w - 36, text: "SCAN ME", size: 8, color: "#ffd23f", bold: true, align: "middle" }),
        ] },
      };
    case "nature":
      return {
        size,
        front: { bg: "#eef3ea", els: [
          shape({ x: w - 64, y: 18, w: 46, h: 46, fill: "#a8c3a0", radius: 23 }),
          ...logo(i.logo, { x: w - 64, y: 18, w: 46, h: 46, round: true }),
          shape({ x: -20, y: h - 40, w: 70, h: 70, fill: "#d5e3cf", radius: 35 }),
          text({ x: 18, y: 22, w: w - 100, text: name, size: 15, font: "serif", color: "#2d4a35" }),
          text({ x: 18, y: 42, w: w - 100, text: i.title, size: 8, color: "#5f7f64" }),
          text({ x: 60, y: bottom(7.5), w: w - 78, text: lines, size: 7.5, color: "#2d4a35" }),
        ] },
        back: { bg: "#2d4a35", els: [
          qr({ x: w / 2 - q / 2, y: h / 2 - q / 2 - 8, data: i.qr, size: q, fg: "#2d4a35", bg: "#eef3ea" }),
          text({ x: 18, y: h / 2 + q / 2 - 2, w: w - 36, text: name, size: 8, font: "serif", color: "#eef3ea", align: "middle" }),
        ] },
      };
    case "tech":
      return {
        size,
        front: { bg: "#0f172a", els: [
          shape({ x: 0, y: h - 6, w, h: 6, fill: "#22d3ee" }),
          shape({ x: 0, y: h - 10, w: Math.round(w * 0.4), h: 4, fill: "#a78bfa" }),
          text({ x: 18, y: 22, w: w - q - 46, text: name, size: 14, color: "#ffffff", bold: true }),
          text({ x: 18, y: 40, w: w - q - 46, text: i.title, size: 7.5, color: "#22d3ee", font: "mono" }),
          text({ x: 18, y: bottom(7, 24), w: w - q - 46, text: lines, size: 7, color: "#cbd5e1", font: "mono" }),
          qr({ x: w - q - 18, y: h / 2 - q / 2 - 6, data: i.qr, size: q, fg: "#0f172a", bg: "#ffffff" }),
        ] },
        back: { bg: "#22d3ee", els: [
          ...logo(i.logo, { x: w / 2 - 26, y: h / 2 - 40, w: 52, h: 52 }),
          text({ x: 18, y: i.logo ? h / 2 + 18 : h / 2 - 12, w: w - 36, text: name, size: 18, color: "#0f172a", font: "display", align: "middle" }),
        ] },
      };
    case "bold":
      return {
        size,
        front: { bg: "#5b3df5", els: [
          shape({ x: 0, y: 0, w: 10, h }),
          text({ x: 24, y: 22, w: w - 48, text: name, size: 17, color: "#ffffff", font: "display" }),
          text({ x: 24, y: 45, w: w - 48, text: i.title, size: 9, color: "#c6f432", bold: true }),
          text({ x: 24, y: h - 24 - lines.split("\n").length * 8 * 1.25, w: w - q - 56, text: lines, size: 8, color: "#ffffff" }),
          qr({ x: w - q - 18, y: h - q - 18, data: i.qr, size: q, fg: "#17143a", bg: "#ffffff" }),
        ] },
        back: { bg: "#c6f432", els: [
          ...logo(i.logo, { x: w / 2 - 28, y: h / 2 - 44, w: 56, h: 56 }),
          text({ x: 18, y: i.logo ? h / 2 + 18 : h / 2 - 12, w: w - 36, text: name, size: 18, font: "display", align: "middle" }),
        ] },
      };
    case "minimal":
      return {
        size,
        front: { bg: "#fbf8f1", els: [
          text({ x: 18, y: h / 2 - 30, w: w - 36, text: name, size: 16, font: "serif", align: "middle" }),
          text({ x: 18, y: h / 2 - 8, w: w - 36, text: i.title, size: 8, color: "#6b6880", align: "middle" }),
          shape({ x: w / 2 - 16, y: h / 2 + 8, w: 32, h: 1.5, fill: "#17143a" }),
          text({ x: 18, y: h / 2 + 18, w: w - 36, text: lines.split("\n").slice(0, 2).join("  ·  "), size: 7.5, color: "#17143a", align: "middle" }),
        ] },
        back: { bg: "#17143a", els: [
          qr({ x: w / 2 - q / 2, y: h / 2 - q / 2 - 8, data: i.qr, size: q, fg: "#17143a", bg: "#fbf8f1" }),
          text({ x: 18, y: h / 2 + q / 2 - 2, w: w - 36, text: "SCAN ME", size: 8, color: "#fbf8f1", bold: true, align: "middle" }),
        ] },
      };
    case "night":
      return {
        size,
        front: { bg: "#17143a", els: [
          ...logo(i.logo, { x: 20, y: 20, w: 34, h: 34, round: true }),
          text({ x: i.logo ? 62 : 20, y: 22, w: w - 100, text: name, size: 14, color: "#c6f432", bold: true }),
          text({ x: i.logo ? 62 : 20, y: 41, w: w - 100, text: i.title, size: 8, color: "#d9d4ff" }),
          text({ x: 20, y: h - 22 - lines.split("\n").length * 7.5 * 1.25, w: w - q - 48, text: lines, size: 7.5, color: "#ffffff", font: "mono" }),
          qr({ x: w - q - 18, y: h - q - 18, data: i.qr, size: q, fg: "#17143a", bg: "#c6f432" }),
        ] },
        back: { bg: "#c6f432", els: [
          text({ x: 18, y: h / 2 - 12, w: w - 36, text: name, size: 18, font: "display", align: "middle" }),
        ] },
      };
    default:
      return {
        size,
        front: { bg: "#ffffff", els: [
          ...logo(i.logo, { x: 18, y: 18, w: 30, h: 30 }),
          text({ x: 18, y: i.logo ? 54 : 22, w: w - q - 46, text: name, size: 15, bold: true }),
          text({ x: 18, y: i.logo ? 74 : 42, w: w - q - 46, text: i.title, size: 8, color: "#5b3df5" }),
          text({ x: 18, y: h - 18 - lines.split("\n").length * 7.5 * 1.25, w: w - q - 46, text: lines, size: 7.5, color: "#3b3852" }),
          qr({ x: w - q - 18, y: h / 2 - q / 2, data: i.qr, size: q }),
        ] },
        back: { bg: "#5b3df5", els: [
          ...logo(i.logo, { x: w / 2 - 26, y: h / 2 - 40, w: 52, h: 52 }),
          text({ x: 18, y: i.logo ? h / 2 + 18 : h / 2 - 12, w: w - 36, text: name, size: 18, color: "#ffffff", bold: true, align: "middle" }),
        ] },
      };
  }
}

/** Moves every element so the layout keeps its place when switching between US and EU sizes. */
export function resize(d: Design, size: SizeId): Design {
  const a = SIZES[d.size], b = SIZES[size];
  const sx = b.w / a.w, sy = b.h / a.h;
  const side = (s: Side): Side => ({
    ...s,
    els: s.els.map((el) => ({ ...el, x: +(el.x * sx).toFixed(1), y: +(el.y * sy).toFixed(1), ...("w" in el ? { w: +(el.w * sx).toFixed(1) } : {}), ...(el.kind === "image" || el.kind === "shape" ? { h: +(el.h * sy).toFixed(1) } : {}) } as El)),
  });
  return { size, front: side(d.front), back: side(d.back) };
}
