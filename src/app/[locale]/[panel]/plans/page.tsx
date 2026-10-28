import { requireAdmin } from "../_lib/admin";
import { deleteFeature, deletePlan, removePlanFeature, saveFeature, savePlan, savePlanFeature } from "../_lib/actions";
import { btn, btnDanger, btnGhost, Card, Ctx, Flash, input, PageHead, type AdminProps } from "../_lib/ui";

type Plan = { key: string; name: string; audience: string | null; sort: number };
type Feature = { key: string; description: string };
type PF = { plan_key: string; feature_key: string; enabled: boolean; limit_count: number | null; lifetime_days: number | null };

// Who gets what: plans, features, and per-plan quotas and lifetimes.
export default async function PlansPage({ params, searchParams }: AdminProps) {
  const { locale, panel } = await params;
  const sp = await searchParams;
  const { db } = await requireAdmin(panel, "config");
  const back = `/${locale}/${panel}/plans`;
  const [plans, features, pfs] = await Promise.all([
    db.from("plans").select("*").order("sort"),
    db.from("features").select("*").order("key"),
    db.from("plan_features").select("*"),
  ]);
  const P = (plans.data ?? []) as Plan[], F = (features.data ?? []) as Feature[], PFS = (pfs.data ?? []) as PF[];
  const get = (p: string, f: string) => PFS.find((x) => x.plan_key === p && x.feature_key === f);

  return (
    <>
      <PageHead title="Plans & features" sub="Entitlements" />
      <Flash ok={sp.ok} error={sp.error} />

      <Card title="Plans" className="mb-4">
        <div className="space-y-2">
          {[...P, { key: "", name: "", audience: null, sort: P.length }].map((p) => (
            <form key={p.key || "new"} action={savePlan} className="grid grid-cols-2 items-center gap-2 md:grid-cols-[1fr_1.5fr_1fr_80px_auto_auto]">
              <Ctx back={back} panel={panel} />
              <input name="key" defaultValue={p.key} readOnly={!!p.key} placeholder="new_plan_key" pattern="[a-z0-9_]+" className={`${input} ${p.key ? "opacity-60" : ""}`} required />
              <input name="name" defaultValue={p.name} placeholder="Name" className={input} required />
              <select name="audience" defaultValue={p.audience ?? ""} className={input}>
                <option value="">Paid / manual</option><option value="visitor">Default: visitors</option><option value="signed_in">Default: signed in</option>
              </select>
              <input name="sort" type="number" defaultValue={p.sort} className={input} />
              <button className={btn}>{p.key ? "Save" : "Add plan"}</button>
              {p.key ? <button formAction={deletePlan} formNoValidate className={btnDanger}>Delete</button> : <span />}
            </form>
          ))}
        </div>
      </Card>

      <Card title="What each plan includes" className="mb-4">
        <p className="mb-4 text-sm text-slate">Tick to include. Limit = how many (empty = unlimited). Days = how long stored content lives (empty = forever).</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead><tr className="text-left text-xs uppercase tracking-widest text-slate"><th className="py-2 pr-3">Feature</th>{P.map((p) => <th key={p.key} className="px-2">{p.name}</th>)}</tr></thead>
            <tbody>
              {F.map((f) => (
                <tr key={f.key} className="border-t border-ink/10 align-top">
                  <td className="py-3 pr-3"><b>{f.key}</b><p className="text-xs text-slate">{f.description}</p></td>
                  {P.map((p) => {
                    const v = get(p.key, f.key);
                    return (
                      <td key={p.key} className="px-2 py-2">
                        <form action={savePlanFeature} className={`flex flex-col gap-1 rounded-xl p-2 ${v?.enabled ? "bg-lime/40" : v ? "bg-coral/10" : "bg-lavender/60"}`}>
                          <Ctx back={back} panel={panel} />
                          <input type="hidden" name="plan" value={p.key} /><input type="hidden" name="feature" value={f.key} />
                          <label className="flex items-center gap-1.5 text-xs font-semibold"><input type="checkbox" name="enabled" defaultChecked={v ? v.enabled : false} /> on</label>
                          <div className="flex gap-1">
                            <input name="limit" type="number" min={0} defaultValue={v?.limit_count ?? ""} placeholder="limit" className="w-16 rounded-lg bg-white px-1.5 py-1 text-xs" />
                            <input name="lifetime" type="number" min={1} defaultValue={v?.lifetime_days ?? ""} placeholder="days" className="w-16 rounded-lg bg-white px-1.5 py-1 text-xs" />
                          </div>
                          <div className="flex gap-1">
                            <button className="rounded-full bg-ink px-2 py-0.5 text-xs font-semibold text-white">Save</button>
                            {v && <button formAction={removePlanFeature} className="rounded-full px-2 py-0.5 text-xs text-coral" title="Remove from plan">✕</button>}
                          </div>
                        </form>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Features">
        <div className="space-y-2">
          {[...F, { key: "", description: "" }].map((f) => (
            <form key={f.key || "new"} action={saveFeature} className="grid gap-2 md:grid-cols-[1fr_2fr_auto_auto]">
              <Ctx back={back} panel={panel} />
              <input name="key" defaultValue={f.key} readOnly={!!f.key} placeholder="new.feature_key" pattern="[a-z0-9_.]+" className={`${input} ${f.key ? "opacity-60" : ""}`} required />
              <input name="description" defaultValue={f.description} placeholder="Description" className={input} />
              <button className={f.key ? btnGhost : btn}>{f.key ? "Save" : "Add feature"}</button>
              {f.key ? <button formAction={deleteFeature} formNoValidate className={btnDanger}>Delete</button> : <span />}
            </form>
          ))}
        </div>
      </Card>
    </>
  );
}
