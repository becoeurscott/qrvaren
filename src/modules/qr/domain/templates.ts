import type { QrType } from "./encoders";

// Ready-made looks for the generator. Every template must pass readabilityIssues() (see templates.test.ts).
export type TemplateStyle = {
  fg: string;
  fg2?: string;
  eye?: string;
  bg: string;
  dots: "square" | "dots" | "rounded" | "classy";
  frame: boolean;
  frameColor: string;
};

export const TEMPLATES = {
  varen: { fg: "#17143a", eye: "#5546ff", bg: "#ffffff", dots: "rounded", frame: true, frameColor: "#5546ff" },
  classic: { fg: "#000000", bg: "#ffffff", dots: "square", frame: true, frameColor: "#17143a" },
  lime: { fg: "#17143a", bg: "#bfff0a", dots: "rounded", frame: true, frameColor: "#17143a" },
  midnight: { fg: "#17143a", fg2: "#5546ff", bg: "#ffffff", dots: "dots", frame: true, frameColor: "#17143a" },
  sunset: { fg: "#c2410c", fg2: "#9d174d", bg: "#fff7ed", dots: "rounded", frame: true, frameColor: "#c2410c" },
  ocean: { fg: "#0369a1", fg2: "#1e3a8a", bg: "#f0f9ff", dots: "classy", frame: true, frameColor: "#0369a1" },
  forest: { fg: "#166534", fg2: "#14532d", eye: "#14532d", bg: "#f0fdf4", dots: "rounded", frame: true, frameColor: "#166534" },
  bubblegum: { fg: "#be185d", eye: "#7e22ce", bg: "#fdf2f8", dots: "dots", frame: true, frameColor: "#be185d" },
  gold: { fg: "#78350f", fg2: "#a16207", bg: "#fffbeb", dots: "classy", frame: true, frameColor: "#78350f" },
  coral: { fg: "#17143a", eye: "#c2410c", bg: "#ffffff", dots: "rounded", frame: true, frameColor: "#ff5a3c" },
  royal: { fg: "#1e3a8a", fg2: "#5546ff", eye: "#1e3a8a", bg: "#ffffff", dots: "classy", frame: true, frameColor: "#1e3a8a" },
  minimal: { fg: "#111827", bg: "#ffffff", dots: "dots", frame: false, frameColor: "#111827" },
} satisfies Record<string, TemplateStyle>;

export type TemplateKey = keyof typeof TEMPLATES;
export const TEMPLATE_KEYS = Object.keys(TEMPLATES) as TemplateKey[];

/** Frame captions suggested for each QR type (keys into gen.frameTexts). */
export const FRAME_TEXTS: Record<QrType, string[]> = {
  url: ["scanMe", "visitUs", "openLink"],
  wifi: ["freeWifi", "scanWifi", "scanMe"],
  text: ["scanMe", "readMe"],
  vcard: ["saveContact", "scanMe"],
  email: ["emailUs", "scanMe"],
  sms: ["textUs", "scanMe"],
  pdf: ["seeMenu", "viewPdf"],
  card: ["myCard", "scanMe"],
};
