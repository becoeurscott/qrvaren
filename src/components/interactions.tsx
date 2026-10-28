"use client";

import { useEffect, useRef, useState } from "react";

// Mouse and scroll effects in the spirit of the Varen template.
// Everything writes transforms or CSS variables inside requestAnimationFrame, and is off
// for touch screens and for visitors who ask for reduced motion.

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = () => window.matchMedia("(pointer: fine)").matches;

/**
 * Custom cursor: a lime dot that sticks to the pointer and a ring that trails it.
 * Over links and buttons the ring grows; over [data-cursor="label"] it shows that label.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!finePointer() || reduced()) return;
    document.documentElement.classList.add("has-cursor");
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf = 0;

    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      dot.current!.style.transform = `translate(${x}px, ${y}px)`;
      dot.current!.style.opacity = ring.current!.style.opacity = "1";
    };
    const over = (e: PointerEvent) => {
      const el = (e.target as Element).closest<HTMLElement>("a, button, [role=tab], input[type=color], [data-cursor], label");
      const text = el?.dataset.cursor ?? "";
      const r = ring.current!;
      r.dataset.state = text ? "label" : el ? "hover" : "";
      if (/^(input|textarea)$/i.test((e.target as Element).tagName)) r.dataset.state = "text";
      label.current!.textContent = text;
    };
    const leave = () => { dot.current!.style.opacity = ring.current!.style.opacity = "0"; };
    const down = () => ring.current!.classList.add("is-down");
    const up = () => ring.current!.classList.remove("is-down");
    const tick = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      ring.current!.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(tick);
    };

    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerover", over, { passive: true });
    document.addEventListener("pointerleave", leave);
    addEventListener("pointerdown", down);
    addEventListener("pointerup", up);
    raf = requestAnimationFrame(tick);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      removeEventListener("pointermove", move);
      removeEventListener("pointerover", over);
      document.removeEventListener("pointerleave", leave);
      removeEventListener("pointerdown", down);
      removeEventListener("pointerup", up);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden><span ref={label} /></div>
      <div ref={dot} className="cursor-dot" aria-hidden />
    </>
  );
}

/**
 * Scroll + mouse driver. Sets on <html>:
 *  --scroll    page progress 0..1 (progress bar)
 *  --mx, --my  pointer position -1..1 (mouse parallax)
 * and moves every [data-speed] element by (its distance to the viewport center × speed).
 */
export function ScrollFx() {
  useEffect(() => {
    if (reduced()) return;
    const root = document.documentElement;
    let raf = 0, mx = 0, my = 0, tmx = 0, tmy = 0;
    let items: HTMLElement[] = [];
    const collect = () => { items = [...document.querySelectorAll<HTMLElement>("[data-speed]")]; };
    collect();
    const mo = new MutationObserver(collect);
    mo.observe(document.body, { childList: true, subtree: true });

    const onMouse = (e: PointerEvent) => { tmx = (e.clientX / innerWidth) * 2 - 1; tmy = (e.clientY / innerHeight) * 2 - 1; };

    // Phones: the gyroscope drives the same --mx/--my as the mouse. The neutral position
    // follows how the phone is held (slow-moving baseline), so any holding angle works.
    let baseX: number | null = null, baseY: number | null = null;
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      const angle = screen.orientation?.angle ?? 0;
      // Map device axes to screen axes for portrait and both landscapes.
      const [x, y] = angle === 90 ? [e.beta, -e.gamma] : angle === 270 || angle === -90 ? [-e.beta, e.gamma] : [e.gamma, e.beta];
      baseX ??= x; baseY ??= y;
      baseX += (x - baseX) * 0.01; baseY += (y - baseY) * 0.01;
      tmx = clamp((x - baseX) / 25);
      tmy = clamp((y - baseY) / 25);
    };
    const startOrientation = () => addEventListener("deviceorientation", onOrient, { passive: true });

    const frame = () => {
      const max = root.scrollHeight - innerHeight;
      root.style.setProperty("--scroll", String(max > 0 ? scrollY / max : 0));
      mx += (tmx - mx) * 0.08; my += (tmy - my) * 0.08;
      root.style.setProperty("--mx", mx.toFixed(4));
      root.style.setProperty("--my", my.toFixed(4));
      const mid = innerHeight / 2;
      for (const el of items) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) continue;
        const d = (r.top + r.height / 2 - mid) * Number(el.dataset.speed);
        el.style.setProperty("--py", `${d.toFixed(1)}px`);
      }
      raf = requestAnimationFrame(frame);
    };
    if (finePointer()) addEventListener("pointermove", onMouse, { passive: true });
    else if (!needsMotionPermission()) startOrientation();
    // iOS: MotionPermission asks the user, then fires this event.
    addEventListener(MOTION_EVENT, startOrientation);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      removeEventListener("pointermove", onMouse);
      removeEventListener("deviceorientation", onOrient);
      removeEventListener(MOTION_EVENT, startOrientation);
    };
  }, []);

  return <div className="scroll-progress" aria-hidden />;
}

const MOTION_EVENT = "motion:granted";
type IOSOrientation = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };
const needsMotionPermission = () =>
  typeof DeviceOrientationEvent !== "undefined" && typeof (DeviceOrientationEvent as IOSOrientation).requestPermission === "function";

/**
 * iOS Safari only gives motion data after a tap. This pill asks once, then hides.
 * Renders nothing on desktop, on Android (no prompt needed) and with reduced motion.
 */
export function MotionPermission({ label }: { label: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (finePointer() || reduced() || !needsMotionPermission()) return;
    try { if (sessionStorage.getItem(MOTION_EVENT)) { dispatchEvent(new Event(MOTION_EVENT)); return; } } catch {}
    setShow(true);
  }, []);
  if (!show) return null;
  const ask = async () => {
    try {
      const res = await (DeviceOrientationEvent as IOSOrientation).requestPermission!();
      if (res === "granted") {
        try { sessionStorage.setItem(MOTION_EVENT, "1"); } catch {}
        dispatchEvent(new Event(MOTION_EVENT));
      }
    } catch {}
    setShow(false);
  };
  return (
    <button onClick={ask} className="rv-float inline-flex items-center gap-2 rounded-full bg-lime px-4 py-2 text-sm font-bold text-ink shadow-lg">
      <span aria-hidden>📱</span>{label}
    </button>
  );
}

/** Buttons that lean toward the pointer, like Framer's magnetic CTA. */
export function Magnetic({ children, strength = 0.3, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !finePointer() || reduced()) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * strength}px, ${(e.clientY - r.top - r.height / 2) * strength}px)`;
    };
    const reset = () => { el.style.transform = ""; };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", reset);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", reset); };
  }, [strength]);
  return <span ref={ref} className={`magnetic inline-flex ${className ?? ""}`}>{children}</span>;
}
