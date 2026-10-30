import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/shared/config";
import { allTypeSlugs } from "@/modules/qr/interface/slugs";
import { presetSlugs } from "@/modules/qr/domain/presets";

// Every public, indexable page in every locale, with hreflang alternates.
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/create", "/business-card", "/pricing", "/privacy", "/terms", "/copyright", ...[...allTypeSlugs(), ...presetSlugs()].map((s) => `/create/${s}`)];
  const now = new Date();
  return paths.flatMap((p) =>
    routing.locales.map((l) => ({
      url: `${SITE_URL}/${l}${p}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : p.startsWith("/create") ? 0.8 : 0.4,
      alternates: { languages: Object.fromEntries(routing.locales.map((x) => [x, `${SITE_URL}/${x}${p}`])) },
    })),
  );
}
