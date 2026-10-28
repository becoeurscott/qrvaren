import { NextResponse } from "next/server";
import { z } from "zod";
import { serverDb } from "@/shared/insforge";

// First-party analytics: the browser posts small events, the server adds country and device.
const Body = z.object({
  name: z.string().regex(/^[a-z0-9_]{1,40}$/),
  path: z.string().max(200).optional(),
  locale: z.string().max(5).optional(),
  qr_type: z.string().max(30).optional(),
  fmt: z.string().max(10).optional(),
  session_id: z.string().max(40).optional(),
  referrer: z.string().max(500).optional(),
});

function device(ua: string) {
  if (/ipad|tablet/i.test(ua)) return "tablet";
  if (/mobi|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

function host(url?: string) {
  try { return url ? new URL(url).hostname.replace(/^www\./, "") : undefined; } catch { return undefined; }
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new NextResponse(null, { status: 400 });
  const { referrer, ...e } = parsed.data;
  const ref = host(referrer);
  const self = host(req.headers.get("origin") ?? undefined);
  try {
    await serverDb().rpc("track_event", {
    p: {
      ...e,
      referrer_host: ref && ref !== self ? ref : undefined,
      device: device(req.headers.get("user-agent") ?? ""),
      country: req.headers.get("cf-ipcountry") ?? req.headers.get("x-vercel-ip-country") ?? undefined,
    },
  });
  } catch {}
  return new NextResponse(null, { status: 204 });
}
