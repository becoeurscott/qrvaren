// Brand and domain are placeholders until decided; set them in .env.
export const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME ?? "QRVAREN";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Who runs the site: shown in the footer legal notice, the legal pages and the copyright (DMCA) page.
// Set the NEXT_PUBLIC_LEGAL_* variables in the deploy env; until then the parts that need them stay hidden.
// Any marketing email we ever send must carry this postal address and an unsubscribe link (CAN-SPAM).
export const TO_FILL = "[TO FILL]";
export const LEGAL = {
  name: process.env.NEXT_PUBLIC_LEGAL_NAME || TO_FILL,
  address: process.env.NEXT_PUBLIC_LEGAL_ADDRESS || TO_FILL,
  country: process.env.NEXT_PUBLIC_LEGAL_COUNTRY || TO_FILL,
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || TO_FILL,
};

const filled = (v: string) => !!v && v !== TO_FILL;
/** True once the business name, address, country and email are all set. */
export const legalReady = (l: typeof LEGAL = LEGAL) => filled(l.name) && filled(l.address) && filled(l.country) && filled(l.email);
/** Contact address for data, support and copyright requests, or null while there is none. */
export const CONTACT_EMAIL: string | null = filled(LEGAL.email) ? LEGAL.email : null;
