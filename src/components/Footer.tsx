import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { BRAND_NAME, CONTACT_EMAIL, LEGAL, legalReady } from "@/shared/config";
import { QR_TYPES } from "@/modules/qr/domain/encoders";
import { typeSlug } from "@/modules/qr/interface/slugs";
import { PRESETS, PRESET_IDS, type Preset } from "@/modules/qr/domain/presets";

const LOCAL = new Set(["phone"]);

export async function Footer() {
  const t = await getTranslations("footer");
  const g = await getTranslations("gen.types");
  const n = await getTranslations("nav");
  return (
    <footer className="bg-ink px-6 pb-10 pt-16 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-5xl tracking-wide sm:text-7xl">{BRAND_NAME}</p>
          <p className="mt-3 max-w-sm text-white/70">{t("tagline")}</p>
        </div>
        <ul className="space-y-2 text-sm font-semibold">
          {QR_TYPES.map((k) => (
            <li key={k}><Link className="hover:text-lime" href={`/create/${typeSlug(k)}`}>{g(k)}</Link></li>
          ))}
        </ul>
        <ul className="space-y-2 text-sm font-semibold">
          {PRESET_IDS.filter((id) => (PRESETS[id] as Preset).slug && !LOCAL.has(id)).map((id) => (
            <li key={id}>
              <Link className="hover:text-lime" href={`/create/${(PRESETS[id] as Preset).slug}`}>{(PRESETS[id] as Preset).brand}</Link>
            </li>
          ))}
        </ul>
        <ul className="space-y-2 text-sm font-semibold">
          <li><Link className="hover:text-lime" href="/guides">{n("guides")}</Link></li>
          <li><Link className="hover:text-lime" href="/privacy">{t("privacy")}</Link></li>
          <li><Link className="hover:text-lime" href="/terms">{t("terms")}</Link></li>
          <li><Link className="hover:text-lime" href="/copyright">{t("copyright")}</Link></li>
        </ul>
      </div>
      <p className="mx-auto mt-12 max-w-6xl border-t border-white/10 pt-6 text-xs text-white/50">
        © {new Date().getFullYear()} {BRAND_NAME}. {t("rights")}
        {legalReady() && <span className="mt-1 block">{t("operator")}: {LEGAL.name} · {LEGAL.address}, {LEGAL.country} · {CONTACT_EMAIL}</span>}
      </p>
    </footer>
  );
}
