import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "./_lib/admin";
import { PageHead } from "./_lib/ui";

type Row = { k: string | null; n: number };
type Summary = {
  since: string;
  users: { total: number; new: number } | null;
  totals: { pageviews: number; visitors: number; downloads: number; signins: number };
  adClicks: number;
  daily: { day: string; pageviews: number; downloads: number }[];
  pages: Row[]; qrTypes: Row[]; formats: Row[]; referrers: Row[]; devices: Row[]; countries: Row[]; locales: Row[];
  recent: { at: string; name: string; path: string | null; qr_type: string | null; fmt: string | null; device: string | null; country: string | null }[];
};

const RANGES = [7, 30, 90] as const;
const fmt = (n: number) => new Intl.NumberFormat("en").format(n);

// Analytics overview. analytics_summary() also refuses non-admins in the database.
export default async function AdminPage({ params, searchParams }: { params: Promise<{ locale: string; panel: string }>; searchParams: Promise<{ days?: string }> }) {
  const { locale, panel } = await params;
  const { db, can } = await requireAdmin(panel);
  // Roles without analytics start on the users page.
  if (!can("analytics")) redirect(`/${locale}/${panel}/users`);
  const asked = Number((await searchParams).days);
  const days = (RANGES as readonly number[]).includes(asked) ? asked : 30;
  const { data, error } = await db.rpc("analytics_summary", { p_days: days });
  if (error || !data) notFound();
  const s = data as Summary;
  const conv = s.totals.pageviews ? Math.round((s.totals.downloads / s.totals.pageviews) * 1000) / 10 : 0;

  const kpis = [
    { label: "Page views", value: fmt(s.totals.pageviews), tone: "bg-violet text-white grid-bg", accent: "text-lime" },
    { label: "Visitors", value: fmt(s.totals.visitors), tone: "bg-white", accent: "text-slate", note: "opted-in sessions" },
    { label: "QR downloads", value: fmt(s.totals.downloads), tone: "bg-lime", accent: "text-ink", note: `${conv}% of views` },
    { label: "Sign-ins", value: fmt(s.totals.signins), tone: "bg-white", accent: "text-slate" },
    { label: "Users", value: s.users ? fmt(s.users.total) : "—", tone: "bg-ink text-white", accent: "text-lime", note: s.users ? `+${fmt(s.users.new)} in range` : undefined },
    { label: "Ad clicks", value: fmt(s.adClicks), tone: "bg-white", accent: "text-slate" },
  ];

  return (
    <>
      <PageHead title="Analytics" sub={`Since ${new Date(s.since).toLocaleDateString(locale)}`}>
        <nav className="flex gap-1 rounded-full bg-white p-1">
          {RANGES.map((r) => (
            <a key={r} href={`?days=${r}`} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${r === days ? "bg-ink text-white" : "hover:bg-lavender"}`}>{r}d</a>
          ))}
        </nav>
      </PageHead>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className={`rounded-[1.75rem] p-5 ${k.tone}`}>
            <p className={`text-xs font-bold uppercase tracking-widest ${k.accent}`}>{k.label}</p>
            <p className="mt-3 font-display text-4xl">{k.value}</p>
            {k.note && <p className="mt-1 text-xs opacity-70">{k.note}</p>}
          </div>
        ))}
      </div>

      <Daily data={s.daily} />

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Bars title="Top pages" rows={s.pages} />
        <Bars title="QR types downloaded" rows={s.qrTypes} />
        <Bars title="Export formats" rows={s.formats} />
        <Bars title="Referrers" rows={s.referrers} />
        <Bars title="Countries" rows={s.countries} />
        <Bars title="Devices" rows={s.devices} />
        <Bars title="Languages" rows={s.locales} />
      </div>

      <section className="mt-4 overflow-hidden rounded-[1.75rem] bg-white p-6">
        <h2 className="font-display text-xl uppercase tracking-wide">Latest activity</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs uppercase tracking-widest text-slate">
              <tr><th className="py-2 pr-4">When</th><th className="pr-4">Event</th><th className="pr-4">Page</th><th className="pr-4">Detail</th><th className="pr-4">Device</th><th>Country</th></tr>
            </thead>
            <tbody>
              {s.recent.map((r, i) => (
                <tr key={i} className="border-t border-ink/10">
                  <td className="py-2 pr-4 whitespace-nowrap text-slate">{new Date(r.at).toLocaleString(locale, { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="pr-4"><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${r.name === "qr_download" ? "bg-lime" : r.name === "pageview" ? "bg-lavender text-violet" : "bg-pink"}`}>{r.name}</span></td>
                  <td className="pr-4 max-w-[220px] truncate">{r.path ?? "—"}</td>
                  <td className="pr-4">{[r.qr_type, r.fmt].filter(Boolean).join(" · ") || "—"}</td>
                  <td className="pr-4">{r.device ?? "—"}</td>
                  <td>{r.country ?? "—"}</td>
                </tr>
              ))}
              {!s.recent.length && <tr><td colSpan={6} className="py-6 text-center text-slate">No events yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function Daily({ data }: { data: Summary["daily"] }) {
  const max = Math.max(1, ...data.map((d) => d.pageviews));
  return (
    <section className="mt-4 rounded-[1.75rem] bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl uppercase tracking-wide">Daily traffic</h2>
        <div className="flex gap-4 text-xs font-semibold text-slate">
          <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-violet" />Page views</span>
          <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-lime ring-1 ring-ink/20" />Downloads</span>
        </div>
      </div>
      <div className="mt-6 flex h-48 items-end gap-[2px]">
        {data.map((d) => (
          <div key={d.day} className="group relative flex h-full flex-1 items-end" title={`${d.day}: ${d.pageviews} views, ${d.downloads} downloads`}>
            <div className="relative w-full rounded-t-md bg-violet/85 transition group-hover:bg-violet" style={{ height: `${(d.pageviews / max) * 100}%` }}>
              <div className="absolute inset-x-0 bottom-0 rounded-t-md bg-lime" style={{ height: d.pageviews ? `${Math.min(100, (d.downloads / d.pageviews) * 100)}%` : 0 }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate">
        <span>{data[0]?.day}</span><span>{data.at(-1)?.day}</span>
      </div>
    </section>
  );
}

function Bars({ title, rows }: { title: string; rows: Row[] }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <section className="rounded-[1.75rem] bg-white p-6">
      <h2 className="font-display text-xl uppercase tracking-wide">{title}</h2>
      <ul className="mt-4 space-y-2">
        {rows.map((r) => (
          <li key={r.k ?? "?"} className="relative overflow-hidden rounded-xl px-3 py-1.5 text-sm">
            <span className="absolute inset-y-0 left-0 rounded-xl bg-lavender" style={{ width: `${(r.n / max) * 100}%` }} />
            <span className="relative flex justify-between gap-3"><span className="truncate">{r.k ?? "—"}</span><b>{fmt(r.n)}</b></span>
          </li>
        ))}
        {!rows.length && <li className="text-sm text-slate">No data yet.</li>}
      </ul>
    </section>
  );
}
