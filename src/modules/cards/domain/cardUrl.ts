import { SITE_URL } from "@/shared/config";

// Card subdomains (<slug>.qrvaren.online) work once the Cloudflare Worker in infra/card-subdomains
// is live; until then NEXT_PUBLIC_CARD_SUBDOMAINS stays unset and cards use <site>/c/<slug>.
const SUBDOMAINS = process.env.NEXT_PUBLIC_CARD_SUBDOMAINS === "1";

export function cardUrl(slug: string): string {
  const site = new URL(SITE_URL);
  return SUBDOMAINS ? `${site.protocol}//${slug}.${site.host}` : `${site.origin}/c/${slug}`;
}

/** Address shown in the editor while choosing a name. */
export function cardHostLabel(slug: string): string {
  return cardUrl(slug).replace(/^https?:\/\//, "");
}
