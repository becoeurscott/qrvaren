import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { BRAND_NAME } from "@/shared/config";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileMenu } from "./MobileMenu";
import { AuthLink } from "./AuthLink";
import { LogoutButton } from "./LogoutButton";
import { Button } from "./ui/Button";

// Floating pill navigation, as in the Varen template. Below md the links move into MobileMenu.
export async function Nav() {
  const t = await getTranslations("nav");
  const locale = await getLocale();
  const items = [
    { href: "/create", label: t("generator") },
    { href: "/business-card", label: t("card") },
    { href: "/pricing", label: t("pricing") },
    { href: "/login", label: t("login") },
  ];
  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav className="flex w-full max-w-max items-center justify-between gap-1 rounded-full bg-violet-deep/95 p-1.5 pl-4 text-white shadow-lg ring-4 ring-violet/30 backdrop-blur sm:gap-3">
        <Link href="/" className="relative z-[60] mr-2 flex items-center gap-2 font-display text-xl tracking-wide">
          <span className="text-lime" aria-hidden>✺</span>
          {BRAND_NAME}
        </Link>
        {items.slice(0, 3).map((it) => (
          <Link key={it.href} href={it.href} className="hidden px-2 text-sm font-semibold transition hover:text-lime md:block">{it.label}</Link>
        ))}
        <span className="hidden md:block">
          <AuthLink login={t("login")} dashboard={t("dashboard")} className="px-2 text-sm font-semibold transition hover:text-lime" />
        </span>
        <span className="hidden md:block">
          <LogoutButton label={t("logout")} locale={locale} className="px-2 text-sm font-semibold text-white/75 transition hover:text-lime disabled:opacity-50" />
        </span>
        <span className="hidden md:block"><LocaleSwitcher current={locale} /></span>
        <span className="hidden sm:block"><Button href="/create" variant="light" size="sm">{t("cta")}</Button></span>
        <MobileMenu items={items} cta={{ href: "/create", label: t("cta") }} locale={locale} openLabel={t("menu")} closeLabel={t("close")} dashboardLabel={t("dashboard")} logoutLabel={t("logout")} />
      </nav>
    </header>
  );
}
