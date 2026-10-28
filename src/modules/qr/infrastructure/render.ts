// Browser-only rendering. Preview and every export come from the same composed SVG,
// so downloads match the preview exactly (colors, logo, frame).

export type DotShape = "square" | "dots" | "rounded" | "classy";

export type QrStyle = {
  fg: string;
  /** Optional second color: modules get a diagonal gradient from fg to fg2. */
  fg2?: string;
  /** Optional accent for the three corner "eyes"; defaults to fg. */
  eye?: string;
  bg: string;
  dots: DotShape;
  logo?: string; // data URL
  logoRatio: number;
  frame: boolean;
  frameText: string;
  frameColor: string;
};

const SIZE = 600;
const FRAME_PAD = 36;
const FRAME_LABEL = 110;

async function rawQrSvg(data: string, style: QrStyle): Promise<string> {
  const { default: QRCodeStyling } = await import("qr-code-styling");
  const qr = new QRCodeStyling({
    type: "svg",
    width: SIZE,
    height: SIZE,
    margin: 24,
    data,
    image: style.logo,
    qrOptions: { errorCorrectionLevel: style.logo ? "H" : "M" },
    dotsOptions: {
      color: style.fg,
      type: style.dots,
      ...(style.fg2 && {
        gradient: { type: "linear" as const, rotation: Math.PI / 4, colorStops: [{ offset: 0, color: style.fg }, { offset: 1, color: style.fg2 }] },
      }),
    },
    cornersSquareOptions: { color: style.eye ?? style.fg, type: style.dots === "dots" ? "extra-rounded" : style.dots === "square" ? "square" : "extra-rounded" },
    cornersDotOptions: { color: style.eye ?? style.fg, type: style.dots === "square" ? "square" : "dot" },
    backgroundOptions: { color: style.bg },
    imageOptions: { imageSize: style.logoRatio, margin: 6, hideBackgroundDots: true, crossOrigin: "anonymous" },
  });
  const blob = (await qr.getRawData("svg")) as Blob;
  return blob.text();
}

const esc = (s: string) => s.replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function composeSvg(data: string, style: QrStyle): Promise<{ svg: string; width: number; height: number }> {
  const inner = (await rawQrSvg(data, style)).replace(/<\?xml[^>]*>/, "");
  if (!style.frame) return { svg: inner, width: SIZE, height: SIZE };

  const w = SIZE + FRAME_PAD * 2;
  const h = SIZE + FRAME_PAD * 2 + FRAME_LABEL;
  const nested = inner.replace("<svg", `<svg x="${FRAME_PAD}" y="${FRAME_PAD}"`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<rect width="${w}" height="${h}" rx="40" fill="${style.frameColor}"/>
<rect x="${FRAME_PAD - 8}" y="${FRAME_PAD - 8}" width="${SIZE + 16}" height="${SIZE + 16}" rx="24" fill="${style.bg}"/>
${nested}
<text x="${w / 2}" y="${SIZE + FRAME_PAD * 2 + FRAME_LABEL / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Anton, Impact, sans-serif" font-size="64" letter-spacing="4" fill="${style.bg}">${esc(style.frameText)}</text>
</svg>`;
  return { svg, width: w, height: h };
}

export async function svgToPng(svg: string, width: number, height: number, scale = 2): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((ok, ko) => {
      img.onload = () => ok();
      img.onerror = () => ko(new Error("svg load failed"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((ok) => canvas.toBlob((b) => ok(b!), "image/png"));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function pngToPdf(png: Blob, width: number, height: number): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const dataUrl = await new Promise<string>((ok) => {
    const r = new FileReader();
    r.onload = () => ok(r.result as string);
    r.readAsDataURL(png);
  });
  // Letter page, code centered at 4 inches wide.
  const pdf = new jsPDF({ unit: "in", format: "letter" });
  const wIn = 4;
  const hIn = (wIn * height) / width;
  pdf.addImage(dataUrl, "PNG", (8.5 - wIn) / 2, (11 - hIn) / 2, wIn, hIn);
  return pdf.output("blob");
}

export function download(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
