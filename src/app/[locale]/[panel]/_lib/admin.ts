import "server-only";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getUser, userDb } from "@/shared/auth";

export type Role = "super_admin" | "admin" | "support" | "moderator" | "analyst";
export type Perm = "analytics" | "audit" | "config" | "users.read" | "users.suspend" | "notes" | "roles";

export const ROLE_LABEL: Record<Role, string> = {
  super_admin: "Super admin", admin: "Admin", support: "Support", moderator: "Moderator", analyst: "Analyst",
};

/**
 * Gate for every admin page and action: secret path, signed in, a staff role, and (optionally) one permission.
 * Anything else is a 404. Permissions come from role_perms() in the database, which also enforces them in RLS.
 */
export async function requireAdmin(panel: string, perm?: Perm) {
  if (!process.env.ADMIN_PATH || panel !== process.env.ADMIN_PATH) notFound();
  const user = await getUser();
  if (!user) {
    // admin.<domain> is openly the admin, so send visitors to sign in; on the main site stay a plain 404.
    if (/^admin\./i.test((await headers()).get("host") ?? "")) redirect(`/${await getLocale()}/login`);
    notFound();
  }
  const db = await userDb();
  const { data } = await db.rpc("my_admin_perms");
  const me = data as { role: Role | null; perms: Perm[] } | null;
  if (!me?.role) notFound();
  if (perm && !me.perms.includes(perm)) notFound();
  const can = (p: Perm) => me.perms.includes(p);
  return { user, db, role: me.role, perms: me.perms, can };
}
