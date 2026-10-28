import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { QR_TYPES } from "@/modules/qr/domain/encoders";
import { typeSlug } from "@/modules/qr/interface/slugs";
import { Marquee, Pop, Reveal, WordReveal } from "./motion";
import { QrObject3D, Tilt } from "./three";
import { MotionPermission } from "./interactions";
import { RotatingHeadline } from "./RotatingHeadline";
import { Button } from "./ui/Button";

const CARD_COLORS = ["bg-sky", "bg-pink", "bg-lime", "bg-sun", "bg-[#c9b8ff]", "bg-coral", "bg-white", "bg-[#9ff0d0]"];
const ICONS: Record<string, string> = { url: "🔗", wifi: "📶", text: "✎", vcard: "👤", email: "✉", sms: "💬", pdf: "📄", card: "🪪" };

export function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <Reveal y={30}>
      <p className={`mb-4 flex items-center justify-center gap-2 text-sm md:justify-start font-bold uppercase tracking-widest ${light ? "text-lime" : "text-violet"}`}>
        <Pop rotate={45}><span aria-hidden>✦</span></Pop>{children}
      </p>
    </Reveal>
  );
}

/* ---------- Hero: 3D QR tile on the Varen design canvas ---------- */
export async function LandingHero() {
  const t = await getTranslations("landing");
  const stats = t.raw("stats") as { v: string; l: string }[];
  const handle = "absolute h-3 w-3 border-2 border-lime bg-violet";
  return (
    <section className="relative overflow-hidden bg-violet pb-28 pt-32 text-white grid-bg sm:pt-40">
      <div className="ruler absolute inset-x-0 top-24 h-3 opacity-60" data-speed="0.3" aria-hidden />
      <div className="hero-out relative mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-[1.1fr_0.9fr]">
        <div className="text-center md:text-left">
          <Pop rotate={-8}>
            <span className="mb-6 inline-block rounded-md bg-lime px-3 py-1 font-mono text-xs font-bold text-ink">{t("eyebrow")}</span>
          </Pop>
          <div className="rv-box relative border-2 border-dashed border-lime/80 px-4 py-6 sm:px-8 sm:py-8">
            <span className={`${handle} -left-1.5 -top-1.5`} /><span className={`${handle} -right-1.5 -top-1.5`} />
            <span className={`${handle} -bottom-1.5 -left-1.5`} /><span className={`${handle} -bottom-1.5 -right-1.5`} />
            <RotatingHeadline items={t.raw("headlines") as { a: string; b: string }[]} />
          </div>
          <Reveal delay={450} y={40}><p className="mx-auto mt-8 max-w-xl text-lg text-white/85 md:mx-0">{t("sub")}</p></Reveal>
          <Reveal delay={600} y={30}>
            <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
              <Button href="/create" variant="lime" size="lg">{t("cta")}</Button>
              <Button href="/business-card" variant="outline" size="lg" arrow={false}>{t("cta2")}</Button>
            </div>
          </Reveal>
        </div>

        <div className="relative flex justify-center md:justify-end" data-speed="-0.08">
          <div className="mouse-depth" style={{ "--depth": "10px" } as React.CSSProperties}>
            <QrObject3D />
          </div>
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap md:hidden"><MotionPermission label={t("tilt")} /></div>
          <span className="rv-float absolute -top-6 left-4 hidden items-center gap-1 md:flex" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" className="-mr-1 -mt-4"><path d="M3 2l7 19 2.5-7.5L20 11z" fill="#ff7bca" stroke="#17143a" strokeWidth="1.5" /></svg>
            <span className="rounded-full bg-pink px-3 py-1 text-xs font-bold text-ink">QR</span>
          </span>
        </div>
      </div>

      <Reveal delay={800} y={30} className="relative mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/15 px-0 sm:grid-cols-4 md:mx-4 lg:mx-auto">
        {stats.map((s, i) => (
          <div key={i} className="bg-violet-deep/60 px-6 py-5 backdrop-blur">
            <p className="font-display text-4xl text-lime">{s.v}</p>
            <p className="text-sm text-white/75">{s.l}</p>
          </div>
        ))}
      </Reveal>

      <svg className="absolute -bottom-px left-0 w-full text-lavender" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden>
        <path d="M0 40 C 360 0 1080 80 1440 30 L1440 80 L0 80 Z" fill="currentColor" />
      </svg>
    </section>
  );
}

/* ---------- Ticker band ---------- */
export async function Ticker() {
  const h = await getTranslations("hero");
  const g = await getTranslations("gen.types");
  return (
    <div className="overflow-hidden py-10">
      <div className="scroll-tilt relative -mx-[5%] overflow-hidden bg-ink py-4">
        <Marquee className="font-display text-2xl uppercase tracking-wider text-white"
          items={[h("badge"), g("url"), g("wifi"), g("vcard"), g("email"), g("sms"), "PNG · SVG · PDF"]} />
      </div>
    </div>
  );
}

