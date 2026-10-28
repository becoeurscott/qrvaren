import { createClient } from "@insforge/sdk";

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY ?? "";

/** Anonymous client for cacheable public reads (settings, prices). Session-aware code uses @/shared/auth or useSession. */
export function serverDb() {
  return createClient({ baseUrl, anonKey }).database;
}

