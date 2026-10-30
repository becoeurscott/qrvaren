"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { startCheckout } from "../application/actions";
import type { PageKind } from "../domain/card";

/** Plan buttons with the auto-renewal terms stated next to them and an explicit consent box
 * (California automatic renewal law). The server action refuses a checkout without the consent. */
export function RenewalCheckout({ locale, kind, prices, dark = false, stacked = false }: {
  locale: string; kind: PageKind; prices: { monthly: number | string; yearly: number | string };
  dark?: boolean; stacked?: boolean;
}) {
  const t = useTranslations("cardEditor");
  const [ok, setOk] = useState(false);
  const plans = stacked ? (["yearly", "monthly"] as const) : (["monthly", "yearly"] as const);
  return (
    <div className="space-y-3">
      <p className={`text-xs leading-relaxed ${dark ? "text-white/75" : "text-slate"}`}>
        {t("renewal.notice", { monthly: `$${prices.monthly}`, yearly: `$${prices.yearly}` })}
      </p>
      <label className={`flex items-start gap-2 text-sm font-semibold ${dark ? "text-white" : "text-ink"}`}>
        <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-lime" />
        <span>
          {t.rich("renewal.consent", { terms: (c) => <Link href="/terms" target="_blank" className="underline">{c}</Link> })}
        </span>
      </label>
      <div className={stacked ? "space-y-2" : "flex flex-wrap gap-2"}>
        {plans.map((plan) => (
          <form key={plan} action={startCheckout}>
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="plan" value={plan} />
            <input type="hidden" name="kind" value={kind} />
            <input type="hidden" name="renew_ok" value={ok ? "1" : ""} />
            <button disabled={!ok}
              className={`btn rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${stacked ? "w-full px-6 py-4" : "px-5 py-3 text-sm"} ${plan === "yearly" ? "bg-lime text-ink" : dark ? "bg-white text-ink" : "bg-ink text-white"}`}>
              {t(plan, { price: `$${prices[plan]}` })}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
