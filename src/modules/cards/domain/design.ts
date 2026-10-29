import { z } from "zod";

// Look of a card or bio page: header layout, background, buttons, fonts and colours.
// Stored as cards.design (partial); presets fill the gaps, so old rows and new fields keep working.

export const HEADER_LAYOUTS = ["classic", "hero", "banner", "cutout", "shape"] as const;
export const BG_TYPES = ["solid", "gradient", "image"] as const;
export const BUTTON_STYLES = ["fill", "outline", "shadow", "soft"] as const;
export const BUTTON_RADII = ["square", "rounded", "pill"] as const;
export const FONTS = ["bricolage", "anton", "inter", "playfair", "dmserif", "spacemono"] as const;

export type HeaderLayout = (typeof HEADER_LAYOUTS)[number];
export type FontId = (typeof FONTS)[number];

const hex = z.string().regex(/^#[0-9a-f]{6}$/i);
const media = { url: z.string().url().nullable().optional(), key: z.string().max(300).nullable().optional() };

export const DesignSchema = z.object({
  header: z.object({
    layout: z.enum(HEADER_LAYOUTS),
    title: z.enum(["text", "logo"]),
    title_logo_url: media.url, title_logo_key: media.key,
    title_font: z.enum(FONTS).nullable().optional(),
    title_color: hex.nullable().optional(),
  }),
  bg: z.object({
    type: z.enum(BG_TYPES),
    color: hex, color2: hex,
    angle: z.number().int().min(0).max(360),
    image_url: media.url, image_key: media.key,
    dim: z.number().min(0).max(0.8),
  }),
  buttons: z.object({ style: z.enum(BUTTON_STYLES), radius: z.enum(BUTTON_RADII), color: hex, text: hex }),
  font: z.enum(FONTS),
  text: hex,
  muted: hex,
  panel: hex,
  accent: hex,
});
export type Design = z.infer<typeof DesignSchema>;

const base: Design = {
  header: { layout: "banner", title: "text", title_logo_url: null, title_logo_key: null, title_font: null, title_color: null },
  bg: { type: "solid", color: "#f3f1ff", color2: "#ffffff", angle: 180, image_url: null, image_key: null, dim: 0.3 },
  buttons: { style: "fill", radius: "rounded", color: "#17143a", text: "#ffffff" },
  font: "bricolage", text: "#17143a", muted: "#364255", panel: "#ffffff", accent: "#5546ff",
};

type Preset = { header?: Partial<Design["header"]>; bg?: Partial<Design["bg"]>; buttons?: Partial<Design["buttons"]> } &
  Partial<Omit<Design, "header" | "bg" | "buttons">>;

/** Ready-made looks. The first four keep the names the card themes had. */
export const PRESETS = {
  lavender: { header: { title_font: "anton" }, buttons: { color: "#17143a", text: "#ffffff" }, accent: "#5546ff" },
  midnight: {
    header: { title_font: "anton" }, bg: { color: "#17143a" }, buttons: { color: "#bfff0a", text: "#17143a" },
    text: "#ffffff", muted: "#c9c6e6", panel: "#25214f", accent: "#bfff0a",
  },
  minimal: {
    header: { layout: "classic" }, bg: { color: "#ffffff" }, buttons: { style: "outline", radius: "pill", color: "#17143a", text: "#17143a" },
    font: "inter", panel: "#f4f4f6", accent: "#17143a",
  },
  sunset: {
    header: { title_font: "anton" }, bg: { type: "gradient", color: "#ffd9c2", color2: "#fff4e6" },
    buttons: { color: "#ff5a3c", text: "#ffffff" }, accent: "#ff5a3c",
  },
  forest: {
    header: { layout: "hero", title_font: "dmserif" }, bg: { color: "#0f2a1f" }, buttons: { style: "soft", color: "#2f6f4f", text: "#ffffff" },
    font: "inter", text: "#f1f7f3", muted: "#b5d1c2", panel: "#173a2b", accent: "#9be7b5",
  },
  candy: {
    header: { layout: "shape" }, bg: { type: "gradient", color: "#ff7bca", color2: "#a5e8ff", angle: 160 },
    buttons: { style: "shadow", radius: "pill", color: "#ffffff", text: "#17143a" }, accent: "#17143a",
  },
  editorial: {
    header: { layout: "classic", title_font: "playfair" }, bg: { color: "#f6f1e9" },
    buttons: { style: "outline", radius: "square", color: "#2a2420", text: "#2a2420" },
    font: "playfair", text: "#2a2420", muted: "#6b5f55", panel: "#efe7da", accent: "#a0522d",
  },
  terminal: {
    header: { layout: "classic" }, bg: { color: "#0b0f0c" }, buttons: { style: "outline", radius: "square", color: "#39ff14", text: "#39ff14" },
    font: "spacemono", text: "#39ff14", muted: "#7fbf6a", panel: "#121a14", accent: "#39ff14",
  },
} satisfies Record<string, Preset>;
export type PresetId = keyof typeof PRESETS;
export const PRESET_IDS = Object.keys(PRESETS) as PresetId[];

function merge(a: Design, b: Preset | Record<string, unknown> | null | undefined): Design {
  if (!b || typeof b !== "object") return a;
  const p = b as Preset;
  return {
    ...a, ...(p as object),
    header: { ...a.header, ...(p.header ?? {}) },
    bg: { ...a.bg, ...(p.bg ?? {}) },
    buttons: { ...a.buttons, ...(p.buttons ?? {}) },
  } as Design;
}

export const presetDesign = (id: string): Design => merge(base, PRESETS[id as PresetId] ?? {});

/** Full design for a row: preset named by theme, then the saved overrides (invalid values fall back). */
export function resolveDesign(theme: string | null | undefined, design: unknown): Design {
  const full = merge(presetDesign(theme ?? "lavender"), design as Record<string, unknown>);
  const ok = DesignSchema.safeParse(full);
  return ok.success ? ok.data : presetDesign(theme ?? "lavender");
}

/** CSS background for the page. */
export function backgroundCss(bg: Design["bg"]): string {
  if (bg.type === "gradient") return `linear-gradient(${bg.angle}deg, ${bg.color}, ${bg.color2})`;
  if (bg.type === "image" && bg.image_url) {
    const d = `rgba(0,0,0,${bg.dim})`;
    return `linear-gradient(${d}, ${d}), url("${bg.image_url.replace(/"/g, "%22")}") center / cover no-repeat, ${bg.color}`;
  }
  return bg.color;
}
