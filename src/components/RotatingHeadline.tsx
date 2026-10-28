"use client";

import { useEffect, useState } from "react";
import { WordReveal } from "./motion";

type Headline = { a: string; b: string };

const OUT_MS = 450;

/**
 * Hero headline that cycles through marketing presets.
 * The current line blurs out, the next one is revealed word by word (Varen effect),
 * and a lime bar shows the time left. Pauses while the tab is hidden.
 */
export function RotatingHeadline({ items, intervalMs = 20_000 }: { items: Headline[]; intervalMs?: number }) {
  const [i, setI] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (items.length < 2) return;
    let swap: ReturnType<typeof setTimeout> | undefined;
    let tick: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      tick = setTimeout(() => {
        setLeaving(true);
        swap = setTimeout(() => {
          setI((n) => (n + 1) % items.length);
          setLeaving(false);
        }, OUT_MS);
      }, intervalMs);
    };
    const onVisibility = () => {
      clearTimeout(tick);
      if (!document.hidden) schedule();
    };
    schedule();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearTimeout(tick);
      clearTimeout(swap);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [i, items.length, intervalMs]);

  const h = items[i];
  return (
    <>
      <h1
        className={`min-h-[1.9em] font-display text-5xl uppercase leading-[0.95] tracking-tight transition duration-[450ms] sm:text-7xl ${
          leaving ? "translate-y-[-12px] opacity-0 blur-sm" : ""
        }`}
        aria-label={`${h.a} ${h.b}`}
        aria-live="off"
      >
        <WordReveal key={`a${i}`} text={h.a} className="block" />
        <WordReveal key={`b${i}`} text={h.b} className="block text-lime" delay={h.a.split(" ").length * 70} />
      </h1>
      {items.length > 1 && (
        <span className="absolute inset-x-0 -bottom-[3px] h-[3px] overflow-hidden" aria-hidden>
          <span
            key={i}
            className="headline-progress block h-full origin-left bg-lime"
            style={{ animationDuration: `${intervalMs}ms` }}
          />
        </span>
      )}
    </>
  );
}
