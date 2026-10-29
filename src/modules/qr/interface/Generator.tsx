"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { QR_TYPES, type QrInput, type QrType, checkCapacity, encode } from "../domain/encoders";
import { readabilityIssues } from "../domain/contrast";
import { FRAME_TEXTS, TEMPLATES, TEMPLATE_KEYS, type TemplateKey } from "../domain/templates";
import { TemplateThumb } from "./TemplateThumb";
import { PRESETS, PRESET_IDS, type Preset, type PresetId } from "../domain/presets";
import { presetIconDataUrl } from "./presetIcons";
import { Link } from "@/i18n/routing";
import { useSession } from "@/shared/useSession";
import { composeSvg, darkTone, download, pngToPdf, shapeImage, svgToPng, type DotShape, type LogoShape, type QrStyle } from "../infrastructure/render";

// Types that need a stored file or hosted page come later (account required).
const NEEDS_ACCOUNT: QrType[] = ["pdf", "card"];
const SWATCHES = ["#17143a", "#5546ff", "#ff5a3c", "#0f766e", "#000000"];
const FRAME_SWATCHES = ["#5546ff", "#17143a", "#ff5a3c", "#ff7bca", "#bfff0a"];

type Fields = Record<string, string>;

function toInput(type: QrType, f: Fields, hidden: boolean): QrInput {
  switch (type) {
    case "url": return { type, url: f.url ?? "" };
    case "text": return { type, text: f.text ?? "" };
    case "wifi": return { type, wifi: { ssid: f.ssid ?? "", password: f.password, encryption: (f.encryption as "WPA") || "WPA", hidden } };
    case "vcard": return { type, vcard: { firstName: f.firstName ?? "", lastName: f.lastName, org: f.org, title: f.title, phone: f.phone, email: f.email, url: f.website, address: f.address } };
    case "email": return { type, email: { to: f.to ?? "", subject: f.subject, body: f.body } };
    case "sms": return { type, sms: { phone: f.phone ?? "", message: f.message } };
    default: return { type, redirectUrl: "" } as QrInput;
  }
}

const FIELDS: Record<QrType, string[]> = {
  url: ["url"],
  text: ["text"],
  wifi: ["ssid", "password"],
  vcard: ["firstName", "lastName", "org", "title", "phone", "email", "website", "address"],
  email: ["to", "subject", "body"],
  sms: ["phone", "message"],
  pdf: [],
  card: [],
};
const MULTILINE = new Set(["text", "body", "message"]);

const LOCAL_NAMES = new Set(["phone", "wifi", "contact"]);

