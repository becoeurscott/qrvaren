import Link from "next/link";
import { requireAdmin, ROLE_LABEL, type Role } from "../_lib/admin";
import { btn, Card, Flash, input, PageHead } from "../_lib/ui";

type User = { id: string; email: string | null; name: string | null; created_at: string; role: Role | null; suspended: boolean; total: number };
type Props = { params: Promise<{ locale: string; panel: string }>; searchParams: Promise<{ ok?: string; error?: string; q?: string; status?: string; page?: string }> };

const PER_PAGE = 50;
const STATUSES = [["", "All"], ["active", "Active"], ["suspended", "Suspended"], ["staff", "Staff"]] as const;

// Accounts, searchable by email, name or id. Reads auth.users through admin_list_users(), which checks permissions.
export default async function UsersPage({ params, searchParams }: Props) {
  const { locale, panel } = await params;
  const sp = await searchParams;
  const { db } = await requireAdmin(panel, "users.read");
  const base = `/${locale}/${panel}/users`;
  const page = Math.max(1, Number(sp.page) || 1);
  const status = STATUSES.some(([v]) => v === sp.status) ? sp.status : "";
  const { data, error } = await db.rpc("admin_list_users", { p_search: sp.q?.trim() || null, p_status: status || null, p_limit: PER_PAGE, p_offset: (page - 1) * PER_PAGE });
  const users = (data ?? []) as User[];
  const total = users[0]?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const link = (o: Record<string, string | number | undefined>) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries({ q: sp.q, status, page, ...o })) if (v && !(k === "page" && v === 1)) q.set(k, String(v));
    return `${base}${q.size ? `?${q}` : ""}`;
  };

  return (
    <>
      <PageHead title="Users" sub={`${total} account${total === 1 ? "" : "s"}`}>
        <form className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={sp.q} placeholder="Email, name or user id…" className={`${input} bg-white`} />
          <button className={btn}>Search</button>
        </form>
      </PageHead>
      <Flash ok={sp.ok} error={sp.error ?? error?.message} />

      <nav className="mb-4 flex flex-wrap gap-1">
        {STATUSES.map(([v, label]) => (
          <Link key={v} href={link({ status: v, page: 1 })} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${status === v ? "bg-ink text-white" : "bg-white hover:bg-violet hover:text-white"}`}>{label}</Link>
        ))}
      </nav>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="text-xs uppercase tracking-widest text-slate"><tr><th className="py-2 pr-4">Account</th><th className="pr-4">Joined</th><th className="pr-4">Role</th><th className="pr-4">Status</th><th /></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-ink/10">
                  <td className="py-3 pr-4"><b>{u.email ?? u.id}</b>{u.name && <span className="block text-xs text-slate">{u.name}</span>}</td>
                  <td className="pr-4 text-slate">{new Date(u.created_at).toLocaleDateString(locale)}</td>
                  <td className="pr-4">{u.role ? <span className="rounded-full bg-violet px-2 py-0.5 text-xs font-bold text-white">{ROLE_LABEL[u.role]}</span> : <span className="text-slate">User</span>}</td>
                  <td className="pr-4">{u.suspended ? <span className="rounded-full bg-coral px-2 py-0.5 text-xs font-bold text-white">Suspended</span> : <span className="rounded-full bg-lime px-2 py-0.5 text-xs font-bold">Active</span>}</td>
                  <td className="text-right"><Link href={`${base}/${u.id}`} className="rounded-full px-3 py-1.5 text-sm font-semibold ring-2 ring-ink/10 hover:bg-lavender">Open →</Link></td>
                </tr>
              ))}
              {!users.length && <tr><td colSpan={5} className="py-6 text-center text-slate">No users match.</td></tr>}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            {page > 1 ? <Link href={link({ page: page - 1 })} className="font-semibold text-violet">← Previous</Link> : <span />}
            <span className="text-slate">Page {page} of {pages}</span>
            {page < pages ? <Link href={link({ page: page + 1 })} className="font-semibold text-violet">Next →</Link> : <span />}
          </div>
        )}
      </Card>
    </>
  );
}
