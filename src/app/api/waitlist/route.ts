import { NextResponse } from "next/server";
import { z } from "zod";

// Waiting list is stored in Phase 2 once the table exists; for now we validate and log.
const Body = z.object({ email: z.string().email(), locale: z.string().max(5).optional() });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  console.info("[waitlist]", parsed.data.locale, parsed.data.email.replace(/(.).+(@.*)/, "$1***$2"));
  return NextResponse.json({ ok: true });
}
