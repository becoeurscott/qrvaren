// Language for a first visit: the phone's language when we have it, else the visitor's country.

const FRENCH = "FR BE CH LU MC CA SN CI CM ML BF NE TG BJ GA CG CD MG GN TD CF BI DJ KM HT MA DZ TN MU RW GF GP MQ RE YT NC PF".split(" ");
const SPANISH = "ES MX AR CO PE VE CL EC GT CU BO DO HN PY SV NI CR PA UY GQ PR".split(" ");

/** Primary languages in the Accept-Language header, most preferred first ("fr-SN,fr;q=0.9" → ["fr"]). */
export function preferredLanguages(header: string | null): string[] {
  if (!header) return [];
  return header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { lang: tag.split("-")[0].toLowerCase(), q: q ? Number(q.slice(2)) : 1 };
    })
    .filter((x) => x.lang && x.lang !== "*" && x.q > 0)
    .sort((a, b) => b.q - a.q)
    .map((x) => x.lang);
}

/**
 * Locale from the visitor's country, used only when none of the phone's languages is one we offer.
 * Returns null when the phone language decides (or nothing is known), so the router's own detection runs.
 */
export function countryLocale(acceptLanguage: string | null, country: string | null, locales: readonly string[]): string | null {
  if (preferredLanguages(acceptLanguage).some((l) => locales.includes(l))) return null;
  const c = country?.toUpperCase() ?? "";
  if (FRENCH.includes(c) && locales.includes("fr")) return "fr";
  if (SPANISH.includes(c) && locales.includes("es")) return "es";
  return null;
}
