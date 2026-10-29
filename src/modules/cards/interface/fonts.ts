import { Anton, Bricolage_Grotesque, DM_Serif_Display, Inter, Playfair_Display, Space_Mono } from "next/font/google";
import type { FontId } from "../domain/design";

// Fonts a card or bio page can use. Their CSS variables are set on the page (pageFontVars),
// and the design picks one by id. display: swap keeps text visible while a font loads.

const bricolage = Bricolage_Grotesque({ variable: "--pf-bricolage", subsets: ["latin"], display: "swap" });
const anton = Anton({ variable: "--pf-anton", weight: "400", subsets: ["latin"], display: "swap" });
const inter = Inter({ variable: "--pf-inter", subsets: ["latin"], display: "swap" });
const playfair = Playfair_Display({ variable: "--pf-playfair", subsets: ["latin"], display: "swap" });
const dmserif = DM_Serif_Display({ variable: "--pf-dmserif", weight: "400", subsets: ["latin"], display: "swap" });
const spacemono = Space_Mono({ variable: "--pf-spacemono", weight: ["400", "700"], subsets: ["latin"], display: "swap" });

export const pageFontVars = [bricolage, anton, inter, playfair, dmserif, spacemono].map((f) => f.variable).join(" ");

export const fontFamily = (id: FontId) => `var(--pf-${id}), system-ui, sans-serif`;

/** Names shown in the font picker. */
export const FONT_LABELS: Record<FontId, string> = {
  bricolage: "Bricolage", anton: "Anton", inter: "Inter", playfair: "Playfair", dmserif: "DM Serif", spacemono: "Space Mono",
};
