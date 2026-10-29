"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  BG_TYPES, BUTTON_RADII, BUTTON_STYLES, FONTS, HEADER_LAYOUTS, PRESET_IDS, backgroundCss, presetDesign,
  type Design, type HeaderLayout,
} from "../domain/design";
import type { MediaRef } from "../domain/card";
import { buttonStyle } from "./CardView";
import { FONT_LABELS, fontFamily, pageFontVars } from "./fonts";

type Panel = "theme" | "header" | "bg" | "buttons" | "text" | "colors";

/** Look of the page: preset themes, then every part customisable. Edits mark the theme "custom". */
export function DesignEditor({ theme, design, onChange, upload }: {
  theme: string; design: Design;
  onChange: (theme: string, design: Design) => void;
  upload: (file: File) => Promise<MediaRef>;
}) {
  const t = useTranslations("cardEditor.design");
  const [open, setOpen] = useState<Panel | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const edit = (patch: (d: Design) => Design) => onChange("custom", patch(design));
  const setHeader = (p: Partial<Design["header"]>) => edit((d) => ({ ...d, header: { ...d.header, ...p } }));
  const setBg = (p: Partial<Design["bg"]>) => edit((d) => ({ ...d, bg: { ...d.bg, ...p } }));
  const setButtons = (p: Partial<Design["buttons"]>) => edit((d) => ({ ...d, buttons: { ...d.buttons, ...p } }));
  async function pickImage(kind: "logo" | "bg", file?: File) {
    if (!file) return;
    setBusy(kind);
    try {
      const m = await upload(file);
      if (kind === "logo") setHeader({ title: "logo", title_logo_url: m.url, title_logo_key: m.key });
      else setBg({ type: "image", image_url: m.url, image_key: m.key });
    } catch { /* the editor shows its own upload error on save */ } finally { setBusy(null); }
  }

  const row = (id: Panel, label: string, value: string, swatch: ReactNode) => (
    <button type="button" onClick={() => setOpen(open === id ? null : id)} aria-expanded={open === id}
      className="flex w-full items-center gap-3 rounded-2xl bg-white px-3 py-3 text-left ring-1 ring-ink/10 transition hover:ring-ink/25">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl ring-1 ring-ink/10">{swatch}</span>
      <span className="flex-1 font-semibold">{label}</span>
      <span className="text-sm text-slate">{value}</span>
      <span aria-hidden className={`text-slate transition ${open === id ? "rotate-90" : ""}`}>›</span>
    </button>
  );
  const chip = (on: boolean) => `rounded-2xl p-2 text-center text-xs font-bold ring-2 transition ${on ? "ring-violet" : "ring-ink/10 hover:ring-ink/25"}`;
  const body = "mt-2 space-y-4 rounded-2xl bg-lavender/60 p-4";

  return (
    <div className={`${pageFontVars} space-y-2`}>
      {row("theme", t("theme"), theme === "custom" ? t("custom") : t(`presets.${theme}` as never),
        <span className="h-full w-full" style={{ background: backgroundCss(design.bg) }}><span className="m-2 block h-3 rounded" style={{ background: design.buttons.color }} /></span>)}
      {open === "theme" && (
        <div className={`${body} grid grid-cols-2 gap-3 space-y-0 sm:grid-cols-4`}>
          {PRESET_IDS.map((id) => {
            const p = presetDesign(id);
            return (
              <button key={id} type="button" aria-pressed={theme === id}
                onClick={() => onChange(id, { ...p, header: { ...p.header, title: design.header.title, title_logo_url: design.header.title_logo_url, title_logo_key: design.header.title_logo_key } })}
                className={`overflow-hidden rounded-2xl text-left ring-2 transition ${theme === id ? "ring-violet" : "ring-transparent hover:ring-ink/20"}`}>
                <span className="flex h-24 flex-col items-center justify-center gap-1.5 px-3" style={{ background: backgroundCss(p.bg), color: p.text }}>
                  <span className="text-lg uppercase leading-none" style={{ fontFamily: fontFamily(p.header.title_font ?? p.font) }}>Aa</span>
                  <span className="block h-3 w-full" style={buttonStyle(p)} />
                  <span className="block h-3 w-full" style={buttonStyle(p)} />
                </span>
                <span className="block bg-white px-3 py-2 text-xs font-bold">{t(`presets.${id}` as never)}</span>
              </button>
            );
          })}
        </div>
      )}

      {row("header", t("header"), t(`layouts.${design.header.layout}`), <LayoutSketch layout={design.header.layout} />)}
      {open === "header" && (
        <div className={body}>
          <Field label={t("layout")}>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {HEADER_LAYOUTS.map((l) => (
                <button key={l} type="button" aria-pressed={design.header.layout === l} onClick={() => setHeader({ layout: l })} className={`${chip(design.header.layout === l)} bg-white`}>
                  <span className="mx-auto mb-1 flex h-12 w-12 items-center justify-center"><LayoutSketch layout={l} /></span>{t(`layouts.${l}`)}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate">{t(`layoutHint.${design.header.layout}`)}</p>
          </Field>
          <Field label={t("titleStyle")}>
            <div className="flex flex-wrap items-center gap-2">
              {(["text", "logo"] as const).map((k) => (
                <button key={k} type="button" aria-pressed={design.header.title === k} onClick={() => setHeader({ title: k })}
                  className={`${chip(design.header.title === k)} min-w-24 bg-white px-4`}>{t(`title.${k}`)}</button>
              ))}
              {design.header.title === "logo" && (
                <label className="cursor-pointer rounded-full bg-lime px-4 py-2 text-sm font-semibold">
                  {busy === "logo" ? "…" : design.header.title_logo_url ? t("change") : t("uploadLogo")}
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => pickImage("logo", e.target.files?.[0])} />
                </label>
              )}
            </div>
          </Field>
          {design.header.title === "text" && (
            <>
              <Field label={t("titleFont")}>
                <FontPicker value={design.header.title_font ?? null} allowSame sameLabel={t("samePage")} onChange={(f) => setHeader({ title_font: f })} />
              </Field>
              <Color label={t("titleColor")} value={design.header.title_color ?? design.text} onChange={(v) => setHeader({ title_color: v })} />
            </>
          )}
        </div>
      )}

      {row("bg", t("bg"), t(`bgTypes.${design.bg.type}`), <span className="h-full w-full" style={{ background: backgroundCss(design.bg) }} />)}
      {open === "bg" && (
        <div className={body}>
          <div className="grid grid-cols-3 gap-2">
            {BG_TYPES.map((k) => (
              <button key={k} type="button" aria-pressed={design.bg.type === k} onClick={() => setBg({ type: k })} className={`${chip(design.bg.type === k)} bg-white`}>
                <span className="mx-auto mb-1 block h-8 w-8 rounded-lg" style={{ background: backgroundCss({ ...design.bg, type: k, image_url: k === "image" ? design.bg.image_url : null }) }} />
                {t(`bgTypes.${k}`)}
              </button>
            ))}
          </div>
          <Color label={design.bg.type === "gradient" ? t("from") : t("color")} value={design.bg.color} onChange={(v) => setBg({ color: v })} />
          {design.bg.type === "gradient" && (
            <>
              <Color label={t("to")} value={design.bg.color2} onChange={(v) => setBg({ color2: v })} />
              <Range label={t("angle")} min={0} max={360} step={15} value={design.bg.angle} suffix="°" onChange={(v) => setBg({ angle: v })} />
            </>
          )}
          {design.bg.type === "image" && (
            <>
              <label className="inline-block cursor-pointer rounded-full bg-lime px-4 py-2 text-sm font-semibold">
                {busy === "bg" ? "…" : design.bg.image_url ? t("change") : t("uploadImage")}
                <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => pickImage("bg", e.target.files?.[0])} />
              </label>
              <Range label={t("dim")} min={0} max={0.8} step={0.05} value={design.bg.dim} format={(v) => `${Math.round(v * 100)}%`} onChange={(v) => setBg({ dim: v })} />
            </>
          )}
        </div>
      )}

      {row("buttons", t("buttons"), t(`buttonStyles.${design.buttons.style}`), <span className="h-4 w-7" style={buttonStyle(design)} />)}
      {open === "buttons" && (
        <div className={body}>
          <Field label={t("style")}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {BUTTON_STYLES.map((k) => (
                <button key={k} type="button" aria-pressed={design.buttons.style === k} onClick={() => setButtons({ style: k })}
                  className={`${chip(design.buttons.style === k)}`} style={{ background: backgroundCss(design.bg), color: design.text }}>
                  <span className="mx-auto mb-1.5 block h-7 w-full" style={buttonStyle({ ...design, buttons: { ...design.buttons, style: k } })} />
                  {t(`buttonStyles.${k}`)}
                </button>
              ))}
            </div>
          </Field>
          <Field label={t("corners")}>
            <div className="grid grid-cols-3 gap-2">
              {BUTTON_RADII.map((k) => (
                <button key={k} type="button" aria-pressed={design.buttons.radius === k} onClick={() => setButtons({ radius: k })} className={`${chip(design.buttons.radius === k)} bg-white`}>
                  <span className="mx-auto mb-1 block h-6 w-14 border-2 border-ink" style={{ borderRadius: k === "square" ? 4 : k === "rounded" ? 10 : 999 }} />
                  {t(`radii.${k}`)}
                </button>
              ))}
            </div>
          </Field>
          <Color label={t("buttonColor")} value={design.buttons.color} onChange={(v) => setButtons({ color: v })} />
          {design.buttons.style !== "outline" && <Color label={t("buttonText")} value={design.buttons.text} onChange={(v) => setButtons({ text: v })} />}
        </div>
      )}

      {row("text", t("text"), FONT_LABELS[design.font], <span className="text-lg font-bold" style={{ fontFamily: fontFamily(design.font) }}>Aa</span>)}
      {open === "text" && (
        <div className={body}>
          <Field label={t("font")}><FontPicker value={design.font} onChange={(f) => edit((d) => ({ ...d, font: f ?? d.font }))} /></Field>
          <Color label={t("textColor")} value={design.text} onChange={(v) => edit((d) => ({ ...d, text: v }))} />
          <Color label={t("mutedColor")} value={design.muted} onChange={(v) => edit((d) => ({ ...d, muted: v }))} />
        </div>
      )}

      {row("colors", t("colors"), "", (
        <span className="flex h-full w-full">{[design.bg.color, design.panel, design.accent].map((c, i) => <span key={i} className="flex-1" style={{ background: c }} />)}</span>
      ))}
      {open === "colors" && (
        <div className={body}>
          <Color label={t("accent")} value={design.accent} onChange={(v) => edit((d) => ({ ...d, accent: v }))} />
          <Color label={t("panel")} value={design.panel} onChange={(v) => edit((d) => ({ ...d, panel: v }))} />
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><p className="mb-2 text-sm font-semibold text-slate">{label}</p>{children}</div>;
}

function Color({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-semibold text-slate">{label}</span>
      <span className="flex items-center gap-2 rounded-2xl bg-white px-2 py-1.5 ring-1 ring-ink/10">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}
          className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0" />
        <input value={draft ?? value.toUpperCase()} maxLength={7} aria-label={`${label} (hex)`} spellCheck={false}
          className="w-20 font-mono text-sm uppercase outline-none"
          onChange={(e) => { setDraft(e.target.value); if (/^#[0-9a-f]{6}$/i.test(e.target.value)) onChange(e.target.value.toLowerCase()); }}
          onBlur={() => setDraft(null)} />
      </span>
    </div>
  );
}

function Range({ label, value, onChange, min, max, step, suffix = "", format }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; suffix?: string; format?: (v: number) => string;
}) {
  return (
    <label className="block text-sm font-semibold text-slate">
      <span className="flex justify-between"><span>{label}</span><span>{format ? format(value) : `${value}${suffix}`}</span></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full accent-violet" />
    </label>
  );
}

function FontPicker({ value, onChange, allowSame, sameLabel }: {
  value: Design["font"] | null; onChange: (f: Design["font"] | null) => void; allowSame?: boolean; sameLabel?: string;
}) {
  const opt = (on: boolean) => `rounded-2xl bg-white px-3 py-2 text-left ring-2 transition ${on ? "ring-violet" : "ring-ink/10 hover:ring-ink/25"}`;
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {allowSame && <button type="button" aria-pressed={value === null} onClick={() => onChange(null)} className={`${opt(value === null)} text-sm font-semibold`}>{sameLabel}</button>}
      {FONTS.map((f) => (
        <button key={f} type="button" aria-pressed={value === f} onClick={() => onChange(f)} className={opt(value === f)}>
          <span className="block text-xl leading-tight" style={{ fontFamily: fontFamily(f) }}>Aa Bb</span>
          <span className="text-xs text-slate">{FONT_LABELS[f]}</span>
        </button>
      ))}
    </div>
  );
}

/** Tiny wireframe of a header layout. */
export function LayoutSketch({ layout }: { layout: HeaderLayout }) {
  const face = "bg-sun";
  return (
    <span className="relative block h-10 w-10 overflow-hidden rounded-md bg-white ring-1 ring-ink/10">
      {layout === "hero" && <span className={`absolute inset-x-0 top-0 h-6 ${face}`} />}
      {layout === "banner" && <span className="absolute inset-x-0 top-0 h-4 bg-violet" />}
      {layout === "classic" && <span className={`absolute left-1/2 top-1.5 h-4 w-4 -translate-x-1/2 rounded-full ${face}`} />}
      {layout === "banner" && <span className={`absolute left-1/2 top-2 h-4 w-4 -translate-x-1/2 rounded-full border border-white ${face}`} />}
      {layout === "cutout" && <span className={`absolute left-1/2 top-1 h-6 w-4 -translate-x-1/2 rounded-t-full ${face}`} />}
      {layout === "shape" && <span className={`absolute left-1/2 top-1 h-5 w-6 -translate-x-1/2 ${face}`} style={{ borderRadius: "62% 38% 55% 45% / 48% 58% 42% 52%" }} />}
      <span className="absolute inset-x-2 bottom-2 h-1 rounded-full bg-ink/30" />
      <span className="absolute inset-x-3 bottom-4 h-1 rounded-full bg-ink/20" />
    </span>
  );
}
