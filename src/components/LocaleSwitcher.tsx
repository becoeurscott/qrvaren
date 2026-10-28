"use client";

import { usePathname, useRouter, routing } from "@/i18n/routing";

export function LocaleSwitcher({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <select
      aria-label="Language"
      value={current}
      onChange={(e) => router.replace(pathname, { locale: e.target.value })}
      className="rounded-full bg-transparent px-2 py-1 text-sm font-semibold uppercase outline-none [&>option]:text-ink"
    >
      {routing.locales.map((l) => (
        <option key={l} value={l}>{l}</option>
      ))}
    </select>
  );
}
