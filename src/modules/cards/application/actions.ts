"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getUser, userDb } from "@/shared/auth";
import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import { CardContentSchema, PAGE_KINDS, isValidSlug, slugCandidates, type Card, type PageKind } from "../domain/card";

const asKind = (v: unknown): PageKind => (PAGE_KINDS as readonly unknown[]).includes(v) ? (v as PageKind) : "card";
const editorPath = (kind: PageKind) => (kind === "bio" ? "/dashboard/bio" : "/dashboard/card");

const COLUMNS =
  "id, slug, status, locale, name, tagline, description, phone, email, website, address, hours, socials, links, gallery, logo_url, logo_key, photo_url, photo_key, kind, theme, design, plan, paid_until, expires_at";

/** The signed-in user's business card (or bio page), or null. */
export async function getMyCard(kind: PageKind = "card"): Promise<Card | null> {
  const user = await getUser();
  if (!user) return null;
  const db = await userDb();
  const { data } = await db.from("cards").select(COLUMNS).eq("owner_id", user.id).eq("kind", asKind(kind)).maybeSingle();
  return (data as Card | null) ?? null;
}

/** Both products of the signed-in user (dashboard). */
export async function getMyPages(): Promise<Card[]> {
  const user = await getUser();
  if (!user) return [];
  const db = await userDb();
  const { data } = await db.from("cards").select(COLUMNS).eq("owner_id", user.id).order("kind");
  return (data ?? []) as Card[];
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
export async function createCard(input: { name: string; slug: string; locale: "en" | "es" | "fr"; kind?: PageKind }): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "auth" };
  const name = input.name.trim().slice(0, 80);
  const slug = input.slug.trim().toLowerCase();
  if (!name) return { ok: false, error: "name" };
  if (!(await checkSlug(slug))) return { ok: false, error: "slug_taken" };
  const db = await userDb();
  const kind = asKind(input.kind);
  const { error } = await db.from("cards").insert([{ owner_id: user.id, slug, name, locale: input.locale, kind, theme: kind === "bio" ? "minimal" : "lavender" }]);
  if (error) return { ok: false, error: /duplicate|unique/i.test(error.message) ? "slug_taken" : "save" };
  revalidatePath(`/${input.locale}/dashboard`);
  return { ok: true };
}

/** Saves the editor content (the address and the billing fields can't be changed here). */
export async function saveCard(raw: unknown, kind: PageKind = "card"): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "auth" };
  const parsed = CardContentSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.path.join(".") || "invalid" };
  const db = await userDb();
  const { data: card, error } = await db.from("cards").update(parsed.data).eq("owner_id", user.id).eq("kind", asKind(kind)).select("slug").maybeSingle();
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
async function billingConfig(plan: "monthly" | "yearly", kind: PageKind = "card") {
  const db = await userDb();
  const { data } = await db.from("settings").select("key, value").in("key", ["stripe.environment", `stripe.price.${kind}_${plan}`]);
  const map = Object.fromEntries(((data ?? []) as { key: string; value: unknown }[]).map((r) => [r.key, r.value]));
  const environment = map["stripe.environment"] === "test" ? "test" : "live";
  const priceId = typeof map[`stripe.price.${kind}_${plan}`] === "string" ? (map[`stripe.price.${kind}_${plan}`] as string) : "";
  return { environment, priceId } as const;
}

/** Sends the owner to Stripe Checkout for the card subscription. */
export async function startCheckout(formData: FormData) {
  const locale = String(formData.get("locale") ?? "en");
  const plan = formData.get("plan") === "yearly" ? "yearly" : "monthly";
  const kind = asKind(formData.get("kind"));
  const back = `/${locale}${editorPath(kind)}`;
  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);
  const card = await getMyCard(kind);
  if (!card) redirect(back);
  const { environment, priceId } = await billingConfig(plan, kind);
  if (!priceId) redirect(`${back}?billing=unavailable`);

  const client = createServerClient({ cookies: await cookies() });
  const base = await origin();
  const { data, error } = await client.payments.stripe.createCheckoutSession(environment, {
    mode: "subscription",
    lineItems: [{ priceId, quantity: 1 }],
    successUrl: `${base}${back}?paid=1`,
    cancelUrl: `${base}${back}?canceled=1`,
    subject: { type: "user", id: user.id },
    customerEmail: user.email ?? null,
    metadata: { card_id: card.id, slug: card.slug, kind },
  });
  if (error || !data?.checkoutSession.url) {
    console.error("checkout failed", error?.message);
    redirect(`${back}?billing=error`);
  }
  redirect(data.checkoutSession.url);
}

/** Stripe customer portal: payment method, invoices, cancel. */
export async function openBillingPortal(formData: FormData) {
  const locale = String(formData.get("locale") ?? "en");
  const back = `/${locale}${editorPath(asKind(formData.get("kind")))}`;
  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);
  const { environment } = await billingConfig("monthly");
  const client = createServerClient({ cookies: await cookies() });
  const { data, error } = await client.payments.stripe.createCustomerPortalSession(environment, {
    subject: { type: "user", id: user.id },
    returnUrl: `${await origin()}${back}`,
  });
  if (error || !data?.customerPortalSession.url) redirect(`${back}?billing=error`);
  redirect(data.customerPortalSession.url);
}
