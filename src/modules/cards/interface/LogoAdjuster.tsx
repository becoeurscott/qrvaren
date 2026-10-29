"use client";

import { useRef, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { DEFAULT_LOGO, LOGO_FITS, type Design, type HeaderLayout } from "../domain/design";
import { logoStyle } from "./CardView";

// Frame the logo the way the page shows it: drag to move, slider to zoom, fill or fit.

const FRAMES: Record<HeaderLayout, { cls: string; style?: CSSProperties }> = {
  classic: { cls: "h-40 w-40 rounded-full" },
  banner: { cls: "h-40 w-40 rounded-full" },
  cutout: { cls: "h-48 w-48 rounded-2xl" },
  shape: { cls: "h-44 w-52", style: { borderRadius: "62% 38% 55% 45% / 48% 58% 42% 52%" } },
  hero: { cls: "h-40 w-56 rounded-2xl" },
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const round = (v: number) => Math.round(v * 100) / 100;

export function LogoAdjuster({ src, logo, layout, background, onChange }: {
  src: string; logo: Design["logo"]; layout: HeaderLayout; background: string;
  onChange: (logo: Design["logo"]) => void;
}) {
  const t = useTranslations("cardEditor.logoAdjust");
  const drag = useRef<{ x: number; y: number; start: Design["logo"] } | null>(null);
  const frame = FRAMES[layout];
  // The cutout layout always shows the whole image, so only zoom and position apply there.
  const fit = layout === "cutout" ? "contain" : logo.fit;
  const set = (p: Partial<Design["logo"]>) => onChange({ ...logo, ...p });

  return (
    <div className="mt-3 rounded-2xl bg-lavender/60 p-4">
      <p className="text-sm font-semibold text-ink">{t("title")}</p>
      <p className="text-xs text-slate">{t("hint")}</p>
      <div className="mt-3 flex justify-center">
        <div
          className={`relative shrink-0 cursor-grab touch-none select-none overflow-hidden ring-2 ring-violet/40 active:cursor-grabbing ${frame.cls}`}
          style={{ background, ...frame.style }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drag.current = { x: e.clientX, y: e.clientY, start: logo };
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d) return;
            const r = e.currentTarget.getBoundingClientRect();
            set({
              x: round(clamp(d.start.x + ((e.clientX - d.x) / r.width) * 100, -100, 100)),
              y: round(clamp(d.start.y + ((e.clientY - d.y) / r.height) * 100, -100, 100)),
            });
          }}
          onPointerUp={() => { drag.current = null; }}
          onPointerCancel={() => { drag.current = null; }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" draggable={false} className="pointer-events-none h-full w-full" style={logoStyle(logo, fit)} />
        </div>
      </div>
      <label className="mt-4 block text-sm font-semibold text-slate">
        <span className="flex justify-between"><span>{t("zoom")}</span><span>{Math.round(logo.zoom * 100)}%</span></span>
        <input type="range" min={0.5} max={3} step={0.05} value={logo.zoom} onChange={(e) => set({ zoom: Number(e.target.value) })} className="mt-2 w-full accent-violet" />
      </label>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {layout !== "cutout" && LOGO_FITS.map((f) => (
          <button key={f} type="button" aria-pressed={logo.fit === f} onClick={() => set({ fit: f })}
            className={`rounded-full bg-white px-4 py-2 text-xs font-bold ring-2 transition ${logo.fit === f ? "ring-violet" : "ring-ink/10 hover:ring-ink/25"}`}>
            {t(f)}
          </button>
        ))}
        <button type="button" onClick={() => onChange(DEFAULT_LOGO)} className="ml-auto text-sm underline">{t("reset")}</button>
      </div>
    </div>
  );
}
