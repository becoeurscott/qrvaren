"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const ITEMS = [
  { href: "", label: "Analytics", icon: "◔", perm: "analytics" },
  { href: "/plans", label: "Plans & features", icon: "▦", perm: "config" },
  { href: "/settings", label: "Settings & prices", icon: "⚙", perm: "config" },
  { href: "/ads", label: "Ads & promos", icon: "✦", perm: "config" },
  { href: "/users", label: "Users & admins", icon: "☺", perm: "users.read" },
  { href: "/audit", label: "Audit log", icon: "≡", perm: "audit" },
];

// Admin navigation: a dark rail on desktop, a collapsible bar on phones.
export function Sidebar({ base, email, brand, role, perms }: { base: string; email: string; brand: string; role: string; perms: string[] }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <aside className="sticky top-0 z-40 bg-ink text-white md:fixed md:inset-y-0 md:left-0 md:w-64">
      <div className="flex items-center justify-between px-5 py-4 md:py-6">
        <div className="font-display text-xl tracking-wide"><span className="text-lime">✺</span> {brand} <span className="ml-1 rounded-full bg-lime px-2 py-0.5 align-middle font-sans text-[10px] font-bold text-ink">ADMIN</span></div>
        <button onClick={() => setOpen(!open)} className="rounded-full px-3 py-1 ring-1 ring-white/30 md:hidden" aria-label="Menu">{open ? "✕" : "☰"}</button>
      </div>
      <nav className={`${open ? "block" : "hidden"} px-3 pb-4 md:block`}>
        {ITEMS.filter((it) => perms.includes(it.perm)).map((it) => {
          const href = base + it.href;
          const active = it.href ? path.startsWith(href) : path === base;
          return (
            <Link key={it.href} href={href} onClick={() => setOpen(false)} className={`mb-1 flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${active ? "bg-violet text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
              <span className={`w-5 text-center ${active ? "text-lime" : ""}`}>{it.icon}</span>{it.label}
            </Link>
          );
        })}
        <div className="mt-6 border-t border-white/10 px-4 pt-4 text-xs text-white/50 md:absolute md:inset-x-3 md:bottom-4">
          <p className="truncate">{email}</p>
          <p className="mt-0.5 font-bold uppercase tracking-widest text-white/70">{role}</p>
          <Link href="/" className="mt-2 inline-block font-semibold text-lime hover:underline">← Back to site</Link>
        </div>
      </nav>
    </aside>
  );
}
