"use client";

import { useEffect, useRef, type ReactNode } from "react";

const enabled = () =>
  window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** 3D tilt toward the pointer, with a moving glare. */
export function Tilt({ children, className, max = 12 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled()) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--rx", `${(0.5 - py) * max}deg`);
      el.style.setProperty("--ry", `${(px - 0.5) * max}deg`);
      el.style.setProperty("--gx", `${px * 100}%`);
      el.style.setProperty("--gy", `${py * 100}%`);
      el.dataset.tilt = "on";
    };
    const leave = () => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); el.dataset.tilt = ""; };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
  }, [max]);
  return <div ref={ref} className={`tilt ${className ?? ""}`}>{children}<span className="tilt-glare" aria-hidden /></div>;
}

// Fixed decorative QR matrix (not a real code) used for the 3D hero object.
const MATRIX = (() => {
  const n = 21, cells: [number, number][] = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const finder = (x: number, y: number) =>
    [[0, 0], [n - 7, 0], [0, n - 7]].some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!finder(x, y) && rnd() > 0.52) cells.push([x, y]);
  return { n, cells };
})();

function QrFace({ fg, bg }: { fg: string; bg: string }) {
  const { n, cells } = MATRIX;
  const F = ({ x, y }: { x: number; y: number }) => (
    <g>
      <rect x={x} y={y} width="7" height="7" rx="2" fill={fg} />
      <rect x={x + 1} y={y + 1} width="5" height="5" rx="1.4" fill={bg} />
      <rect x={x + 2} y={y + 2} width="3" height="3" rx="1" fill={fg} />
    </g>
  );
  return (
    <svg viewBox={`-2 -2 ${n + 4} ${n + 4}`} className="h-full w-full">
      <rect x="-2" y="-2" width={n + 4} height={n + 4} rx="3" fill={bg} />
      {cells.map(([x, y]) => <rect key={`${x}-${y}`} x={x + 0.1} y={y + 0.1} width="0.8" height="0.8" rx="0.4" fill={fg} />)}
      <F x={0} y={0} /><F x={n - 7} y={0} /><F x={0} y={n - 7} />
    </svg>
  );
}

/**
 * Hero 3D object: a thick QR tile (front, back and 4 sides) floating and turning
 * with the pointer (uses --mx/--my from ScrollFx), with orbiting stickers.
 */
export function QrObject3D() {
  return (
    <div className="qr3d-scene" aria-hidden>
      <div className="qr3d">
        <div className="qr3d-face qr3d-front"><QrFace fg="#17143a" bg="#ffffff" /></div>
        <div className="qr3d-face qr3d-back"><QrFace fg="#bfff0a" bg="#17143a" /></div>
        <div className="qr3d-side qr3d-right" /><div className="qr3d-side qr3d-left" />
        <div className="qr3d-side qr3d-top" /><div className="qr3d-side qr3d-bottom" />
        <span className="qr3d-sticker bg-pink" style={{ "--z": "90px", "--x": "-58%", "--y": "-30%" } as React.CSSProperties}>WiFi</span>
        <span className="qr3d-sticker bg-sun" style={{ "--z": "120px", "--x": "62%", "--y": "-46%" } as React.CSSProperties}>vCard</span>
        <span className="qr3d-sticker bg-lime" style={{ "--z": "70px", "--x": "54%", "--y": "48%" } as React.CSSProperties}>PNG · SVG · PDF</span>
      </div>
      <div className="qr3d-shadow" />
    </div>
  );
}
