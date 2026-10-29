import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { updateSession } from "@insforge/sdk/ssr/middleware";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

// Locale routing first, then refresh the InsForge session so pages render with a valid token.
export default async function middleware(request: NextRequest) {
  const response = intl(request);
  await updateSession({ requestCookies: request.cookies, responseCookies: response.cookies });
  return response;
}

export const config = { matcher: ["/((?!api|_next|_vercel|r/|c/|go/|admin|apple-icon|.*\\..*).*)"] };
