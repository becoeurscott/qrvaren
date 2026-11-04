"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import jsQR from "jsqr";
import { Link } from "@/i18n/routing";

// Decodes QR codes entirely in the browser, from an image or the camera. Nothing is uploaded.
const MAX_SIDE = 1600;

function decodeCanvas(canvas: HTMLCanvasElement, source: CanvasImageSource, w: number, h: number) {
  const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return jsQR(img.data, img.width, img.height, { inversionAttempts: "attemptBoth" })?.data ?? null;
}

type Parsed =
  | { kind: "url"; url: string; host: string }
  | { kind: "wifi"; ssid: string; password: string; security: string }
  | { kind: "text"; text: string };

function parse(data: string): Parsed {
  if (/^https?:\/\//i.test(data)) {
    try { return { kind: "url", url: data, host: new URL(data).host }; } catch { /* fall through to text */ }
  }
  if (/^WIFI:/i.test(data)) {
    const get = (k: string) => data.match(new RegExp(`[:;]${k}:((?:\\\\.|[^;])*)`))?.[1]?.replace(/\\(.)/g, "$1") ?? "";
    return { kind: "wifi", ssid: get("S"), password: get("P"), security: get("T") || "nopass" };
  }
  return { kind: "text", text: data };
}

export function Scanner() {
  const t = useTranslations("scanner");
  const canvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [camera, setCamera] = useState(false);
  const [drag, setDrag] = useState(false);
  const [copied, setCopied] = useState(false);

  const stopCamera = () => {
    stream.current?.getTracks().forEach((tr) => tr.stop());
    stream.current = null;
    setCamera(false);
  };
  useEffect(() => stopCamera, []);

  const show = (data: string | null) => {
    setCopied(false);
    if (data) { setResult(data); setError(null); } else { setResult(null); setError(t("notFound")); }
  };

  const readFile = async (file: File | undefined | null) => {
    if (!file || !file.type.startsWith("image/") || !canvas.current) return;
    stopCamera();
    try {
      const bmp = await createImageBitmap(file);
      show(decodeCanvas(canvas.current, bmp, bmp.width, bmp.height));
    } catch {
      show(null);
    }
  };

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = [...(e.clipboardData?.items ?? [])].find((i) => i.type.startsWith("image/"));
      if (item) readFile(item.getAsFile());
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  });

  const startCamera = async () => {
    setError(null);
    setResult(null);
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setCamera(true);
    } catch {
      setError(t("cameraDenied"));
    }
  };

  useEffect(() => {
    if (!camera || !video.current || !stream.current) return;
    const v = video.current;
    v.srcObject = stream.current;
    v.play().catch(() => {});
    let raf = 0;
    const tick = () => {
      if (v.readyState >= 2 && canvas.current) {
        const data = decodeCanvas(canvas.current, v, v.videoWidth, v.videoHeight);
        if (data) { stopCamera(); show(data); return; }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [camera]); // eslint-disable-line react-hooks/exhaustive-deps

  const parsed = result ? parse(result) : null;
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); } catch { /* clipboard blocked */ }
  };

  return (
    <div className="grid gap-6 rounded-[2rem] bg-white p-5 shadow-xl ring-1 ring-ink/10 sm:p-8 md:grid-cols-2">
      <canvas ref={canvas} className="hidden" />
      <div>
        {camera ? (
          <div className="relative overflow-hidden rounded-3xl bg-ink">
            <video ref={video} className="aspect-square w-full object-cover" muted playsInline />
            <div className="pointer-events-none absolute inset-10 rounded-2xl border-4 border-lime/80" aria-hidden />
            <button type="button" onClick={stopCamera} className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-5 py-2 text-sm font-bold text-ink">{t("stop")}</button>
          </div>
        ) : (
          <label
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); readFile(e.dataTransfer.files[0]); }}
            className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-4 border-dashed p-6 text-center transition ${drag ? "border-violet bg-lavender" : "border-ink/15 hover:border-violet"}`}
          >
            <span className="text-5xl text-violet" aria-hidden>✺</span>
            <span className="text-lg font-bold">{t("drop")}</span>
            <span className="text-sm text-ink/60">{t("dropHint")}</span>
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => { readFile(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
        )}
        {!camera && (
          <button type="button" onClick={startCamera} className="mt-4 w-full rounded-full bg-violet px-6 py-3 font-bold text-white transition hover:bg-violet-deep">{t("useCamera")}</button>
        )}
        <p className="mt-3 text-center text-xs text-ink/60">{t("private")}</p>
      </div>

      <div className="flex flex-col justify-center" aria-live="polite">
        {!parsed && !error && <p className="text-center text-ink/60">{t("waiting")}</p>}
        {error && <p className="rounded-2xl bg-pink/30 p-4 font-semibold">{error}</p>}
        {parsed && (
          <div className="space-y-4">
            <p className="font-mono text-xs font-bold uppercase text-violet">{t(`kind.${parsed.kind}`)}</p>
            {parsed.kind === "url" && (
              <>
                <p className="break-all rounded-2xl bg-lavender p-4 font-mono text-sm">{parsed.url}</p>
                <p className="text-sm text-ink/75">{t("checkHost", { host: parsed.host })}</p>
                <a href={parsed.url} target="_blank" rel="noopener noreferrer nofollow" className="block rounded-full bg-lime px-6 py-3 text-center font-bold text-ink">{t("open")}</a>
              </>
            )}
            {parsed.kind === "wifi" && (
              <dl className="space-y-2 rounded-2xl bg-lavender p-4 text-sm">
                <div><dt className="font-bold">{t("ssid")}</dt><dd className="break-all font-mono">{parsed.ssid}</dd></div>
                <div><dt className="font-bold">{t("password")}</dt><dd className="break-all font-mono">{parsed.password || "—"}</dd></div>
                <div><dt className="font-bold">{t("security")}</dt><dd className="font-mono">{parsed.security}</dd></div>
              </dl>
            )}
            {parsed.kind === "text" && <p className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-lavender p-4 font-mono text-sm">{parsed.text}</p>}
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => copy(parsed.kind === "wifi" ? parsed.password : result!)} className="rounded-full bg-ink px-5 py-2 text-sm font-bold text-white">{copied ? t("copied") : parsed.kind === "wifi" ? t("copyPassword") : t("copy")}</button>
              <button type="button" onClick={() => { setResult(null); setError(null); }} className="rounded-full px-5 py-2 text-sm font-bold ring-2 ring-ink/15">{t("again")}</button>
            </div>
          </div>
        )}
        <p className="mt-8 text-center text-sm">
          {t("makeOwn")} <Link href="/create" className="font-bold text-violet underline">{t("makeOwnCta")}</Link>
        </p>
      </div>
    </div>
  );
}
