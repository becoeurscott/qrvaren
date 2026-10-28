import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";

// Server-side session: the access token cookie is read per request. Calling this makes the route dynamic.
export async function getUser() {
  try {
    const client = createServerClient({ cookies: await cookies() });
    const { data } = await client.auth.getCurrentUser();
    return data?.user ?? null;
  } catch {
    return null;
  }
}

// Database client acting as the signed-in user, so RLS and is_admin() see their id.
export async function userDb() {
  return createServerClient({ cookies: await cookies() }).database;
}
