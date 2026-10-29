import { NextResponse } from "next/server";
import { getUser } from "@/shared/auth";

// The session lives in httpOnly cookies the browser can't read, so the nav asks here who is signed in.
export const dynamic = "force-dynamic";

export async function GET() {
  const u = await getUser();
  const user = u ? { id: u.id, email: u.email ?? null, profile: u.profile ? { name: u.profile.name ?? null, avatar_url: u.profile.avatar_url ?? null } : null } : null;
  return NextResponse.json({ user }, { headers: { "Cache-Control": "private, no-store" } });
}
