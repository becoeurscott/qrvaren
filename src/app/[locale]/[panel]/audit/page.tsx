import { requireAdmin } from "../_lib/admin";
import { Card, PageHead, type AdminProps } from "../_lib/ui";

type Entry = { id: number; actor: string | null; table_name: string; action: string; row_key: string | null; before: unknown; after: unknown; at: string };

// Every configuration change, newest first, with the before / after values.
export default async function AuditPage({ params }: AdminProps) {
  const { locale, panel } = await params;
  const { db } = await requireAdmin(panel, "audit");
  const [{ data }, users] = await Promise.all([
    db.from("audit_log").select("*").order("at", { ascending: false }).limit(200),
    db.rpc("admin_list_users", { p_limit: 200 }),
  ]);
  const email = new Map(((users.data ?? []) as { id: string; email: string }[]).map((u) => [u.id, u.email]));
  const rows = (data ?? []) as Entry[];
  const tone: Record<string, string> = { INSERT: "bg-lime", UPDATE: "bg-sky", DELETE: "bg-coral/20 text-coral", GRANT: "bg-violet text-white", REVOKE: "bg-pink", ROLE: "bg-violet text-white", SUSPEND: "bg-coral text-white", REACTIVATE: "bg-lime" };

  return (
    <>
      <PageHead title="Audit log" sub="Last 200 changes" />
      <Card>
        <ul className="divide-y divide-ink/10">
          {rows.map((r) => (
            <li key={r.id} className="py-3 text-sm">
              <details>
                <summary className="flex cursor-pointer flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${tone[r.action] ?? "bg-lavender"}`}>{r.action}</span>
                  <b>{r.table_name}</b><span className="text-slate">{r.row_key}</span>
                  <span className="ml-auto text-xs text-slate">{r.actor ? email.get(r.actor) ?? "admin" : "system"} · {new Date(r.at).toLocaleString(locale)}</span>
                </summary>
                {(r.before != null || r.after != null) && (
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <pre className="overflow-x-auto rounded-xl bg-lavender p-3 text-xs">{JSON.stringify(r.before, null, 2) ?? "—"}</pre>
                    <pre className="overflow-x-auto rounded-xl bg-lime/30 p-3 text-xs">{JSON.stringify(r.after, null, 2) ?? "—"}</pre>
                  </div>
                )}
              </details>
            </li>
          ))}
          {!rows.length && <li className="py-6 text-center text-slate">No changes yet.</li>}
        </ul>
      </Card>
    </>
  );
}
