import { createClient } from "@insforge/sdk";

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY ?? "";

/** Server-side client with the public anon key: reads only what RLS allows to everyone. */
export function serverDb() {
  return createClient({ baseUrl, anonKey }).database;
}

/** Browser client (anon key, user session once logged in). */
let browser: ReturnType<typeof createClient> | undefined;
export function browserClient() {
  return (browser ??= createClient({ baseUrl, anonKey }));
}
