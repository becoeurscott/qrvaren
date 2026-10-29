import { unstable_cache } from "next/cache";
import { serverDb } from "@/shared/insforge";

// Settings live in InsForge; the admin edits them, the app reads them through a short cache.
export const DEFAULTS = { monthly: 2.99, yearly: 29.99, graceDays: 30, cacheSeconds: 60 };

export const getPrices = unstable_cache(
  async () => {
    try {
      const { data } = await serverDb().from("settings").select("key,value").in("key", ["price.card.monthly_usd", "price.card.yearly_usd", "card.grace_days"]);
      const map = Object.fromEntries((data ?? []).map((r: { key: string; value: unknown }) => [r.key, Number(r.value)]));
      return {
        monthly: map["price.card.monthly_usd"] || DEFAULTS.monthly,
        yearly: map["price.card.yearly_usd"] || DEFAULTS.yearly,
        graceDays: map["card.grace_days"] || DEFAULTS.graceDays,
      };
    } catch {
      return DEFAULTS;
    }
  },
  ["settings-prices"],
  { revalidate: DEFAULTS.cacheSeconds, tags: ["config"] },
);
