import type { PresetId } from "../domain/presets";

// Simple hand-drawn glyphs (100x100) used as the QR center logo and as gallery thumbnails.
const tile = (bg: string, body: string, defs = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${defs}<rect width="100" height="100" rx="24" fill="${bg}"/>${body}</svg>`;
const letter = (bg: string, ch: string, extra = "") =>
  tile(bg, `<text x="50" y="69" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="56" fill="#fff"${extra}>${ch}</text>`);

const ICONS: Record<PresetId, string> = {
  instagram: tile(
    "url(#ig)",
    `<rect x="22" y="22" width="56" height="56" rx="17" fill="none" stroke="#fff" stroke-width="7"/><circle cx="50" cy="50" r="13" fill="none" stroke="#fff" stroke-width="7"/><circle cx="66.5" cy="33.5" r="4.5" fill="#fff"/>`,
    `<defs><linearGradient id="ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#feda75"/><stop offset=".35" stop-color="#fa7e1e"/><stop offset=".6" stop-color="#d62976"/><stop offset="1" stop-color="#4f5bd5"/></linearGradient></defs>`,
  ),
  whatsapp: tile(
    "#25d366",
    `<path d="M50 19a31 31 0 0 0-27 46l-5 17 18-5a31 31 0 1 0 14-58z" fill="none" stroke="#fff" stroke-width="6" stroke-linejoin="round"/><path d="M39 36c1-2 3-2 4-2l2 0c1 0 2 1 2 2l3 7c0 1 0 2-1 3l-2 2c2 4 6 8 10 10l2-2c1-1 2-1 3-1l7 3c1 0 2 1 2 2v2c0 1 0 3-2 4-3 2-7 3-11 1-9-4-16-11-20-20-2-4-1-8 1-11z" fill="#fff"/>`,
  ),
  snapchat: tile(
    "#fffc00",
    `<path d="M50 20c-13 0-21 9-21 21v9l-6 2c-2 1-1 4 1 4l5 1c-2 5-6 9-12 11 0 3 5 4 8 4l2 4c4 0 7 0 11 2 3 2 6 4 12 4s9-2 12-4c4-2 7-2 11-2l2-4c3 0 8-1 8-4-6-2-10-6-12-11l5-1c2 0 3-3 1-4l-6-2v-9c0-12-8-21-21-21z" fill="#fff" stroke="#000" stroke-width="4" stroke-linejoin="round"/>`,
  ),
  tiktok: tile(
    "#010101",
    [
      ["#25f4ee", -2.5], ["#fe2c55", 2.5], ["#fff", 0],
    ].map(([c, d]) => `<path transform="translate(${d} ${d})" d="M55 20h11c1 7 6 12 13 13v11c-5 0-10-2-13-4v22a17 17 0 1 1-17-17v11a7 7 0 1 0 6 6z" fill="${c}"/>`).join(""),
  ),
  facebook: tile("#1877f2", `<path d="M56 84V55h10l2-12H56v-7c0-4 1-6 6-6h7V19c-1 0-5-1-10-1-10 0-17 6-17 17v8H32v12h10v29z" fill="#fff"/>`),
  youtube: tile("#ff0000", `<rect x="16" y="28" width="68" height="44" rx="13" fill="#fff"/><path d="M44 39v22l19-11z" fill="#ff0000"/>`),
  x: tile("#000000", `<path d="M25 24h15l12 17 14-17h8L56 45l22 31H63L50 58 35 76h-8l19-23z" fill="#fff"/>`),
  linkedin: letter("#0a66c2", "in"),
  telegram: tile("#229ed9", `<path d="M19 48l57-22c3-1 5 1 4 4L69 77c-1 3-4 3-6 2L50 69l-7 7c-1 1-3 1-3-1l1-13 25-23-31 20-14-5c-3-1-3-3-2-4z" fill="#fff"/>`),
  venmo: letter("#008cff", "V"),
  paypal: letter("#003087", "P", ` font-style="italic"`),
  spotify: tile(
    "#1db954",
    `<g fill="none" stroke="#121212" stroke-linecap="round"><path d="M26 40c16-5 33-4 48 4" stroke-width="8"/><path d="M29 53c13-4 27-3 39 3" stroke-width="7"/><path d="M32 65c10-3 20-2 29 2" stroke-width="6"/></g>`,
  ),
  maps: tile("#ea4335", `<path d="M50 17c-13 0-23 10-23 23 0 18 23 43 23 43s23-25 23-43c0-13-10-23-23-23zm0 32a9 9 0 1 1 0-18 9 9 0 0 1 0 18z" fill="#fff"/>`),
  phone: tile("#15803d", `<path d="M35 21c2 0 3 1 4 3l5 11c1 2 0 4-1 5l-5 4c3 7 9 13 16 16l4-5c1-1 3-2 5-1l11 5c2 1 3 2 3 4v8c0 4-3 7-7 7-28-1-50-23-51-51 0-4 3-7 7-7z" fill="#fff"/>`),
  wifi: tile(
    "#5546ff",
    `<g fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"><path d="M20 42a42 42 0 0 1 60 0"/><path d="M30 53a28 28 0 0 1 40 0"/><path d="M40 64a14 14 0 0 1 20 0"/></g><circle cx="50" cy="75" r="5" fill="#fff"/>`,
  ),
  contact: tile("#17143a", `<circle cx="50" cy="38" r="14" fill="#fff"/><path d="M24 80c2-15 13-23 26-23s24 8 26 23z" fill="#fff"/>`),
};

export const presetIconSvg = (id: PresetId) => ICONS[id];
export const presetIconDataUrl = (id: PresetId) => `data:image/svg+xml;base64,${btoa(ICONS[id])}`;
