import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { updateSession } from "@insforge/sdk/ssr/middleware";
import { routing } from "./i18n/routing";
import { countryLocale } from "./i18n/detect";

const intl = createMiddleware(routing);
const LOCALE_PATH = new RegExp(`^/(${routing.locales.join("|")})(/.*)?$`);

// On admin.<domain>, every page except login maps onto the secret admin path, so the URL stays short.
function adminRewrite(request: NextRequest) {
  const secret = process.env.ADMIN_PATH;
  if (!secret || !/^admin\./i.test(request.headers.get("host") ?? "")) return null;
  const m = LOCALE_PATH.exec(request.nextUrl.pathname);
  if (!m) return null;
  const rest = m[2] ?? "";
  if (rest === `/${secret}` || rest.startsWith(`/${secret}/`) || rest.startsWith("/login")) return null;
  const url = request.nextUrl.clone();
  url.pathname = `/${m[1]}/${secret}${rest}`;
  return NextResponse.rewrite(url);
}

// First visit without a locale in the URL: the router follows the phone language. When the phone uses a
// language we don't offer, the visitor's country picks it instead (sent to the router as the preferred language).
// A language chosen in the menu is kept in the NEXT_LOCALE cookie and always wins.
function withCountryLocale(request: NextRequest): NextRequest {
  if (LOCALE_PATH.test(request.nextUrl.pathname) || request.cookies.has("NEXT_LOCALE")) return request;
  const country = request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry");
  const locale = countryLocale(request.headers.get("accept-language"), country, routing.locales);
  if (!locale) return request;
  const headers = new Headers(request.headers);
  headers.set("accept-language", locale);
  return new NextRequest(request.url, { headers });
}

// Locale routing first, then refresh the InsForge session so pages render with a valid token.
export default async function middleware(request: NextRequest) {
  const response = adminRewrite(request) ?? intl(withCountryLocale(request));
  await updateSession({ requestCookies: request.cookies, responseCookies: response.cookies });
  return response;
}

export const config = { matcher: ["/((?!api|_next|_vercel|r/|c/|go/|admin|apple-icon|.*\\..*).*)"] };