/** Blend two hex colors: t=0 gives a, t=1 gives b. */
function mix(a: string, b: string, t: number) {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("")}`;
}

export function Generator({ initialType = "url", initialPreset, initialFields }: { initialType?: QrType; initialPreset?: PresetId; initialFields?: Record<string, string> }) {
  const t = useTranslations("gen");
  const startPreset = initialPreset ? (PRESETS[initialPreset] as Preset) : undefined;
  const [type, setType] = useState<QrType>(startPreset?.type ?? initialType);
  const [preset, setPreset] = useState<PresetId | null>(initialPreset ?? null);
  const p = preset ? (PRESETS[preset] as Preset) : undefined;
  // Templates without their own QR type build a link from their fields.
  const linkPreset = p && !p.type ? p : undefined;
  const [fields, setFields] = useState<Fields>({ encryption: "WPA", ...initialFields });
  const [hidden, setHidden] = useState(false);
  const [template, setTemplate] = useState<TemplateKey | null>(startPreset ? null : "varen");
  const [captionEdited, setCaptionEdited] = useState(false);
  const [style, setStyle] = useState<QrStyle>(() => ({
    ...(startPreset ? startPreset.style : TEMPLATES.varen),
    logoRatio: 0.22,
    frameText: t(`frameTexts.${startPreset?.caption ?? FRAME_TEXTS[initialType][0]}`),
  }));
  // True while the center logo is the template icon (a template switch may replace it, an upload may not).
  const [presetLogo, setPresetLogo] = useState(!!initialPreset);
  // The user's image (or the template icon), shown in the center in a chosen shape or behind the code.
  const [image, setImage] = useState<string | undefined>(initialPreset ? presetIconDataUrl(initialPreset) : undefined);
  const [imageMode, setImageMode] = useState<"center" | "background">("center");
  const [logoShape, setLogoShape] = useState<LogoShape>("original");
  const [bgStrength, setBgStrength] = useState(0.3);
  const [shaped, setShaped] = useState<string | undefined>(image);
  const [imageDark, setImageDark] = useState("#000000");
  useEffect(() => {
    if (!image || imageMode !== "background") return;
    let live = true;
    darkTone(image).then((c) => live && setImageDark(c)).catch(() => live && setImageDark("#000000"));
    return () => { live = false; };
  }, [image, imageMode]);
  useEffect(() => {
    if (!image || imageMode !== "center") { setShaped(undefined); return; }
    let live = true;
    shapeImage(image, logoShape).then((u) => live && setShaped(u)).catch(() => live && setShaped(image));
    return () => { live = false; };
  }, [image, imageMode, logoShape]);
  const renderStyle = useMemo<QrStyle>(() => ({
    ...style,
    logo: imageMode === "center" ? shaped : undefined,
    bgImage: imageMode === "background" ? image : undefined,
    bgStrength,
  }), [style, imageMode, shaped, image, bgStrength]);
  const [svg, setSvg] = useState<{ svg: string; width: number; height: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const user = useSession();

  const payload = useMemo(
    () => (linkPreset ? linkPreset.build!(fields) : encode(toInput(type, fields, hidden))),
    [linkPreset, type, fields, hidden],
  );
  const capacity = payload ? checkCapacity(payload, renderStyle.logo ? "H" : "M") : null;
  // A background image darkens the area under the modules: check against its dark tones at the chosen intensity.
  const effectiveBg = renderStyle.bgImage ? mix(style.bg, imageDark, bgStrength) : style.bg;
  const issues = readabilityIssues({ fg: style.fg, bg: effectiveBg, extra: [style.fg2, style.eye], logoRatio: renderStyle.logo ? style.logoRatio : 0 });
  const renderable = payload && capacity?.ok;

  useEffect(() => {
    if (!renderable) { setSvg(null); return; }
    let live = true;
    const id = setTimeout(() => composeSvg(payload!, renderStyle).then((r) => live && setSvg(r)), 120);
    return () => { live = false; clearTimeout(id); };
  }, [payload, renderable, renderStyle]);

  const set = (k: string, v: string) => setFields((f) => ({ ...f, [k]: v }));

  // Until the user types their own caption, the frame text follows the QR type (e.g. "FREE WIFI").
  const captionKeys = p ? [p.caption, ...FRAME_TEXTS[p.type ?? "url"].filter((k) => k !== p.caption)].slice(0, 3) : FRAME_TEXTS[type];
  useEffect(() => {
    if (!captionEdited) setStyle((s) => ({ ...s, frameText: t(`frameTexts.${p?.caption ?? FRAME_TEXTS[type][0]}`) }));
  }, [type, p, captionEdited, t]);

  // A use-case template sets the content fields, colors, icon and caption.
  const applyPreset = (id: PresetId) => {
    const next = PRESETS[id] as Preset;
    const useIcon = presetLogo || !image;
    setPreset(id);
    if (next.type) setType(next.type);
    setFields({ encryption: "WPA" });
    setTemplate(null);
    setCaptionEdited(false);
    setStyle((s) => ({ ...s, fg2: undefined, eye: undefined, ...next.style }));
    if (useIcon) { setImage(presetIconDataUrl(id)); setImageMode("center"); }
    setPresetLogo(useIcon);
  };
  const selectType = (k: QrType) => {
    setPreset(null);
    setType(k);
    if (presetLogo) { setImage(undefined); setPresetLogo(false); }
  };

  // A template sets every color and shape at once; logo and caption are kept.
  const applyTemplate = (k: TemplateKey) => {
    const tpl: Partial<QrStyle> = TEMPLATES[k];
    setTemplate(k);
    setStyle((s) => ({ ...s, fg2: undefined, eye: undefined, ...tpl }));
  };
  // Manual edits leave the template; changing the code color drops its gradient and accent.
  const edit = (patch: Partial<QrStyle>) => {
    setTemplate(null);
    setStyle((s) => ({ ...s, ...("fg" in patch ? { fg2: undefined, eye: undefined } : {}), ...patch }));
  };

  async function onLogo(file?: File) {
    setPresetLogo(false);
    if (!file) return setImage(undefined);
    if (!/^image\/(png|jpeg|svg\+xml|webp)$/.test(file.type) || file.size > 1_000_000) return;
    const url = await new Promise<string>((ok) => { const r = new FileReader(); r.onload = () => ok(r.result as string); r.readAsDataURL(file); });
    setImage(url);
  }

  async function exportAs(fmt: "png" | "svg" | "pdf") {
    if (!svg) return;
    setBusy(true);
    try {
      const name = `qr-${preset ?? type}.${fmt}`;
      if (fmt === "svg") return download(new Blob([svg.svg], { type: "image/svg+xml" }), name);
      const png = await svgToPng(svg.svg, svg.width, svg.height);
      download(fmt === "png" ? png : await pngToPdf(png, svg.width, svg.height), name);
      window.dispatchEvent(new CustomEvent("qr:downloaded", { detail: { type: preset ?? type, fmt } }));
    } finally {
      setBusy(false);
    }
  }

  const input = "w-full rounded-2xl border-2 border-ink/10 bg-white px-4 py-3 text-ink outline-none transition focus:border-violet";

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 rounded-[2rem] bg-white p-3 shadow-[0_30px_80px_-30px_rgba(23,20,58,0.35)] sm:p-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:p-6">
      <div className="min-w-0 space-y-6">
        {/* Use-case templates */}
        <section>
          <h3 className="mb-3 font-display text-xl uppercase tracking-wide">{t("presetsTitle")}</h3>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] sm:grid sm:grid-cols-6 sm:overflow-visible lg:grid-cols-8" role="radiogroup" aria-label={t("presetsTitle")}>
            {PRESET_IDS.map((id) => {
              const pr = PRESETS[id] as Preset;
              const name = LOCAL_NAMES.has(id) ? t(`presetNames.${id}`) : pr.brand.replace(" (Twitter)", "");
              return (
                <button key={id} role="radio" aria-checked={preset === id} onClick={() => applyPreset(id)} data-cursor={name}
                  className={`flex w-[4.5rem] shrink-0 flex-col items-center gap-1 rounded-2xl p-1.5 text-[11px] font-semibold transition sm:w-auto ${
                    preset === id ? "bg-violet/10 ring-2 ring-violet" : "hover:bg-lavender"
                  }`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={presetIconDataUrl(id)} alt="" className="aspect-square w-full rounded-xl" />
                  <span className="w-full truncate text-center">{name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Type picker */}
        <p className="text-xs font-bold uppercase tracking-widest text-slate">{t("orType")}</p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible" role="tablist">
          {QR_TYPES.map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={!linkPreset && type === k}
              onClick={() => selectType(k)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                !linkPreset && type === k ? "bg-ink text-white" : "bg-lavender text-ink hover:bg-violet/10"
              }`}
            >
              {t(`types.${k}`)}
            </button>
          ))}
        </div>

        <section>
          <h3 className="mb-3 font-display text-xl uppercase tracking-wide">{t("content")}</h3>
          {linkPreset ? (
            <div className="grid grid-cols-[minmax(0,1fr)] gap-3">
              {linkPreset.fields!.map((f, i) => (
                <label key={f.key} className="text-sm font-semibold">
                  <span className="mb-1 block text-slate">{t(`presetFields.${f.label}`)}</span>
                  {f.kind === "multiline" ? (
                    <textarea rows={3} className={input} value={fields[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
                  ) : (
                    <input className={input} value={fields[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} autoFocus={i === 0}
                      type={f.kind === "tel" ? "tel" : f.kind === "url" ? "url" : "text"} inputMode={f.kind === "tel" ? "tel" : undefined}
                      placeholder={f.label === "username" ? "@yourname" : f.kind === "tel" ? "+1 555 010 2030" : f.kind === "url" ? "https://" : undefined} />
                  )}
                </label>
              ))}
            </div>
          ) : NEEDS_ACCOUNT.includes(type) ? (
            <div className="rounded-2xl bg-sun/40 p-4 font-medium">
              <p>{user ? t("accountReady") : t("account")}</p>
              <Link href={user ? "/dashboard" : "/login"} className="mt-3 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
                {user ? t("goDashboard") : t("signIn")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
              {type === "wifi" && (
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold sm:col-span-2">
                  {t("fields.encryption")}
                  {(["WPA", "WEP", "nopass"] as const).map((e) => (
                    <button key={e} onClick={() => set("encryption", e)}
                      className={`rounded-full px-3 py-1 ${fields.encryption === e ? "bg-violet text-white" : "bg-lavender"}`}>
                      {e === "nopass" ? "—" : e}
                    </button>
                  ))}
                  <span className="ml-auto flex items-center gap-2 whitespace-nowrap">
                    <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} /> {t("fields.hidden")}
                  </span>
                </div>
              )}
              {FIELDS[type]
                .filter((k) => !(type === "wifi" && k === "password" && fields.encryption === "nopass"))
                .map((k) => (
                  <label key={k} className={`text-sm font-semibold ${FIELDS[type].length === 1 || MULTILINE.has(k) ? "sm:col-span-2" : ""}`}>
                    <span className="mb-1 block text-slate">{t(`fields.${k}`)}</span>
                    {MULTILINE.has(k) ? (
                      <textarea rows={3} className={input} value={fields[k] ?? ""} onChange={(e) => set(k, e.target.value)} />
                    ) : (
                      <input className={input} value={fields[k] ?? ""} onChange={(e) => set(k, e.target.value)}
                        type={k === "password" ? "text" : k === "email" || k === "to" ? "email" : k === "phone" ? "tel" : "text"}
                        placeholder={k === "url" ? "https://" : undefined} autoFocus={k === FIELDS[type][0]} />
                    )}
                  </label>
                ))}
            </div>
          )}
        </section>

        <section>
          <h3 className="mb-3 font-display text-xl uppercase tracking-wide">{t("templatesTitle")}</h3>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] sm:grid sm:grid-cols-4 sm:overflow-visible lg:grid-cols-6" role="radiogroup" aria-label={t("templatesTitle")}>
            {TEMPLATE_KEYS.map((k) => (
              <button key={k} role="radio" aria-checked={template === k} onClick={() => applyTemplate(k)}
                className={`group flex w-20 shrink-0 flex-col items-center gap-1.5 rounded-2xl p-1.5 text-xs font-semibold transition sm:w-auto ${
                  template === k ? "bg-violet/10 ring-2 ring-violet" : "hover:bg-lavender"
                }`}>
                <TemplateThumb tpl={TEMPLATES[k]} />
                <span className="truncate">{t(`templates.${k}`)}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-display text-xl uppercase tracking-wide">{t("design")}</h3>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
            <ColorRow label={t("fg")} value={style.fg} swatches={SWATCHES} onChange={(fg) => edit({ fg })} />
            <ColorRow label={t("bg")} value={style.bg} swatches={["#ffffff", "#f3f1ff", "#fff7d6", "#e8fbff"]} onChange={(bg) => edit({ bg })} />
            <div className="sm:col-span-2">
              <span className="mb-1 block text-sm font-semibold text-slate">{t("dots")}</span>
              <div className="flex flex-wrap gap-2">
                {(["square", "dots", "rounded", "classy"] as DotShape[]).map((d) => (
                  <button key={d} onClick={() => edit({ dots: d })}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${style.dots === d ? "bg-violet text-white" : "bg-lavender"}`}>
                    {t(`shapes.${d}`)}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <span className="mb-1 block text-sm font-semibold text-slate">{t("image")}</span>
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="w-full min-w-0 max-w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-lime file:px-4 file:py-2 file:font-semibold sm:w-auto"
                  onChange={(e) => onLogo(e.target.files?.[0])} />
                {image && <button className="text-sm underline" onClick={() => onLogo()}>{t("removeLogo")}</button>}
              </div>
              {image && (
                <div className="mt-3 space-y-3 rounded-2xl bg-lavender p-3">
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("imagePlacement")}>
                    {(["center", "background"] as const).map((m) => (
                      <button key={m} role="radio" aria-checked={imageMode === m} onClick={() => setImageMode(m)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold ${imageMode === m ? "bg-ink text-white" : "bg-white"}`}>
                        {t(`imageModes.${m}`)}
                      </button>
                    ))}
                  </div>
                  {imageMode === "center" ? (
                    <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label={t("imageShape")}>
                      {(["original", "square", "rounded", "circle"] as LogoShape[]).map((sh) => (
                        <button key={sh} role="radio" aria-checked={logoShape === sh} onClick={() => setLogoShape(sh)} title={t(`imageShapes.${sh}`)}
                          className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${logoShape === sh ? "bg-violet text-white" : "bg-white"}`}>
                          <span aria-hidden className={`inline-block h-4 w-4 border-2 border-current ${
                            sh === "circle" ? "rounded-full" : sh === "rounded" ? "rounded-[5px]" : sh === "square" ? "" : "rounded-sm border-dashed"
                          }`} />
                          {t(`imageShapes.${sh}`)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <label className="block text-sm font-semibold text-slate">
                      {t("imageStrength")} · {Math.round(bgStrength * 100)}%
                      <input type="range" min={10} max={60} step={5} value={Math.round(bgStrength * 100)}
                        onChange={(e) => setBgStrength(Number(e.target.value) / 100)} className="mt-1 w-full accent-violet" />
                    </label>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate">
                <input type="checkbox" checked={style.frame} onChange={(e) => edit({ frame: e.target.checked })} />
                {t("frame")}
              </label>
              {style.frame && (
                <div className="mt-2 space-y-2">
                  <input className={input} maxLength={20} aria-label={t("frameText")} value={style.frameText}
                    onChange={(e) => { setCaptionEdited(true); setStyle((s) => ({ ...s, frameText: e.target.value })); }} />
                  <div className="flex flex-wrap gap-1.5" aria-label={t("frameSuggestions")}>
                    {captionKeys.map((key) => {
                      const text = t(`frameTexts.${key}`);
                      return (
                        <button key={key} onClick={() => { setCaptionEdited(true); setStyle((s) => ({ ...s, frameText: text })); }}
                          className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide ${style.frameText === text ? "bg-ink text-white" : "bg-lavender text-ink"}`}>
                          {text}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {FRAME_SWATCHES.map((c) => (
                      <button key={c} aria-label={c} onClick={() => edit({ frameColor: c })}
                        className={`h-7 w-7 rounded-full ring-2 ${style.frameColor === c ? "ring-ink" : "ring-transparent"}`} style={{ background: c }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Preview */}
      <div className="order-first flex flex-col gap-4 rounded-[1.5rem] bg-violet p-4 grid-bg sm:p-5 md:order-none md:sticky md:top-24 md:self-start">
        <div className="mx-auto flex aspect-square w-full max-w-[min(100%,46vh)] items-center justify-center rounded-2xl bg-white/10 p-3 sm:p-4 md:max-w-none">
          {svg ? (
            <div className="flex h-full w-full items-center justify-center [&>svg]:h-auto [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:max-w-full" data-testid="qr-preview" dangerouslySetInnerHTML={{ __html: svg.svg }} />
          ) : (
            <p className="max-w-[16rem] text-center font-medium text-white/90">
              {capacity && !capacity.ok ? t("tooLong", { bytes: capacity.bytes }) : t("empty")}
            </p>
          )}
        </div>
        {issues.map((i) => (
          <p key={i} className="rounded-xl bg-sun px-3 py-2 text-sm font-semibold text-ink">
            {t(i === "low_contrast" ? "lowContrast" : i === "inverted" ? "inverted" : "logoTooBig")}
          </p>
        ))}
        {svg && <p className="text-center text-sm font-semibold text-lime">✓ {t("neverExpires")}</p>}
        <div className="grid grid-cols-3 gap-2">
          {(["png", "svg", "pdf"] as const).map((f) => (
            <button key={f} disabled={!svg || busy} onClick={() => exportAs(f)}
              className="flex min-w-0 items-center justify-center gap-1.5 rounded-full bg-white px-2 py-3 text-sm font-bold text-ink shadow-sm transition hover:bg-lime active:scale-95 disabled:bg-white/15 disabled:text-white/70 disabled:shadow-none disabled:ring-1 disabled:ring-white/25 disabled:hover:bg-white/15 sm:text-base">
              <span aria-hidden>↓</span>{f.toUpperCase()}
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-white/70">{t("download")} · PNG · SVG · PDF</p>
      </div>
    </div>
  );
}

function ColorRow({ label, value, swatches, onChange }: { label: string; value: string; swatches: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <span className="mb-1 block text-sm font-semibold text-slate">{label}</span>
      <div className="flex flex-wrap items-center gap-2">
        {swatches.map((c) => (
          <button key={c} aria-label={c} onClick={() => onChange(c)}
            className={`h-8 w-8 rounded-full border border-ink/10 ring-2 ${value === c ? "ring-violet" : "ring-transparent"}`} style={{ background: c }} />
        ))}
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-10 cursor-pointer rounded" aria-label={label} />
      </div>
    </div>
  );
}
