"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { useTranslations } from "next-intl";
import { download } from "@/modules/qr/infrastructure/render";
import {
  FONTS, SAFE, SIZES, TEMPLATE_IDS, applyQrSource, bounds, newQr, outsideSafe, resize, sideSvg, template, uid,
  type Design, type El, type FontId, type Info, type QrSource, type SizeId, type TemplateId,
} from "../domain/design";
import { cardPdf, qrDataUrl, sheetPdf, toDataUrl } from "./exportPdf";

const STORE = "qrv.print.v1";
const svgUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/** Finds a QR code in a picture where the browser can (Chrome, Android); null when it can't tell. */
async function hasQrCode(src: string): Promise<boolean | null> {
  const Detector = (globalThis as { BarcodeDetector?: new (o: { formats: string[] }) => { detect: (i: ImageBitmapSource) => Promise<unknown[]> } }).BarcodeDetector;
  if (!Detector) return null;
  try {
    const img = await createImageBitmap(await (await fetch(src)).blob());
    return (await new Detector({ formats: ["qr_code"] }).detect(img)).length > 0;
  } catch { return null; }
}

type Drag = { id: string; mode: "move" | "resize"; px: number; py: number; start: El; scale: number };

/** Canva-style editor for a printable business card (front + back), exported as PDF. */
export function PrintDesigner({ initial }: { initial: Info }) {
  const t = useTranslations("print");
  const [info, setInfo] = useState<Info>(initial);
  const [design, setDesign] = useState<Design>(() => template("classic", initial, "us"));
  const [qrSource, setQrSource] = useState<QrSource>({ mode: "link" });
  const [qrWarn, setQrWarn] = useState(false);
  const [sideKey, setSideKey] = useState<"front" | "back">("front");
  const [sel, setSel] = useState<string | null>(null);
  const [qr, setQr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<"card" | "sheet" | null>(null);
  const [loaded, setLoaded] = useState(false);
  const canvas = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const qrUpload = useRef<HTMLInputElement>(null);

  const side = design[sideKey];
  const { w: W, h: H } = SIZES[design.size];
  const selected = side.els.find((e) => e.id === sel) ?? null;

  // Restore the last design (per browser), then keep it saved.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) {
        const saved = JSON.parse(raw) as { design: Design; info: Info; qrSource?: QrSource };
        setDesign(saved.design); setInfo({ ...initial, ...saved.info });
        if (saved.qrSource) setQrSource(saved.qrSource);
      }
    } catch {}
    setLoaded(true);
    // The card's logo is a remote file: inline it so it shows inside the SVG and the PDF.
    const remote = initial.logo;
    if (remote && !remote.startsWith("data:")) {
      toDataUrl(remote, 600).then((src) => {
        setInfo((s) => ({ ...s, logo: src }));
        const swap = (els: El[]) => els.map((e) => (e.kind === "image" && e.src === remote ? { ...e, src } : e));
        setDesign((d) => ({ ...d, front: { ...d.front, els: swap(d.front.els) }, back: { ...d.back, els: swap(d.back.els) } }));
      }).catch(() => setInfo((s) => ({ ...s, logo: undefined })));
    }
  }, [initial]);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORE, JSON.stringify({ design, info, qrSource })); } catch {}
  }, [design, info, qrSource, loaded]);

  // Draw every QR element (both sides) whenever its content or colors change.
  const qrEls = useMemo(() => [...design.front.els, ...design.back.els].filter((e) => e.kind === "qr"), [design]);
  const qrKey = qrEls.map((e) => e.kind === "qr" && `${e.id}|${e.data}|${e.fg}|${e.bg}|${e.image ? "img" : ""}`).join(";");
  useEffect(() => {
    let live = true;
    // Uploaded QR pictures are drawn as they are (sideSvg reads them from the element).
    Promise.all(qrEls.map(async (e) => [e.id, e.kind === "qr" && !e.image ? await qrDataUrl(e) : ""] as const)).then((pairs) => live && setQr(Object.fromEntries(pairs)));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrKey]);

  // Template previews with their own codes, redrawn when the details or the size change.
  const [thumbs, setThumbs] = useState<Partial<Record<TemplateId, string>>>({});
  useEffect(() => {
    let live = true;
    const id = setTimeout(async () => {
      const out: Partial<Record<TemplateId, string>> = {};
      for (const tid of TEMPLATE_IDS) {
        const d = template(tid, info, design.size, qrSource);
        const codes = Object.fromEntries(await Promise.all(d.front.els.filter((e) => e.kind === "qr").map(async (e) => [e.id, e.kind === "qr" && !e.image ? await qrDataUrl(e) : ""] as const)));
        out[tid] = svgUrl(sideSvg(d.front, d.size, codes).svg);
      }
      if (live) setThumbs(out);
    }, 300);
    return () => { live = false; clearTimeout(id); };
  }, [info, design.size, qrSource]);

  const preview = useMemo(() => svgUrl(sideSvg(side, design.size, qr).svg), [side, design.size, qr]);

  const patchSide = (f: (els: El[]) => El[], bg?: string) =>
    setDesign((d) => ({ ...d, [sideKey]: { bg: bg ?? d[sideKey].bg, els: f(d[sideKey].els) } }));
  const patch = (id: string, p: Partial<El>) => patchSide((els) => els.map((e) => (e.id === id ? ({ ...e, ...p } as El) : e)));
  const remove = (id: string) => { patchSide((els) => els.filter((e) => e.id !== id)); setSel(null); };
  const add = (el: El) => { patchSide((els) => [...els, el]); setSel(el.id); };
  const layer = (id: string, dir: 1 | -1) => patchSide((els) => {
    const i = els.findIndex((e) => e.id === id), j = i + dir;
    if (j < 0 || j >= els.length) return els;
    const next = [...els]; [next[i], next[j]] = [next[j], next[i]]; return next;
  });

  function onDown(e: RPointerEvent, el: El, mode: Drag["mode"]) {
    e.stopPropagation();
    e.preventDefault();
    setSel(el.id);
    const r = canvas.current!.getBoundingClientRect();
    drag.current = { id: el.id, mode, px: e.clientX, py: e.clientY, start: el, scale: W / r.width };
    (e.target as Element).setPointerCapture(e.pointerId);
  }
  function onMove(e: RPointerEvent) {
    const d = drag.current;
    if (!d) return;
    const dx = (e.clientX - d.px) * d.scale, dy = (e.clientY - d.py) * d.scale;
    const s = d.start, b = bounds(s);
    if (d.mode === "move") {
      patch(d.id, { x: Math.round(clamp(s.x + dx, -b.w / 2, W - b.w / 2)), y: Math.round(clamp(s.y + dy, -b.h / 2, H - b.h / 2)) });
    } else if (s.kind === "qr") {
      patch(d.id, { size: Math.round(clamp(s.size + Math.max(dx, dy), 36, H)) });
    } else if (s.kind === "text") {
      patch(d.id, { w: Math.round(clamp(s.w + dx, 20, W)) });
    } else if (s.kind === "image") {
      const k = clamp((s.w + dx) / s.w, 0.1, 6);
      patch(d.id, { w: Math.round(s.w * k), h: Math.round(s.h * k) });
    } else {
      patch(d.id, { w: Math.round(clamp(s.w + dx, 2, W + 20)), h: Math.round(clamp(s.h + dy, 1, H + 20)) });
    }
  }
  const onUp = () => { drag.current = null; };

  // Arrow keys nudge, Delete removes (not while typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selected || (e.target as HTMLElement).closest("input, textarea, select")) return;
      const step = e.shiftKey ? 10 : 1;
      const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      if (moves[e.key]) { e.preventDefault(); patch(selected.id, { x: selected.x + moves[e.key][0], y: selected.y + moves[e.key][1] }); }
      if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); remove(selected.id); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function applyTemplate(id: TemplateId) {
    setDesign(template(id, info, design.size, qrSource));
    setSel(null);
  }
  /** Switches where the QR code comes from, on both sides. A design without a code gets one added. */
  function chooseQr(next: QrSource, link = info.qr) {
    setQrSource(next);
    setSel(null);
    setDesign((d) => {
      if (next.mode === "none" || [...d.front.els, ...d.back.els].some((e) => e.kind === "qr")) return applyQrSource(d, next, link);
      return { ...d, front: { ...d.front, els: [...d.front.els, newQr(d.size, next, link)] } };
    });
  }
  async function uploadQr(file?: File) {
    if (!file || !/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)) return;
    const src = await toDataUrl(URL.createObjectURL(file), 800);
    setQrWarn((await hasQrCode(src)) === false);
    chooseQr({ mode: "image", src });
  }
  async function addImage(file?: File) {
    if (!file || !/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)) return;
    const src = await toDataUrl(URL.createObjectURL(file), 600);
    const img = await new Promise<HTMLImageElement>((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = src; });
    const h = 48, w = Math.round((h * img.width) / img.height);
    add({ id: uid(), kind: "image", src, x: Math.round(W / 2 - w / 2), y: Math.round(H / 2 - h / 2), w, h, round: false });
  }
  async function exportPdf(kind: "card" | "sheet") {
    setBusy(kind);
    try {
      const blob = kind === "card" ? await cardPdf(design, qr) : await sheetPdf(design, qr);
      download(blob, `${(info.name || "business-card").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${kind === "card" ? "print" : "sheet"}.pdf`);
    } finally { setBusy(null); }
  }

  const warn = [...design.front.els, ...design.back.els].some((e) => outsideSafe(e, design.size));
  const input = "w-full rounded-xl border-2 border-ink/10 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-violet";
  const box = "rounded-[1.75rem] bg-white p-5";
  const chip = (on: boolean) => `rounded-full px-4 py-2 text-sm font-semibold ${on ? "bg-ink text-white" : "bg-lavender text-ink"}`;
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      {/* Canvas */}
      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {(["front", "back"] as const).map((k) => (
            <button key={k} type="button" className={chip(sideKey === k)} onClick={() => { setSideKey(k); setSel(null); }}>{t(k)}</button>
          ))}
          <label className="ml-auto flex items-center gap-2 text-sm font-semibold">
            {t("background")}
            <input type="color" value={side.bg} onChange={(e) => patchSide((els) => els, e.target.value)} className="h-9 w-12 cursor-pointer rounded-lg border-2 border-ink/10" />
          </label>
        </div>

        <div className="rounded-[1.75rem] bg-lavender p-4 sm:p-8" onPointerDown={() => setSel(null)}>
          <div ref={canvas} className="relative mx-auto w-full touch-none select-none shadow-[0_20px_40px_-20px_rgba(23,20,58,0.5)]"
            style={{ aspectRatio: `${W} / ${H}`, maxWidth: 640 }} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt={t(sideKey)} className="absolute inset-0 h-full w-full" draggable={false} />
            {/* Safe area: keep text and codes inside the dashed line. */}
            <div className="pointer-events-none absolute border border-dashed border-violet/40"
              style={{ left: pct(SAFE, W), top: pct(SAFE, H), right: pct(SAFE, W), bottom: pct(SAFE, H) }} />
            {side.els.map((el) => {
              const b = bounds(el), on = el.id === sel;
              return (
                <div key={el.id} role="button" aria-label={el.kind} tabIndex={-1}
                  onPointerDown={(e) => onDown(e, el, "move")}
                  className={`absolute cursor-move ${on ? "outline outline-2 outline-violet" : "hover:outline hover:outline-1 hover:outline-violet/60"}`}
                  style={{ left: pct(b.x, W), top: pct(b.y, H), width: pct(b.w, W), height: pct(b.h, H) }}>
                  {on && (
                    <span onPointerDown={(e) => onDown(e, el, "resize")} aria-hidden
                      className="absolute -bottom-2 -right-2 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-white bg-violet" />
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-center text-xs text-slate">{t("hint")}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className={chip(false)} onClick={() => add({ id: uid(), kind: "text", text: t("newText"), x: 30, y: 30, w: 140, size: 10, color: "#17143a", font: "sans", bold: false, align: "start" })}>+ {t("addText")}</button>
          <button type="button" className={chip(false)} onClick={() => {
            const src: QrSource = qrSource.mode === "none" ? { mode: "link" } : qrSource;
            if (qrSource.mode === "none") setQrSource(src);
            add({ ...newQr(design.size, src, info.qr), x: Math.round(W / 2 - 36), y: Math.round(H / 2 - 36), size: 72 });
          }}>+ {t("addQr")}</button>
          <label className={`${chip(false)} cursor-pointer`}>
            + {t("addImage")}
            <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only" onChange={(e) => { addImage(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
          {info.logo && (
            <button type="button" className={chip(false)} onClick={() => add({ id: uid(), kind: "image", src: info.logo!, x: 20, y: 20, w: 40, h: 40, round: false })}>+ {t("addLogo")}</button>
          )}
          <button type="button" className={chip(false)} onClick={() => add({ id: uid(), kind: "shape", x: 0, y: H - 12, w: W, h: 12, fill: "#c6f432", radius: 0 })}>+ {t("addShape")}</button>
        </div>

        {warn && <p className="rounded-xl bg-sun/40 p-3 text-sm">{t("safeWarn")}</p>}

        <div className="flex flex-wrap gap-3">
          <button type="button" disabled={!!busy} onClick={() => exportPdf("card")} className="btn rounded-full bg-ink px-6 py-4 font-semibold text-white disabled:opacity-50">
            {busy === "card" ? t("exporting") : t("downloadPdf")}
          </button>
          <button type="button" disabled={!!busy} onClick={() => exportPdf("sheet")} className="btn rounded-full bg-lime px-6 py-4 font-semibold text-ink disabled:opacity-50">
            {busy === "sheet" ? t("exporting") : t("downloadSheet", { paper: design.size === "us" ? "Letter" : "A4" })}
          </button>
        </div>
        <p className="text-xs text-slate">{t("exportHelp")}</p>
      </div>

      {/* Panel */}
      <div className="min-w-0 space-y-4">
        {selected ? (
          <section className={box}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-xl uppercase">{t(`kind.${selected.kind}`)}</h2>
              <button type="button" className="text-sm underline" onClick={() => setSel(null)}>{t("done")}</button>
            </div>
            <div className="space-y-3 text-sm">
              {selected.kind === "text" && (
                <>
                  <textarea className={input} rows={Math.min(5, selected.text.split("\n").length + 1)} value={selected.text} onChange={(e) => patch(selected.id, { text: e.target.value })} />
                  <div className="grid grid-cols-2 gap-2">
                    <select className={input} aria-label={t("font")} value={selected.font} onChange={(e) => patch(selected.id, { font: e.target.value as FontId })}>
                      {(Object.keys(FONTS) as FontId[]).map((f) => <option key={f} value={f}>{t(`fonts.${f}`)}</option>)}
                    </select>
                    <label className="flex items-center gap-2">{t("size")}
                      <input type="number" min={5} max={48} step={0.5} className={input} value={selected.size} onChange={(e) => patch(selected.id, { size: clamp(+e.target.value || 5, 5, 48) })} />
                    </label>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input type="color" aria-label={t("color")} value={selected.color} onChange={(e) => patch(selected.id, { color: e.target.value })} className="h-9 w-12 rounded-lg border-2 border-ink/10" />
                    <button type="button" className={chip(selected.bold)} onClick={() => patch(selected.id, { bold: !selected.bold })}><b>B</b></button>
                    {(["start", "middle", "end"] as const).map((a) => (
                      <button key={a} type="button" className={chip(selected.align === a)} onClick={() => patch(selected.id, { align: a })}>{t(`align.${a}`)}</button>
                    ))}
                  </div>
                </>
              )}
              {selected.kind === "qr" && selected.image && <p className="text-slate">{t("qr.uploadedNote")}</p>}
              {selected.kind === "qr" && !selected.image && (
                <>
                  <label className="block">{t("qrLink")}
                    <input className={input} value={selected.data} onChange={(e) => patch(selected.id, { data: e.target.value })} />
                  </label>
                  {info.qr && selected.data !== info.qr && (
                    <button type="button" className="text-sm underline" onClick={() => patch(selected.id, { data: info.qr })}>{t("useCardLink")}</button>
                  )}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2">{t("qrColor")}<input type="color" value={selected.fg} onChange={(e) => patch(selected.id, { fg: e.target.value })} className="h-9 w-12 rounded-lg border-2 border-ink/10" /></label>
                    <label className="flex items-center gap-2">{t("qrBg")}<input type="color" value={selected.bg} onChange={(e) => patch(selected.id, { bg: e.target.value })} className="h-9 w-12 rounded-lg border-2 border-ink/10" /></label>
                  </div>
                  {selected.size < 54 && <p className="rounded-xl bg-sun/40 p-2 text-xs">{t("qrSmall")}</p>}
                </>
              )}
              {selected.kind === "image" && (
                <label className="flex items-center gap-2"><input type="checkbox" checked={selected.round} onChange={(e) => patch(selected.id, { round: e.target.checked })} /> {t("round")}</label>
              )}
              {selected.kind === "shape" && (
                <div className="flex items-center gap-3">
                  <input type="color" aria-label={t("color")} value={selected.fill} onChange={(e) => patch(selected.id, { fill: e.target.value })} className="h-9 w-12 rounded-lg border-2 border-ink/10" />
                  <label className="flex flex-1 items-center gap-2">{t("radius")}
                    <input type="range" min={0} max={40} value={selected.radius} onChange={(e) => patch(selected.id, { radius: +e.target.value })} className="flex-1" />
                  </label>
                </div>
              )}
              <div className="flex flex-wrap gap-2 border-t border-ink/10 pt-3">
                <button type="button" className={chip(false)} onClick={() => layer(selected.id, 1)}>{t("forward")}</button>
                <button type="button" className={chip(false)} onClick={() => layer(selected.id, -1)}>{t("backward")}</button>
                <button type="button" className={chip(false)} onClick={() => { const b = bounds(selected); patch(selected.id, { x: Math.round(W / 2 - b.w / 2) }); }}>{t("center")}</button>
                <button type="button" className="ml-auto rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white" onClick={() => remove(selected.id)}>{t("delete")}</button>
              </div>
            </div>
          </section>
        ) : (
          <section className={box}>
            <h2 className="mb-3 font-display text-xl uppercase">{t("templates")}</h2>
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATE_IDS.map((id) => (
                <button key={id} type="button" onClick={() => applyTemplate(id)} className="group text-left">
                  <span className="block overflow-hidden rounded-lg shadow ring-2 ring-transparent transition group-hover:ring-violet" style={{ aspectRatio: `${W} / ${H}` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {thumbs[id] && <img src={thumbs[id]} alt="" className="h-full w-full" />}
                  </span>
                  <span className="mt-1 block text-xs font-semibold">{t(`tpl.${id}`)}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate">{t("templateNote")}</p>
          </section>
        )}

        <section className={box}>
          <h2 className="mb-3 font-display text-xl uppercase">{t("qr.title")}</h2>
          <div className="flex flex-wrap gap-2">
            {(["none", "link", "image"] as const).map((m) => (
              <button key={m} type="button" aria-pressed={qrSource.mode === m} className={chip(qrSource.mode === m)}
                onClick={() => (m === "image" ? qrUpload.current?.click() : chooseQr({ mode: m }))}>
                {t(`qr.${m}`)}
              </button>
            ))}
            <input ref={qrUpload} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only"
              onChange={(e) => { uploadQr(e.target.files?.[0]); e.target.value = ""; }} />
          </div>
          {qrSource.mode === "link" && (
            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate">{t("info.qr")}
                <input className={`${input} mt-1`} inputMode="url" value={info.qr} placeholder="https://"
                  onChange={(e) => { const qr = e.target.value; setInfo((s) => ({ ...s, qr })); setDesign((d) => applyQrSource(d, { mode: "link" }, qr)); }} />
              </label>
              {initial.qr && info.qr !== initial.qr && (
                <button type="button" className="mt-2 text-sm underline" onClick={() => { setInfo((s) => ({ ...s, qr: initial.qr })); chooseQr({ mode: "link" }, initial.qr); }}>{t("useCardLink")}</button>
              )}
            </div>
          )}
          {qrSource.mode === "image" && (
            <div className="mt-3 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrSource.src} alt="" className="h-16 w-16 rounded-lg bg-white object-contain ring-1 ring-ink/10" />
              <button type="button" className="rounded-full bg-lime px-4 py-2 text-sm font-semibold" onClick={() => qrUpload.current?.click()}>{t("qr.change")}</button>
            </div>
          )}
          {qrSource.mode === "image" && qrWarn && <p className="mt-2 rounded-xl bg-sun/40 p-2 text-xs">{t("qr.notFound")}</p>}
          <p className="mt-2 text-xs text-slate">{t(`qr.hint.${qrSource.mode}`)}</p>
        </section>

        <section className={box}>
          <h2 className="mb-3 font-display text-xl uppercase">{t("details")}</h2>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">
            {(["name", "title", "phone", "email", "website", "address"] as const).map((k) => (
              <label key={k} className="block text-xs font-semibold text-slate">{t(`info.${k}`)}
                <input className={`${input} mt-1`} value={info[k]} onChange={(e) => setInfo((s) => ({ ...s, [k]: e.target.value }))} />
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate">{t("detailsNote")}</p>
        </section>

        <section className={box}>
          <h2 className="mb-3 font-display text-xl uppercase">{t("format")}</h2>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SIZES) as SizeId[]).map((s) => (
              <button key={s} type="button" className={chip(design.size === s)} onClick={() => setDesign((d) => (d.size === s ? d : resize(d, s)))}>
                {t(`sizes.${s}`)} · {SIZES[s].label}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
