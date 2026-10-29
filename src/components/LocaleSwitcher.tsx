"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, routing } from "@/i18n/routing";

// Each language named in itself, so a visitor finds theirs whatever the page language.
const NAMES: Record<string, string> = { en: "English", es: "Español", fr: "Français" };

/** Language menu styled like the nav pill. `up` opens it above the button (mobile menu, at the bottom of the screen). */
export function LocaleSwitcher({ current, up = false }: { current: string; up?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", close); };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={`Language: ${NAMES[current] ?? current}`}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold uppercase transition hover:bg-white/20">
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
        </svg>
        {current}
        <span aria-hidden className={`text-[10px] transition ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && (
        <ul role="listbox" aria-label="Language"
          className={`absolute z-[70] min-w-40 overflow-hidden rounded-2xl bg-white p-1.5 text-ink shadow-xl ring-4 ring-violet/30 ${up ? "bottom-full left-0 mb-2" : "right-0 top-full mt-3"}`}>
          {routing.locales.map((l) => (
            <li key={l}>
              <button type="button" role="option" aria-selected={l === current} lang={l}
                onClick={() => { setOpen(false); if (l !== current) router.replace(pathname, { locale: l }); }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${l === current ? "bg-lavender" : "hover:bg-lavender/60"}`}>
                <span className="w-6 text-xs font-bold uppercase text-violet">{l}</span>
                <span className="flex-1">{NAMES[l] ?? l}</span>
                {l === current && <span aria-hidden className="text-violet">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
