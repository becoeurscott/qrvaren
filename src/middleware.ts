import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { updateSession } from "@insforge/sdk/ssr/middleware";
import { routing } from "./i18n/routing";

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

// Locale routing first, then refresh the InsForge session so pages render with a valid token.
export default async function middleware(request: NextRequest) {
  const response = adminRewrite(request) ?? intl(request);
  await updateSession({ requestCookies: request.cookies, responseCookies: response.cookies });
  return response;
}

export const config = { matcher: ["/((?!api|_next|_vercel|r/|c/|go/|admin|apple-icon|.*\\..*).*)"] };
