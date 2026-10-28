"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, usePathname } from "@/i18n/routing";
import { LocaleSwitcher } from "./LocaleSwitcher";

type Item = { href: string; label: string };

// Full-screen menu for small screens; the desktop nav shows the same links inline.
export function MobileMenu({ items, cta, locale, openLabel, closeLabel }: {
  items: Item[]; cta: Item; locale: string; openLabel: string; closeLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", esc);
    return () => { removeEventListener("keydown", esc); document.documentElement.style.overflow = ""; };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? closeLabel : openLabel}
        className="relative z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-lavender text-ink"
      >
        <span className={`absolute h-0.5 w-4 bg-current transition ${open ? "rotate-45" : "-translate-y-1"}`} />
        <span className={`absolute h-0.5 w-4 bg-current transition ${open ? "-rotate-45" : "translate-y-1"}`} />
      </button>

      {mounted && createPortal(
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 flex flex-col bg-violet px-6 pb-10 pt-28 text-white grid-bg transition duration-500 ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav className="flex flex-1 flex-col gap-2">
          {items.map((it, i) => (
            <Link
              key={it.href}
              href={it.href}
              className={`font-display text-5xl uppercase transition duration-500 ${open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
              style={{ transitionDelay: open ? `${100 + i * 60}ms` : "0ms" }}
            >
              {it.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-between gap-4">
          <span className="rounded-full bg-violet-deep px-2 py-1"><LocaleSwitcher current={locale} /></span>
          <Link href={cta.href} className="rounded-full bg-lime px-6 py-3 font-semibold text-ink">{cta.label}</Link>
        </div>
      </div>,
      document.body)}
    </div>
  );
}
