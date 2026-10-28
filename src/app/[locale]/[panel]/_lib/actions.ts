"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, type Perm } from "./admin";

type Db = Awaited<ReturnType<typeof requireAdmin>>["db"];
type Result = { error?: { message: string } | null };

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const opt = (f: FormData, k: string) => str(f, k) || null;
const num = (f: FormData, k: string) => (str(f, k) === "" ? null : Number(str(f, k)));
const list = (f: FormData, k: string) => {
  const v = str(f, k).split(",").map((s) => s.trim()).filter(Boolean);
  return v.length ? v : null;
};

// Every form posts its page path (back) and the secret panel slug. RLS rejects non-admins anyway.
async function run(f: FormData, ok: string, fn: (db: Db) => PromiseLike<Result>, perm: Perm = "config") {
  const back = str(f, "back");
  const { db } = await requireAdmin(str(f, "panel"), perm);
  const { error } = await fn(db);
  revalidatePath(back);
  revalidateTag("config");
  redirect(`${back}?${error ? `error=${encodeURIComponent(error.message)}` : `ok=${encodeURIComponent(ok)}`}`);
}

// ---------- Plans & features ----------
export async function savePlanFeature(f: FormData) {
  const plan = str(f, "plan"), feature = str(f, "feature");
  await run(f, `Saved ${feature} on ${plan}`, (db) =>
    db.from("plan_features").upsert([{ plan_key: plan, feature_key: feature, enabled: f.get("enabled") === "on", limit_count: num(f, "limit"), lifetime_days: num(f, "lifetime") }]));
}

export async function removePlanFeature(f: FormData) {
  await run(f, "Removed from plan", (db) => db.from("plan_features").delete().eq("plan_key", str(f, "plan")).eq("feature_key", str(f, "feature")));
}

export async function saveFeature(f: FormData) {
  await run(f, `Saved feature ${str(f, "key")}`, (db) => db.from("features").upsert([{ key: str(f, "key"), description: str(f, "description") }]));
}

export async function deleteFeature(f: FormData) {
  await run(f, "Feature deleted", (db) => db.from("features").delete().eq("key", str(f, "key")));
}

export async function savePlan(f: FormData) {
  await run(f, `Saved plan ${str(f, "key")}`, (db) =>
    db.from("plans").upsert([{ key: str(f, "key"), name: str(f, "name"), audience: opt(f, "audience"), sort: num(f, "sort") ?? 0 }]));
}

export async function deletePlan(f: FormData) {
  await run(f, "Plan deleted", (db) => db.from("plans").delete().eq("key", str(f, "key")));
}

// ---------- Settings ----------
export async function saveSetting(f: FormData) {
  const raw = str(f, "value");
  let value: unknown = raw;
  try { value = JSON.parse(raw); } catch {}
  await run(f, `Saved ${str(f, "key")}`, (db) => db.from("settings").upsert([{ key: str(f, "key"), value, updated_at: new Date().toISOString() }]));
}

export async function deleteSetting(f: FormData) {
  await run(f, "Setting deleted", (db) => db.from("settings").delete().eq("key", str(f, "key")));
}

// ---------- Ads ----------
export async function toggleSlot(f: FormData) {
  await run(f, "Slot updated", (db) => db.from("ad_slots").update({ enabled: str(f, "enabled") === "true" }).eq("key", str(f, "key")));
}

export async function saveAdBlock(f: FormData) {
  const id = opt(f, "id");
  const row = {
    slot_key: str(f, "slot"),
    kind: str(f, "kind"),
    locale: opt(f, "locale"),
    pages: list(f, "pages"),
    plans: list(f, "plans"),
    title: opt(f, "title"),
    body: opt(f, "body"),
    image_url: opt(f, "image_url"),
    link_url: opt(f, "link_url"),
    cta: opt(f, "cta"),
    adsense_client: opt(f, "adsense_client"),
    adsense_slot: opt(f, "adsense_slot"),
    priority: num(f, "priority") ?? 0,
    enabled: f.get("enabled") === "on",
  };
  await run(f, id ? "Ad updated" : "Ad created", (db) => (id ? db.from("ad_blocks").update(row).eq("id", id) : db.from("ad_blocks").insert([row])));
}

export async function toggleAdBlock(f: FormData) {
  await run(f, "Ad updated", (db) => db.from("ad_blocks").update({ enabled: str(f, "enabled") === "true" }).eq("id", str(f, "id")));
}

export async function deleteAdBlock(f: FormData) {
  await run(f, "Ad deleted", (db) => db.from("ad_blocks").delete().eq("id", str(f, "id")));
}

// ---------- Users ----------
const ROLES = ["super_admin", "admin", "support", "moderator", "analyst"];

export async function setRole(f: FormData) {
  const role = str(f, "role");
  if (role && !ROLES.includes(role)) return;
  await run(f, role ? "Role updated" : "Staff access removed", (db) => db.rpc("admin_set_role", { p_user: str(f, "user"), p_role: role || null }), "roles");
}

export async function setSuspended(f: FormData) {
  const suspend = str(f, "suspend") === "true";
  if (suspend && f.get("confirm") !== "on") {
    redirect(`${str(f, "back")}?error=${encodeURIComponent("Tick the confirmation box to suspend this account")}`);
  }
  await run(f, suspend ? "Account suspended" : "Account reactivated", (db) =>
    db.rpc("admin_set_suspended", { p_user: str(f, "user"), p_suspended: suspend, p_reason: str(f, "reason").slice(0, 500) }), "users.suspend");
}

export async function addNote(f: FormData) {
  const body = str(f, "body").slice(0, 4000);
  if (!body) return;
  await run(f, "Note added", (db) => db.from("admin_notes").insert([{ user_id: str(f, "user"), body }]), "notes");
}

export async function deleteNote(f: FormData) {
  await run(f, "Note deleted", (db) => db.from("admin_notes").delete().eq("id", Number(str(f, "id"))), "notes");
}
