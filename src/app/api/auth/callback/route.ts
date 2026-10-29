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

  // Signing in on admin.<domain> lands on the admin home; the main site lands on the dashboard.
  const onAdmin = /^admin\./i.test(request.headers.get("host") ?? "");
  const response = NextResponse.redirect(new URL(onAdmin ? `/${locale}` : `/${locale}/dashboard`, request.url));
  const auth = createAuthActions({ requestCookies: request.cookies, responseCookies: response.cookies });
  const { data, error } = await auth.exchangeOAuthCode(code, codeVerifier);
  if (error || !data?.user) {
    console.error("OAuth code exchange failed", error?.message);
    return fail("exchange_failed");
  }
  response.cookies.delete("insforge_code_verifier");
  // Suspended accounts get no session: clear the cookies just set and send them back to login.
  const { data: suspended } = await serverDb().rpc("is_suspended", { p_user: data.user.id });
  if (suspended === true) {
    const out = fail("suspended");
    const clear = createAuthActions({ requestCookies: request.cookies, responseCookies: out.cookies });
    await clear.signOut();
    return out;
  }
  try { await serverDb().rpc("track_event", { p: { name: "sign_in", locale } }); } catch {}
  return response;
}
