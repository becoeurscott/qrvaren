import { composeSvg, svgToPng } from "@/modules/qr/infrastructure/render";
import { SIZES, sideSvg, type Design, type QrEl, type Side } from "../domain/design";

const DPI = 300;

/** A QR element drawn by the generator, as an SVG data URL the card SVG can embed. */
export async function qrDataUrl(el: QrEl): Promise<string> {
  const { svg } = await composeSvg(el.data || " ", { fg: el.fg, bg: el.bg, dots: "square", logoRatio: 0, frame: false, frameText: "", frameColor: el.fg });
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Remote images can't load inside an SVG drawn to a canvas, so they are inlined first. */
export async function toDataUrl(src: string, max = 800): Promise<string> {
  if (src.startsWith("data:")) return src;
  const blob = await (await fetch(src, { mode: "cors" })).blob();
  const bmp = await createImageBitmap(blob);
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  const url = c.toDataURL("image/jpeg", 0.85);
  c.width = c.height = 0;
  return url;
}

async function sidePng(side: Side, d: Design, qr: Record<string, string>, bleed: boolean) {
  const { svg, w, h } = sideSvg(side, d.size, qr, { bleed });
  const blob = await svgToPng(svg, w, h, DPI / 72);
  const url = await new Promise<string>((ok) => { const r = new FileReader(); r.onload = () => ok(r.result as string); r.readAsDataURL(blob); });
  return { url, w, h };
}

/** Print-shop PDF: page 1 front, page 2 back, each with 1/8 in bleed at 300 dpi. */
export async function cardPdf(d: Design, qr: Record<string, string>): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const front = await sidePng(d.front, d, qr, true);
  const back = await sidePng(d.back, d, qr, true);
  const pdf = new jsPDF({ unit: "pt", format: [front.w, front.h], orientation: "landscape", compress: true });
  pdf.addImage(front.url, "PNG", 0, 0, front.w, front.h, "front", "FAST");
  pdf.addPage([back.w, back.h], "landscape");
  pdf.addImage(back.url, "PNG", 0, 0, back.w, back.h, "back", "FAST");
  return pdf.output("blob");
}

/**
 * Home-printing sheet: 10 cards per page (Letter for US cards, A4 for EU) with cut marks.
 * Page 2 holds the backs with columns swapped, so a double-sided print (flip on long edge) lines up.
 */
export async function sheetPdf(d: Design, qr: Record<string, string>): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const { w, h } = SIZES[d.size];
  const page = d.size === "us" ? { w: 612, h: 792, f: "letter" } : { w: 595.3, h: 841.9, f: "a4" };
  const cols = 2, rows = 5;
  const x0 = (page.w - cols * w) / 2, y0 = (page.h - rows * h) / 2;
  const pdf = new jsPDF({ unit: "pt", format: page.f, orientation: "portrait", compress: true });
  const sides = [await sidePng(d.front, d, qr, false), await sidePng(d.back, d, qr, false)];
  sides.forEach((img, p) => {
    if (p) pdf.addPage(page.f, "portrait");
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const col = p ? cols - 1 - c : c;
        pdf.addImage(img.url, "PNG", x0 + col * w, y0 + r * h, w, h, `s${p}`, "FAST");
      }
    // Cut marks in the margins, at every card edge.
    pdf.setDrawColor(150).setLineWidth(0.4);
    for (let c = 0; c <= cols; c++) {
      const x = x0 + c * w;
      pdf.line(x, y0 - 18, x, y0 - 4);
      pdf.line(x, y0 + rows * h + 4, x, y0 + rows * h + 18);
    }
    for (let r = 0; r <= rows; r++) {
      const y = y0 + r * h;
      pdf.line(x0 - 18, y, x0 - 4, y);
      pdf.line(x0 + cols * w + 4, y, x0 + cols * w + 18, y);
    }
  });
  return pdf.output("blob");
}
