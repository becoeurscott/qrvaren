import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { BRAND_NAME } from "@/shared/config";
import { requireAdmin, ROLE_LABEL } from "./_lib/admin";
import { Sidebar } from "./_lib/Sidebar";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

// Admin shell: its own header and sidebar, none of the public site chrome.
export default async function AdminLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string; panel: string }> }) {
  const { locale, panel } = await params;
  setRequestLocale(locale);
  const { user, role, perms } = await requireAdmin(panel);
  return (
    <div className="min-h-screen bg-lavender">
      <Sidebar base={`/${locale}/${panel}`} email={user.email ?? ""} brand={BRAND_NAME} role={ROLE_LABEL[role]} perms={perms} />
      <main className="px-4 py-8 md:ml-64 md:px-10">{children}</main>
    </div>
  );
}
