"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { QR_TYPES, type QrInput, type QrType, checkCapacity, encode } from "../domain/encoders";
import { readabilityIssues } from "../domain/contrast";
import { FRAME_TEXTS, TEMPLATES, TEMPLATE_KEYS, type TemplateKey } from "../domain/templates";
import { TemplateThumb } from "./TemplateThumb";
import { Link } from "@/i18n/routing";
import { useSession } from "@/shared/useSession";
import { composeSvg, download, pngToPdf, svgToPng, type DotShape, type QrStyle } from "../infrastructure/render";

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

export function Generator({ initialType = "url" }: { initialType?: QrType }) {
  const t = useTranslations("gen");
  const [type, setType] = useState<QrType>(initialType);
  const [fields, setFields] = useState<Fields>({ encryption: "WPA" });
  const [hidden, setHidden] = useState(false);
  const [template, setTemplate] = useState<TemplateKey | null>("varen");
  const [captionEdited, setCaptionEdited] = useState(false);
  const [style, setStyle] = useState<QrStyle>({
    ...TEMPLATES.varen, logoRatio: 0.22, frameText: t(`frameTexts.${FRAME_TEXTS[initialType][0]}`),
  });
  const [svg, setSvg] = useState<{ svg: string; width: number; height: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const user = useSession();

  const payload = useMemo(() => encode(toInput(type, fields, hidden)), [type, fields, hidden]);
  const capacity = payload ? checkCapacity(payload, style.logo ? "H" : "M") : null;
  const issues = readabilityIssues({ fg: style.fg, bg: style.bg, extra: [style.fg2, style.eye], logoRatio: style.logo ? style.logoRatio : 0 });
  const renderable = payload && capacity?.ok;

  useEffect(() => {
    if (!renderable) { setSvg(null); return; }
    let live = true;
    const id = setTimeout(() => composeSvg(payload!, style).then((r) => live && setSvg(r)), 120);
    return () => { live = false; clearTimeout(id); };
  }, [payload, renderable, style]);

  const set = (k: string, v: string) => setFields((f) => ({ ...f, [k]: v }));

  // Until the user types their own caption, the frame text follows the QR type (e.g. "FREE WIFI").
  useEffect(() => {
    if (!captionEdited) setStyle((s) => ({ ...s, frameText: t(`frameTexts.${FRAME_TEXTS[type][0]}`) }));
  }, [type, captionEdited, t]);

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
    if (!file) return setStyle((s) => ({ ...s, logo: undefined }));
    if (!/^image\/(png|jpeg|svg\+xml|webp)$/.test(file.type) || file.size > 1_000_000) return;
    const url = await new Promise<string>((ok) => { const r = new FileReader(); r.onload = () => ok(r.result as string); r.readAsDataURL(file); });
    setStyle((s) => ({ ...s, logo: url }));
  }

  async function exportAs(fmt: "png" | "svg" | "pdf") {
    if (!svg) return;
    setBusy(true);
    try {
      const name = `qr-${type}.${fmt}`;
      if (fmt === "svg") return download(new Blob([svg.svg], { type: "image/svg+xml" }), name);
      const png = await svgToPng(svg.svg, svg.width, svg.height);
      download(fmt === "png" ? png : await pngToPdf(png, svg.width, svg.height), name);
      window.dispatchEvent(new CustomEvent("qr:downloaded", { detail: { type, fmt } }));
    } finally {
      setBusy(false);
    }
  }

  const input = "w-full rounded-2xl border-2 border-ink/10 bg-white px-4 py-3 text-ink outline-none transition focus:border-violet";

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 rounded-[2rem] bg-white p-3 shadow-[0_30px_80px_-30px_rgba(23,20,58,0.35)] sm:p-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:p-6">
      <div className="min-w-0 space-y-6">
        {/* Type picker */}
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible" role="tablist">
          {QR_TYPES.map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={type === k}
              onClick={() => setType(k)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                type === k ? "bg-ink text-white" : "bg-lavender text-ink hover:bg-violet/10"
              }`}
            >
              {t(`types.${k}`)}
            </button>
          ))}
        </div>

        <section>
          <h3 className="mb-3 font-display text-xl uppercase tracking-wide">{t("content")}</h3>
          {NEEDS_ACCOUNT.includes(type) ? (
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
            <div>
              <span className="mb-1 block text-sm font-semibold text-slate">{t("logo")}</span>
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="w-full min-w-0 max-w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-lime file:px-4 file:py-2 file:font-semibold"
                  onChange={(e) => onLogo(e.target.files?.[0])} />
                {style.logo && <button className="text-sm underline" onClick={() => onLogo()}>{t("removeLogo")}</button>}
              </div>
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
                    {FRAME_TEXTS[type].map((key) => {
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
              className="min-w-0 rounded-full bg-white px-2 py-3 text-sm font-semibold text-ink transition hover:bg-lime disabled:opacity-40 sm:text-base">
              {f.toUpperCase()}
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