/* ---------- Types grid (3D tilt cards) ---------- */
export async function TypesGrid() {
  const t = await getTranslations("types");
  const g = await getTranslations("gen.types");
  const s = await getTranslations("seo");
  return (
    <section id="types" className="mx-auto max-w-6xl px-4 py-20">
      <Eyebrow>{t("sub")}</Eyebrow>
      <WordReveal as="h2" text={t("title")} className="mb-12 block font-display text-5xl uppercase leading-none sm:text-7xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QR_TYPES.map((k, i) => (
          <Reveal key={k} delay={(i % 4) * 90}>
            <Tilt className={`rounded-[1.75rem] ${CARD_COLORS[i]}`}>
              <Link href={`/create/${typeSlug(k)}`} data-cursor={g(k)}
                className="group flex min-h-48 flex-col justify-between rounded-[1.75rem] p-6 text-ink">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-sm font-bold">0{i + 1}</span>
                  <span className="text-3xl transition duration-300 group-hover:scale-125 group-hover:rotate-12" aria-hidden>{ICONS[k]}</span>
                </div>
                <div>
                  <p className="font-display text-3xl uppercase">{g(k)}</p>
                  <p className="mt-1 text-sm opacity-80">{s(`${k}.desc`)}</p>
                </div>
              </Link>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- How it works ---------- */
export async function HowItWorks() {
  const t = await getTranslations("landing");
  const steps = t.raw("steps") as { t: string; d: string }[];
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <Eyebrow>{t("how")}</Eyebrow>
      <WordReveal as="h2" text={t("howTitle")} className="mb-12 block font-display text-5xl uppercase leading-none sm:text-7xl" />
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={i} delay={i * 120}>
            <Tilt max={8} className="rounded-[1.75rem] bg-white">
              <div className="flex min-h-56 flex-col justify-between rounded-[1.75rem] p-7 shadow-[0_20px_50px_-30px_rgba(23,20,58,0.4)]">
                <Pop rotate={i % 2 ? -12 : 12}>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet font-display text-xl text-white">{i + 1}</span>
                </Pop>
                <div>
                  <p className="text-2xl font-bold">{s.t}</p>
                  <p className="mt-2 text-slate">{s.d}</p>
                </div>
              </div>
            </Tilt>
          </Reveal>
        ))}
      </div>
      <Reveal delay={300} className="mt-10 flex justify-center"><Button href="/create" variant="ink" size="lg">{t("cta")}</Button></Reveal>
    </section>
  );
}

/* ---------- Business card pitch ---------- */
export async function CardPitch({ monthly, yearly }: { monthly: string; yearly: string }) {
  const t = await getTranslations("landing");
  return (
    <section className="bg-ink px-4 py-24 text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        <div className="text-center md:text-left">
          <Eyebrow light>{t("cardEyebrow")}</Eyebrow>
          <WordReveal as="h2" text={t("cardTitle")} className="block font-display text-5xl uppercase leading-none sm:text-6xl" oddWordClassName="text-lime" />
          <Reveal delay={300}><p className="mx-auto mt-6 max-w-lg text-white/75 md:mx-0">{t("cardSub")}</p></Reveal>
          <Reveal delay={400}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:justify-start">
              <Button href="/business-card" variant="lime" size="lg">{t("cardCta")}</Button>
              <span className="text-sm text-white/60">{t("cardPrice", { monthly, yearly })}</span>
            </div>
          </Reveal>
        </div>
        <Reveal delay={200} className="flex justify-center">
          <Tilt max={14} className="rounded-[2rem]">
            <PhoneMock />
          </Tilt>
        </Reveal>
      </div>
    </section>
  );
}

/** Static phone mock of a hosted card. */
export function PhoneMock() {
  return (
    <div className="w-72 rounded-[2rem] bg-white p-3 text-ink shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
      <div className="rounded-[1.5rem] bg-lavender p-4">
        <div className="h-24 rounded-2xl bg-violet grid-bg" />
        <div className="-mt-8 ml-4 h-16 w-16 rounded-2xl border-4 border-lavender bg-sun" />
        <p className="mt-2 font-display text-2xl uppercase">Blue Bakery</p>
        <p className="text-sm text-slate">Sourdough · Coffee · Open 7–19</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold">
          <span className="rounded-xl bg-lime py-2">📞</span>
          <span className="rounded-xl bg-white py-2">💾</span>
          <span className="rounded-xl bg-white py-2">🧭</span>
        </div>
        <div className="mt-4 space-y-2">
          {[80, 60, 70].map((w, i) => <div key={i} className="h-2 rounded bg-white" style={{ width: `${w}%` }} />)}
        </div>
      </div>
    </div>
  );
}

/* ---------- Trust ---------- */
export async function Trust() {
  const t = await getTranslations("trust");
  const items = t.raw("items") as { t: string; d: string }[];
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:items-center">
        <WordReveal as="h2" text={t("title")} className="block font-display text-6xl uppercase leading-none sm:text-8xl" oddWordClassName="text-violet" />
        <div className="space-y-4">
          {items.map((it, i) => (
            <Reveal key={i} delay={i * 120} y={40}>
              <div className="flex gap-5 rounded-3xl bg-white p-6 transition hover:-translate-x-1">
                <span className="font-mono text-violet">0{i + 1}</span>
                <div>
                  <p className="text-xl font-bold">{it.t}</p>
                  <p className="mt-1 text-slate">{it.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Page header for inner pages ---------- */
export function PageHero({ eyebrow, title, sub, children }: { eyebrow?: string; title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-violet px-4 pb-24 pt-32 text-white grid-bg sm:pt-36">
      <div className="ruler absolute inset-x-0 top-24 h-3 opacity-60" aria-hidden />
      <div className="relative mx-auto max-w-6xl text-center md:text-left">
        {eyebrow && <Pop rotate={-8}><span className="mb-6 inline-block rounded-md bg-lime px-3 py-1 font-mono text-xs font-bold text-ink">{eyebrow}</span></Pop>}
        <WordReveal as="h1" text={title} className="block font-display text-5xl uppercase leading-[0.95] sm:text-7xl" />
        {sub && <Reveal delay={300} y={30}><p className="mx-auto mt-6 max-w-2xl text-lg text-white/85 md:mx-0">{sub}</p></Reveal>}
        {children}
      </div>
      <svg className="absolute -bottom-px left-0 w-full text-lavender" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden>
        <path d="M0 40 C 360 0 1080 80 1440 30 L1440 80 L0 80 Z" fill="currentColor" />
      </svg>
    </section>
  );
}
