import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/routing";
import { Magnetic } from "../interactions";

// Varen pill button: label rolls up on hover, arrow disc slides, the whole button is magnetic.
type Variant = "lime" | "ink" | "light" | "outline";

const VARIANTS: Record<Variant, string> = {
  lime: "bg-lime text-ink",
  ink: "bg-ink text-white",
  light: "bg-white text-ink",
  outline: "bg-transparent text-current ring-2 ring-current",
};
const DISC: Record<Variant, string> = {
  lime: "bg-ink text-lime",
  ink: "bg-lime text-ink",
  light: "bg-violet text-white",
  outline: "bg-current",
};

function Inner({ children, variant, arrow }: { children: ReactNode; variant: Variant; arrow: boolean }) {
  return (
    <>
      <span className="btn-roll relative block overflow-hidden">
        <span className="btn-roll-a block">{children}</span>
        <span className="btn-roll-b absolute inset-0 block" aria-hidden>{children}</span>
      </span>
      {arrow && (
        <span className={`btn-disc relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full ${DISC[variant]}`} aria-hidden>
          <svg className="btn-arrow-a" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 13L13 3M13 3H5M13 3V11" stroke={variant === "outline" ? "white" : "currentColor"} strokeWidth="2" /></svg>
          <svg className="btn-arrow-b absolute" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 13L13 3M13 3H5M13 3V11" stroke={variant === "outline" ? "white" : "currentColor"} strokeWidth="2" /></svg>
        </span>
      )}
    </>
  );
}

const base = "btn group inline-flex items-center gap-3 rounded-full font-semibold transition-[background,box-shadow] duration-300 hover:shadow-[0_12px_30px_-10px_rgba(23,20,58,0.5)] disabled:pointer-events-none disabled:opacity-40";

export function Button({
  href, children, variant = "lime", arrow = true, size = "md", className = "", ...rest
}: { href?: string; children: ReactNode; variant?: Variant; arrow?: boolean; size?: "sm" | "md" | "lg" } & Omit<ComponentProps<"button">, "children">) {
  const pad = size === "lg" ? "py-2 pl-7 pr-2 text-lg" : size === "sm" ? "py-1 pl-4 pr-1 text-sm" : "py-1.5 pl-6 pr-1.5";
  const cls = `${base} ${VARIANTS[variant]} ${arrow ? pad : pad.replace(/pr-\d(\.5)?/, "pr-6").replace("py-1.5", "py-3").replace("py-2 ", "py-4 ")} ${className}`;
  return (
    <Magnetic strength={0.2}>
      {href ? (
        <Link href={href} className={cls}><Inner variant={variant} arrow={arrow}>{children}</Inner></Link>
      ) : (
        <button className={cls} {...rest}><Inner variant={variant} arrow={arrow}>{children}</Inner></button>
      )}
    </Magnetic>
  );
}
