import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";

// Server-side session: the access token cookie is read per request. Calling this makes the route dynamic.
// A suspended account is treated as signed out (is_active_user() is FALSE for it).
export async function getUser() {
  try {
    const client = createServerClient({ cookies: await cookies() });
    const { data } = await client.auth.getCurrentUser();
    if (!data?.user) return null;
    const { data: active } = await client.database.rpc("is_active_user");
    return active === false ? null : data.user;
  } catch {
    return null;
  }
}

// Database client acting as the signed-in user, so RLS and is_admin() see their id.
export async function userDb() {
  return createServerClient({ cookies: await cookies() }).database;
}
