import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin, ROLE_LABEL, type Role } from "../../_lib/admin";
import { addNote, deleteNote, setRole, setSuspended } from "../../_lib/actions";
import { btn, btnDanger, Card, Ctx, Flash, input } from "../../_lib/ui";

type Detail = {
  id: string; email: string | null; name: string | null; avatar: string | null; email_verified: boolean;
  created_at: string; updated_at: string; role: Role | null;
  suspension: { reason: string; at: string; by: string | null } | null;
};
type Note = { id: number; author: string; body: string; created_at: string };
type Entry = { id: number; action: string; table_name: string; at: string; actor: string | null; after: unknown };
type Props = { params: Promise<{ locale: string; panel: string; id: string }>; searchParams: Promise<{ ok?: string; error?: string }> };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// One account: profile, status, role, internal notes and the admin actions taken on it.
export default async function UserPage({ params, searchParams }: Props) {
  const { locale, panel, id } = await params;
  const sp = await searchParams;
  if (!UUID.test(id)) notFound();
  const { db, can, user: me } = await requireAdmin(panel, "users.read");
  const back = `/${locale}/${panel}/users/${id}`;

  const [{ data }, notes, audit, staff] = await Promise.all([
    db.rpc("admin_get_user", { p_user: id }),
    can("notes") ? db.from("admin_notes").select("id,author,body,created_at").eq("user_id", id).order("created_at", { ascending: false }) : null,
    can("audit") ? db.from("audit_log").select("id,action,table_name,at,actor,after").eq("row_key", id).order("at", { ascending: false }).limit(50) : null,
    db.rpc("admin_list_users", { p_status: "staff", p_limit: 200 }),
  ]);
  const u = data as Detail | null;
  if (!u) notFound();
  const names = new Map(((staff.data ?? []) as { id: string; email: string }[]).map((s) => [s.id, s.email]));
  const self = u.id === me.id;
  const fmt = (d: string) => new Date(d).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });

  return (
    <>
      <Link href={`/${locale}/${panel}/users`} className="text-sm font-semibold text-violet">← All users</Link>
      <div className="mb-6 mt-3 flex flex-wrap items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-violet font-display text-2xl text-lime">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {u.avatar ? <img src={u.avatar} alt="" className="h-full w-full object-cover" /> : (u.name || u.email || "?").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-display text-3xl uppercase md:text-4xl">{u.name || u.email}</h1>
          <p className="flex flex-wrap gap-2 text-sm text-slate">
            {u.email}
            {u.role && <span className="rounded-full bg-violet px-2 py-0.5 text-xs font-bold text-white">{ROLE_LABEL[u.role]}</span>}
            {u.suspension ? <span className="rounded-full bg-coral px-2 py-0.5 text-xs font-bold text-white">Suspended</span> : <span className="rounded-full bg-lime px-2 py-0.5 text-xs font-bold text-ink">Active</span>}
          </p>
        </div>
      </div>
      <Flash ok={sp.ok} error={sp.error} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Profile">
          <dl className="space-y-2 text-sm">
            {[["User id", <code key="id" className="break-all text-xs">{u.id}</code>], ["Joined", fmt(u.created_at)], ["Last updated", fmt(u.updated_at)], ["Email verified", u.email_verified ? "Yes" : "No"]].map(([k, v]) => (
              <div key={String(k)}><dt className="text-xs font-bold uppercase tracking-widest text-slate">{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
          <p className="mt-4 rounded-xl bg-lavender p-3 text-xs text-slate">Business cards, QR resources and subscriptions will appear here once those features exist.</p>
        </Card>

        <Card title="Account status">
          {u.suspension ? (
            <>
              <p className="text-sm">Suspended {fmt(u.suspension.at)}{u.suspension.by && ` by ${u.suspension.by}`}.</p>
              {u.suspension.reason && <p className="mt-2 rounded-xl bg-coral/10 p-3 text-sm">“{u.suspension.reason}”</p>}
              {can("users.suspend") && (
                <form action={setSuspended} className="mt-4">
                  <Ctx back={back} panel={panel} /><input type="hidden" name="user" value={u.id} /><input type="hidden" name="suspend" value="false" />
                  <button className={btn}>Reactivate account</button>
                </form>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-slate">A suspended account is signed out of the site and cannot sign in again until reactivated.</p>
              {can("users.suspend") && !u.role && (
                <form action={setSuspended} className="mt-4 space-y-2">
                  <Ctx back={back} panel={panel} /><input type="hidden" name="user" value={u.id} /><input type="hidden" name="suspend" value="true" />
                  <textarea name="reason" rows={2} maxLength={500} placeholder="Reason (shown in the audit log)" className={input} required />
                  <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="confirm" required /> I want to suspend this account</label>
                  <button className={btnDanger}>Suspend account</button>
                </form>
              )}
              {u.role && <p className="mt-3 text-xs text-slate">Staff accounts can’t be suspended. Remove their role first.</p>}
            </>
          )}
        </Card>

        <Card title="Staff role">
          {can("roles") && !self ? (
            <form action={setRole} className="space-y-2">
              <Ctx back={back} panel={panel} /><input type="hidden" name="user" value={u.id} />
              <select name="role" defaultValue={u.role ?? ""} className={input}>
                <option value="">No staff access (regular user)</option>
                {(Object.keys(ROLE_LABEL) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
              <button className={btn}>Save role</button>
              <ul className="pt-2 text-xs text-slate">
                <li><b>Super admin</b>: everything, including roles.</li>
                <li><b>Admin</b>: analytics, plans, prices, ads, users, audit.</li>
                <li><b>Support</b>: view users and write notes.</li>
                <li><b>Moderator</b>: view, suspend and annotate users.</li>
                <li><b>Analyst</b>: analytics only.</li>
              </ul>
            </form>
          ) : (
            <p className="text-sm text-slate">{self ? "You can’t change your own role." : "Only a super admin can change roles."} Current: <b>{u.role ? ROLE_LABEL[u.role] : "regular user"}</b>.</p>
          )}
        </Card>

        {notes && (
          <Card title="Internal notes" className="lg:col-span-2">
            <form action={addNote} className="mb-4 flex gap-2">
              <Ctx back={back} panel={panel} /><input type="hidden" name="user" value={u.id} />
              <textarea name="body" rows={2} maxLength={4000} placeholder="Visible to staff only…" className={input} required />
              <button className={`${btn} self-end`}>Add</button>
            </form>
            <ul className="space-y-2">
              {((notes.data ?? []) as Note[]).map((n) => (
                <li key={n.id} className="rounded-xl bg-lavender p-3 text-sm">
                  <p className="whitespace-pre-wrap">{n.body}</p>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate">
                    <span>{names.get(n.author) ?? "staff"} · {fmt(n.created_at)}</span>
                    {(n.author === me.id || can("roles")) && (
                      <form action={deleteNote}><Ctx back={back} panel={panel} /><input type="hidden" name="id" value={n.id} /><button className="text-coral hover:underline">Delete</button></form>
                    )}
                  </div>
                </li>
              ))}
              {!notes.data?.length && <li className="text-sm text-slate">No notes yet.</li>}
            </ul>
          </Card>
        )}

        {audit && (
          <Card title="Admin history">
            <ul className="space-y-2 text-sm">
              {((audit.data ?? []) as Entry[]).map((a) => (
                <li key={a.id}>
                  <b>{a.action}</b> <span className="text-slate">{a.table_name}</span>
                  <span className="block text-xs text-slate">{a.actor ? names.get(a.actor) ?? "staff" : "system"} · {fmt(a.at)}</span>
                </li>
              ))}
              {!audit.data?.length && <li className="text-slate">Nothing yet.</li>}
            </ul>
          </Card>
        )}
      </div>
    </>
  );
}
