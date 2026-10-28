import Link from "next/link";
import { requireAdmin } from "../_lib/admin";
import { deleteAdBlock, saveAdBlock, toggleAdBlock, toggleSlot } from "../_lib/actions";
import { btn, btnDanger, btnGhost, Card, Ctx, Flash, input, PageHead, type AdminProps } from "../_lib/ui";

type Slot = { key: string; label: string; enabled: boolean };
type Block = {
  id: string; slot_key: string; kind: "promo" | "adsense"; locale: string | null; pages: string[] | null; plans: string[] | null;
  title: string | null; body: string | null; image_url: string | null; link_url: string | null; cta: string | null;
  adsense_client: string | null; adsense_slot: string | null; priority: number; enabled: boolean;
};

// Ad slots on the site and the promo / AdSense blocks shown in them, with click counts.
export default async function AdsPage({ params, searchParams }: AdminProps) {
  const { locale, panel } = await params;
  const sp = await searchParams;
  const { db } = await requireAdmin(panel, "config");
  const back = `/${locale}/${panel}/ads`;
  const [slots, blocks, clicks] = await Promise.all([
    db.from("ad_slots").select("*").order("key"),
    db.from("ad_blocks").select("*").order("priority", { ascending: false }),
    db.from("ad_click_daily").select("block_id,clicks"),
  ]);
  const S = (slots.data ?? []) as Slot[], B = (blocks.data ?? []) as Block[];
  const clickBy = new Map<string, number>();
  for (const c of (clicks.data ?? []) as { block_id: string; clicks: number }[]) clickBy.set(c.block_id, (clickBy.get(c.block_id) ?? 0) + c.clicks);
  const editing = sp.edit === "new" ? ({ kind: "promo", enabled: true, priority: 0, slot_key: S[0]?.key ?? "" } as Partial<Block>) : B.find((b) => b.id === sp.edit);

  return (
    <>
      <PageHead title="Ads & promos" sub="Monetization">
        <Link href={`${back}?edit=new`} className={btn}>+ New ad</Link>
      </PageHead>
      <Flash ok={sp.ok} error={sp.error} />

      {editing && (
        <Card title={editing.id ? "Edit ad" : "New ad"} className="mb-4 ring-4 ring-violet/30">
          <form action={saveAdBlock} className="grid gap-3 md:grid-cols-2">
            <Ctx back={back} panel={panel} />
            {editing.id && <input type="hidden" name="id" value={editing.id} />}
            <Field label="Slot"><select name="slot" defaultValue={editing.slot_key} className={input}>{S.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select></Field>
            <Field label="Kind"><select name="kind" defaultValue={editing.kind} className={input}><option value="promo">Promo (own banner)</option><option value="adsense">Google AdSense</option></select></Field>
            <Field label="Title (promo)"><input name="title" defaultValue={editing.title ?? ""} className={input} /></Field>
            <Field label="Button text (promo)"><input name="cta" defaultValue={editing.cta ?? ""} className={input} /></Field>
            <Field label="Text (promo)" wide><textarea name="body" defaultValue={editing.body ?? ""} rows={2} className={input} /></Field>
            <Field label="Link URL (promo)"><input name="link_url" type="url" defaultValue={editing.link_url ?? ""} placeholder="https://" className={input} /></Field>
            <Field label="Image URL (promo)"><input name="image_url" type="url" defaultValue={editing.image_url ?? ""} placeholder="https://" className={input} /></Field>
            <Field label="AdSense client"><input name="adsense_client" defaultValue={editing.adsense_client ?? ""} placeholder="ca-pub-…" className={input} /></Field>
            <Field label="AdSense slot"><input name="adsense_slot" defaultValue={editing.adsense_slot ?? ""} className={input} /></Field>
            <Field label="Language (empty = all)"><select name="locale" defaultValue={editing.locale ?? ""} className={input}><option value="">All</option><option value="en">English</option><option value="fr">Français</option><option value="es">Español</option></select></Field>
            <Field label="Priority (higher first)"><input name="priority" type="number" defaultValue={editing.priority ?? 0} className={input} /></Field>
            <Field label="Only on pages (comma list, empty = all)"><input name="pages" defaultValue={editing.pages?.join(", ") ?? ""} placeholder="home, wifi-qr-code" className={input} /></Field>
            <Field label="Only for plans (comma list, empty = all)"><input name="plans" defaultValue={editing.plans?.join(", ") ?? ""} placeholder="visitor, signed_in" className={input} /></Field>
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="enabled" defaultChecked={editing.enabled} /> Enabled</label>
            <div className="flex justify-end gap-2 md:col-span-2">
              <Link href={back} className={btnGhost}>Cancel</Link>
              <button className={btn}>Save ad</button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <Card title="Slots">
          <ul className="space-y-2">
            {S.map((s) => (
              <li key={s.key}>
                <form action={toggleSlot} className="flex items-center justify-between gap-2 rounded-xl bg-lavender px-3 py-2">
                  <Ctx back={back} panel={panel} />
                  <input type="hidden" name="key" value={s.key} /><input type="hidden" name="enabled" value={String(!s.enabled)} />
                  <span className="text-sm"><b>{s.label}</b><span className="block text-xs text-slate">{s.key}</span></span>
                  <button className={`rounded-full px-3 py-1 text-xs font-bold ${s.enabled ? "bg-lime" : "bg-white text-slate"}`}>{s.enabled ? "ON" : "OFF"}</button>
                </form>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Ads">
          <ul className="space-y-2">
            {B.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-lavender px-3 py-2 text-sm">
                <span className="min-w-0">
                  <b>{b.kind === "promo" ? b.title : `AdSense ${b.adsense_slot}`}</b>
                  <span className="block text-xs text-slate">{b.slot_key} · {b.locale ?? "all languages"} · priority {b.priority} · {clickBy.get(b.id) ?? 0} clicks</span>
                </span>
                <span className="flex gap-1">
                  <form action={toggleAdBlock}>
                    <Ctx back={back} panel={panel} /><input type="hidden" name="id" value={b.id} /><input type="hidden" name="enabled" value={String(!b.enabled)} />
                    <button className={`rounded-full px-3 py-1 text-xs font-bold ${b.enabled ? "bg-lime" : "bg-white text-slate"}`}>{b.enabled ? "ON" : "OFF"}</button>
                  </form>
                  <Link href={`${back}?edit=${b.id}`} className="rounded-full bg-white px-3 py-1 text-xs font-semibold">Edit</Link>
                  <form action={deleteAdBlock}>
                    <Ctx back={back} panel={panel} /><input type="hidden" name="id" value={b.id} />
                    <button className={btnDanger.replace("py-1.5", "py-1 text-xs")}>Delete</button>
                  </form>
                </span>
              </li>
            ))}
            {!B.length && <li className="text-sm text-slate">No ads yet. Create one with “New ad”.</li>}
          </ul>
        </Card>
      </div>
    </>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={`block text-xs font-bold uppercase tracking-widest text-slate ${wide ? "md:col-span-2" : ""}`}>{label}<div className="mt-1 font-normal normal-case tracking-normal text-ink">{children}</div></label>;
}
