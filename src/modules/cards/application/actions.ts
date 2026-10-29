"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getUser, userDb } from "@/shared/auth";
import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import { CardContentSchema, isValidSlug, slugCandidates, type Card } from "../domain/card";

const COLUMNS =
  "id, slug, status, locale, name, tagline, description, phone, email, website, address, hours, socials, links, gallery, logo_url, logo_key, photo_url, photo_key, plan, paid_until, expires_at";

/** The signed-in user's card, or null. */
export async function getMyCard(): Promise<Card | null> {
  const user = await getUser();
  if (!user) return null;
  const db = await userDb();
  const { data } = await db.from("cards").select(COLUMNS).eq("owner_id", user.id).maybeSingle();
  return (data as Card | null) ?? null;
}

/** Free slug check for the "choose your address" step. */
export async function checkSlug(slug: string): Promise<boolean> {
  const s = slug.toLowerCase();
  if (!isValidSlug(s)) return false;
  const db = await userDb();
  const { data } = await db.rpc("slug_available", { p_slug: s });
  return data === true;
}

/** First free address for a business name (base, base-2, ...). */
export async function suggestSlug(name: string): Promise<string | null> {
  for (const s of slugCandidates(name, 8)) if (await checkSlug(s)) return s;
  return null;
}

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Creates the draft card with its permanent address. */
export async function createCard(input: { name: string; slug: string; locale: "en" | "es" | "fr" }): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "auth" };
  const name = input.name.trim().slice(0, 80);
  const slug = input.slug.trim().toLowerCase();
  if (!name) return { ok: false, error: "name" };
  if (!(await checkSlug(slug))) return { ok: false, error: "slug_taken" };
  const db = await userDb();
  const { error } = await db.from("cards").insert([{ owner_id: user.id, slug, name, locale: input.locale }]);
  if (error) return { ok: false, error: /duplicate|unique/i.test(error.message) ? "slug_taken" : "save" };
  revalidatePath(`/${input.locale}/dashboard`);
  return { ok: true };
}

/** Saves the editor content (the address and the billing fields can't be changed here). */
export async function saveCard(raw: unknown): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "auth" };
  const parsed = CardContentSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.path.join(".") || "invalid" };
  const db = await userDb();
  const { data: card, error } = await db.from("cards").update(parsed.data).eq("owner_id", user.id).select("slug").maybeSingle();
  if (error || !card) return { ok: false, error: "save" };
  revalidatePath(`/c/${(card as { slug: string }).slug}`);
  return { ok: true };
}

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Stripe environment and price ids come from admin settings, so test/live can switch without a deploy. */
async function billingConfig(plan: "monthly" | "yearly") {
  const db = await userDb();
  const { data } = await db.from("settings").select("key, value").in("key", ["stripe.environment", `stripe.price.card_${plan}`]);
  const map = Object.fromEntries(((data ?? []) as { key: string; value: unknown }[]).map((r) => [r.key, r.value]));
  const environment = map["stripe.environment"] === "test" ? "test" : "live";
  const priceId = typeof map[`stripe.price.card_${plan}`] === "string" ? (map[`stripe.price.card_${plan}`] as string) : "";
  return { environment, priceId } as const;
}

/** Sends the owner to Stripe Checkout for the card subscription. */
export async function startCheckout(formData: FormData) {
  const locale = String(formData.get("locale") ?? "en");
  const plan = formData.get("plan") === "yearly" ? "yearly" : "monthly";
  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);
  const card = await getMyCard();
  if (!card) redirect(`/${locale}/dashboard/card`);
  const { environment, priceId } = await billingConfig(plan);
  if (!priceId) redirect(`/${locale}/dashboard/card?billing=unavailable`);

  const client = createServerClient({ cookies: await cookies() });
  const base = await origin();
  const { data, error } = await client.payments.stripe.createCheckoutSession(environment, {
    mode: "subscription",
    lineItems: [{ priceId, quantity: 1 }],
    successUrl: `${base}/${locale}/dashboard/card?paid=1`,
    cancelUrl: `${base}/${locale}/dashboard/card?canceled=1`,
    subject: { type: "user", id: user.id },
    customerEmail: user.email ?? null,
    metadata: { card_id: card.id, slug: card.slug },
  });
  if (error || !data?.checkoutSession.url) {
    console.error("checkout failed", error?.message);
    redirect(`/${locale}/dashboard/card?billing=error`);
  }
  redirect(data.checkoutSession.url);
}

/** Stripe customer portal: payment method, invoices, cancel. */
export async function openBillingPortal(formData: FormData) {
  const locale = String(formData.get("locale") ?? "en");
  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);
  const { environment } = await billingConfig("monthly");
  const client = createServerClient({ cookies: await cookies() });
  const { data, error } = await client.payments.stripe.createCustomerPortalSession(environment, {
    subject: { type: "user", id: user.id },
    returnUrl: `${await origin()}/${locale}/dashboard/card`,
  });
  if (error || !data?.customerPortalSession.url) redirect(`/${locale}/dashboard/card?billing=error`);
  redirect(data.customerPortalSession.url);
}
