"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

// Scroll-triggered animations reproducing the Varen/Framer effects with CSS only.
// See the .rv-* rules in globals.css. Reduced motion disables them.

function useInView<T extends Element>(once = true) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          if (once) io.disconnect();
        } else if (!once) setSeen(false);
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);
  return [ref, seen] as const;
}

/** Heading revealed word by word: blur + rise + tilt, staggered. */
export function WordReveal({ text, className, oddWordClassName, delay = 0, as: Tag = "span" }: {
  text: string; className?: string; oddWordClassName?: string; delay?: number; as?: "span" | "h1" | "h2";
}) {
  const [ref, seen] = useInView<HTMLElement>();
  return (
    <Tag ref={ref as never} className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} aria-hidden className={`rv-word ${seen ? "rv-in" : ""} ${i % 2 && oddWordClassName ? oddWordClassName : ""}`}
          style={{ "--d": `${delay + i * 70}ms` } as CSSProperties}>
          {w}&nbsp;
        </span>
      ))}
    </Tag>
  );
}

/** Fade + rise when the block enters the viewport. */
export function Reveal({ children, className, delay = 0, y = 60 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={`rv-up ${seen ? "rv-in" : ""} ${className ?? ""}`} style={{ "--d": `${delay}ms`, "--y": `${y}px` } as CSSProperties}>
      {children}
    </div>
  );
}

/** Sticker-like pop: scale up from 0.4 with a rotation. */
export function Pop({ children, className, delay = 0, rotate = 12 }: { children: ReactNode; className?: string; delay?: number; rotate?: number }) {
  const [ref, seen] = useInView<HTMLSpanElement>();
  return (
    <span ref={ref} className={`rv-pop ${seen ? "rv-in" : ""} ${className ?? ""}`} style={{ "--d": `${delay}ms`, "--r": `${rotate}deg` } as CSSProperties}>
      {children}
    </span>
  );
}

/** Infinite horizontal ticker. */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const row = (
    <div className="flex shrink-0 items-center gap-8 pr-8">
      {items.map((t, i) => (
        <span key={i} className="flex items-center gap-8 whitespace-nowrap">
          {t}<span className="text-lime" aria-hidden>✺</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`overflow-hidden ${className ?? ""}`} aria-label={items.join(", ")}>
      <div className="rv-marquee flex w-max" aria-hidden>{row}{row}</div>
    </div>
  );
}
