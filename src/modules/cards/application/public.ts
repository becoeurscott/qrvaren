"use server";

import { cache } from "react";
import { serverDb } from "@/shared/insforge";
import type { CardContent, ClickTarget, PageKind } from "../domain/card";

export type PublicCard =
  | ({ status: "active"; slug: string; kind?: PageKind; updated_at: string } & CardContent)
  | { status: "suspended" | "draft"; slug: string; locale: CardContent["locale"]; name: string };

/** Public card by slug (only what the page shows), or null when it doesn't exist. Deduped per request. */
export const getPublicCard = cache(async (slug: string): Promise<PublicCard | null> => {
  const { data } = await serverDb().rpc("get_public_card", { p_slug: slug.toLowerCase() });
  return (data as PublicCard | null) ?? null;
});

/** One visit; `qr` when it came from the card's QR code (?src=qr), else `link`. */
export async function recordCardView(slug: string, source: "qr" | "link" = "link") {
  try { await serverDb().rpc("record_card_view", { p_slug: slug, p_source: source }); } catch {}
}

/** One tap on a card button (the database ignores unknown targets). */
export async function recordCardClick(slug: string, target: ClickTarget) {
  try { await serverDb().rpc("record_card_click", { p_slug: slug, p_target: target }); } catch {}
}

export async function reportCard(slug: string, reason: string): Promise<boolean> {
  const text = reason.trim().slice(0, 500);
  if (!text) return false;
  const { data } = await serverDb().rpc("report_card", { p_slug: slug, p_reason: text });
  return data === true;
}
