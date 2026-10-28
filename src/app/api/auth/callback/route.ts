import { NextResponse, type NextRequest } from "next/server";
import { createAuthActions } from "@insforge/sdk/ssr";
import { routing } from "@/i18n/routing";
import { serverDb } from "@/shared/insforge";

// OAuth return: exchange the code for a session and set the auth cookies, then go to the dashboard.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const asked = params.get("locale") ?? "";
  const locale = (routing.locales as readonly string[]).includes(asked) ? asked : routing.defaultLocale;
  const fail = (reason: string) => NextResponse.redirect(new URL(`/${locale}/login?error=${reason}`, request.url));

  const code = params.get("insforge_code");
  if (params.get("error") || !code) return fail("oauth_failed");
  const codeVerifier = request.cookies.get("insforge_code_verifier")?.value;
  if (!codeVerifier) return fail("missing_verifier");

  const response = NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  const auth = createAuthActions({ requestCookies: request.cookies, responseCookies: response.cookies });
  const { data, error } = await auth.exchangeOAuthCode(code, codeVerifier);
  if (error || !data?.user) {
    console.error("OAuth code exchange failed", error?.message);
    return fail("exchange_failed");
  }
  response.cookies.delete("insforge_code_verifier");
  try { await serverDb().rpc("track_event", { p: { name: "sign_in", locale } }); } catch {}
  return response;
}
