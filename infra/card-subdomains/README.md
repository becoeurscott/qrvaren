# Card subdomains (`<name>.qrvaren.online`)

InsForge hosting does not accept wildcard domains, so card subdomains are served by a
Cloudflare Worker in front of the site:

- `https://<name>.qrvaren.online/` is fetched from `https://qrvaren.online/c/<name>`
  (the app's public card page), and the visitor keeps seeing the subdomain.
- Other paths on a card subdomain (`/_next/...`, `/api/...`) are fetched from the apex site.
- `www.qrvaren.online` redirects to `https://qrvaren.online`.
- The apex `qrvaren.online` is not routed through the Worker.

## One-time setup

1. **Cloudflare**: create a free account, then *Add a site* → `qrvaren.online` → Free plan.
   Cloudflare imports the current DNS records. Check them before going further:
   - the `A` record for `qrvaren.online` → `216.150.16.1` must be **DNS only (grey cloud)**,
     so InsForge/Vercel keeps serving and certifying the main site;
   - keep any `MX` / `TXT` records (email, verification).
2. **Hostinger**: replace the domain's nameservers (`horizon.dns-parking.com`,
   `orbit.dns-parking.com`) with the two nameservers Cloudflare shows. Propagation
   takes from a few minutes to 24 hours; Cloudflare emails you when the site is active.
3. **Cloudflare DNS**: add a record `AAAA`, name `*`, content `100::`, **Proxied (orange cloud)**.
   It only exists so the Worker route can catch every subdomain.
4. **Cloudflare SSL/TLS**: encryption mode **Full (strict)**. The free Universal SSL
   certificate already covers `*.qrvaren.online`.
5. **Deploy the Worker** from this folder:

   ```bash
   npx wrangler login
   npx wrangler deploy
   ```

## Checks

```bash
npx vitest run infra
curl -sI https://www.qrvaren.online/        # 301 to https://qrvaren.online/
curl -sI https://<a-card>.qrvaren.online/   # 200 once that card exists
```

`RESERVED` in `worker.js` must stay in sync with the reserved slugs in the app.
