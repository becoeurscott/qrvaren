import { requireAdmin } from "../_lib/admin";
import { deleteSetting, saveSetting } from "../_lib/actions";
import { btn, btnDanger, Card, Ctx, Flash, input, PageHead, type AdminProps } from "../_lib/ui";

type Setting = { key: string; value: unknown; updated_at: string };
const HINTS: Record<string, string> = {
  "price.card.monthly_usd": "Business card price per month (USD)",
  "price.card.yearly_usd": "Business card price per year (USD)",
  "card.grace_days": "Days a card stays online after a subscription ends",
  config_cache_seconds: "How long the site caches these settings",
  config_version: "Bumped automatically on every change",
};

// Global settings: prices, grace period, cache. Values are JSON: numbers, "quoted text", true/false.
export default async function SettingsPage({ params, searchParams }: AdminProps) {
  const { locale, panel } = await params;
  const sp = await searchParams;
  const { db } = await requireAdmin(panel, "config");
  const back = `/${locale}/${panel}/settings`;
  const { data } = await db.from("settings").select("*").order("key");
  const rows = (data ?? []) as Setting[];

  return (
    <>
      <PageHead title="Settings & prices" sub="Configuration" />
      <Flash ok={sp.ok} error={sp.error} />
      <Card>
        <div className="space-y-3">
          {[...rows, { key: "", value: "", updated_at: "" }].map((r) => (
            <form key={r.key || "new"} action={saveSetting} className="grid items-start gap-2 md:grid-cols-[1.2fr_1fr_auto_auto]">
              <Ctx back={back} panel={panel} />
              <div>
                <input name="key" defaultValue={r.key} readOnly={!!r.key} placeholder="new.setting_key" className={`${input} ${r.key ? "font-semibold opacity-80" : ""}`} required />
                {(HINTS[r.key] || r.updated_at) && <p className="mt-1 px-1 text-xs text-slate">{HINTS[r.key]}{r.updated_at && ` · updated ${new Date(r.updated_at).toLocaleString(locale)}`}</p>}
              </div>
              <input name="value" defaultValue={r.key ? JSON.stringify(r.value) : ""} placeholder="value" className={input} required readOnly={r.key === "config_version"} />
              <button className={btn}>{r.key ? "Save" : "Add"}</button>
              {r.key ? <button formAction={deleteSetting} formNoValidate className={btnDanger}>Delete</button> : <span />}
            </form>
          ))}
        </div>
      </Card>
    </>
  );
}
