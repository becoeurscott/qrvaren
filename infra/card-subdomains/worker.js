// Cloudflare Worker: serves each business card on its own subdomain.
//   https://bluebakery.qrvaren.online/          -> https://qrvaren.online/c/bluebakery
//   https://bluebakery.qrvaren.online/_next/... -> https://qrvaren.online/_next/... (assets, api)
// The visitor keeps seeing the subdomain. The apex site itself is not routed through this Worker.

export const APEX = "qrvaren.online";

// Subdomains that are never cards (must match the app's reserved slugs).
export const RESERVED = new Set(["www", "admin", "api", "app", "c", "mail", "email", "smtp", "ftp", "cdn", "static", "status", "help", "support", "blog", "dashboard", "login"]);

const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

/** Card slug for a host, or null when the host is the apex, www, reserved or not ours. */
export function slugFromHost(host) {
  const h = host.toLowerCase();
  if (!h.endsWith(`.${APEX}`)) return null;
  const sub = h.slice(0, -(APEX.length + 1));
  if (sub.includes(".") || RESERVED.has(sub) || !SLUG.test(sub)) return null;
  return sub;
}

/** Where a request on a card subdomain is fetched from on the apex site. */
export function targetUrl(requestUrl, slug) {
  const url = new URL(requestUrl);
  const target = new URL(`https://${APEX}`);
  target.pathname = url.pathname === "/" ? `/c/${slug}` : url.pathname;
  target.search = url.search;
  return target;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    // www and unknown or reserved subdomains go to the main site.
    if (host === `www.${APEX}`) return Response.redirect(`https://${APEX}${url.pathname}${url.search}`, 301);
    const slug = slugFromHost(host);
    if (!slug) return Response.redirect(`https://${APEX}/`, 302);

    const headers = new Headers(request.headers);
    // Lets the app build canonical URLs and links on the card's own subdomain.
    headers.set("x-card-host", host);
    headers.set("x-forwarded-host", host);
    const res = await fetch(targetUrl(url, slug), {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
      redirect: "manual",
    });

    // Keep redirects on the subdomain: /c/<slug> on the apex becomes "/" here.
    const location = res.headers.get("location");
    if (location) {
      const loc = new URL(location, `https://${APEX}`);
      if (loc.hostname === APEX && loc.pathname.startsWith(`/c/${slug}`)) {
        const out = new Response(res.body, res);
        out.headers.set("location", `https://${host}${loc.pathname.slice(`/c/${slug}`.length) || "/"}${loc.search}`);
        return out;
      }
    }
    return res;
  },
};
