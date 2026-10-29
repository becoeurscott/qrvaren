"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthActions } from "@insforge/sdk/ssr";
import { routing } from "@/i18n/routing";
import { safeNext } from "@/shared/safeNext";

const safeLocale = (l: string) => ((routing.locales as readonly string[]).includes(l) ? l : routing.defaultLocale);

async function appOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
}

/** Starts Google sign-in on the server so the session ends up in httpOnly cookies. */
export async function signInWithGoogle(formData: FormData) {
  const locale = safeLocale(String(formData.get("locale") ?? ""));
  const cookieStore = await cookies();
  const auth = createAuthActions({ cookies: cookieStore });
  const callback = new URL("/api/auth/callback", await appOrigin());
  callback.searchParams.set("locale", locale);

  const { data, error } = await auth.signInWithOAuth("google", { redirectTo: callback.toString(), skipBrowserRedirect: true });
  if (error || !data?.url || !data.codeVerifier) redirect(`/${locale}/login?error=oauth_init`);

  cookieStore.set("insforge_code_verifier", data.codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  // Where to land after sign-in (e.g. the card editor), kept for the callback.
  const next = safeNext(String(formData.get("next") ?? ""));
  if (next) cookieStore.set("after_login", next, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600 });
  else cookieStore.delete("after_login");
  redirect(data.url);
}

export async function signOut(formData: FormData) {
  const locale = safeLocale(String(formData.get("locale") ?? ""));
  const auth = createAuthActions({ cookies: await cookies() });
  await auth.signOut();
  redirect(`/${locale}`);
}
