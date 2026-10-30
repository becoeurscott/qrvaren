// Country dialing codes for the phone field. US first (main market), then grouped by region.
export const COUNTRIES: readonly { iso: string; dial: string }[] = [
  // North America & Caribbean
  { iso: "US", dial: "1" }, { iso: "CA", dial: "1" }, { iso: "MX", dial: "52" }, { iso: "DO", dial: "1" },
  { iso: "PR", dial: "1" }, { iso: "HT", dial: "509" }, { iso: "JM", dial: "1" }, { iso: "TT", dial: "1" },
  { iso: "CU", dial: "53" },
  // Europe
  { iso: "GB", dial: "44" }, { iso: "FR", dial: "33" }, { iso: "BE", dial: "32" }, { iso: "CH", dial: "41" },
  { iso: "ES", dial: "34" }, { iso: "DE", dial: "49" }, { iso: "IT", dial: "39" }, { iso: "PT", dial: "351" },
  { iso: "NL", dial: "31" }, { iso: "IE", dial: "353" }, { iso: "LU", dial: "352" }, { iso: "MC", dial: "377" },
  // Latin America
  { iso: "BR", dial: "55" }, { iso: "AR", dial: "54" }, { iso: "CO", dial: "57" }, { iso: "CL", dial: "56" },
  { iso: "PE", dial: "51" }, { iso: "VE", dial: "58" }, { iso: "EC", dial: "593" }, { iso: "GT", dial: "502" },
  { iso: "BO", dial: "591" }, { iso: "HN", dial: "504" }, { iso: "PY", dial: "595" }, { iso: "SV", dial: "503" },
  { iso: "NI", dial: "505" }, { iso: "CR", dial: "506" }, { iso: "PA", dial: "507" }, { iso: "UY", dial: "598" },
  { iso: "GF", dial: "594" }, { iso: "GP", dial: "590" }, { iso: "MQ", dial: "596" },
  // Africa
  { iso: "DZ", dial: "213" }, { iso: "AO", dial: "244" }, { iso: "BJ", dial: "229" }, { iso: "BW", dial: "267" },
  { iso: "BF", dial: "226" }, { iso: "BI", dial: "257" }, { iso: "CV", dial: "238" }, { iso: "CM", dial: "237" },
  { iso: "CF", dial: "236" }, { iso: "TD", dial: "235" }, { iso: "KM", dial: "269" }, { iso: "CG", dial: "242" },
  { iso: "CD", dial: "243" }, { iso: "CI", dial: "225" }, { iso: "DJ", dial: "253" }, { iso: "EG", dial: "20" },
  { iso: "GQ", dial: "240" }, { iso: "ER", dial: "291" }, { iso: "SZ", dial: "268" }, { iso: "ET", dial: "251" },
  { iso: "GA", dial: "241" }, { iso: "GM", dial: "220" }, { iso: "GH", dial: "233" }, { iso: "GN", dial: "224" },
  { iso: "GW", dial: "245" }, { iso: "KE", dial: "254" }, { iso: "LS", dial: "266" }, { iso: "LR", dial: "231" },
  { iso: "LY", dial: "218" }, { iso: "MG", dial: "261" }, { iso: "MW", dial: "265" }, { iso: "ML", dial: "223" },
  { iso: "MR", dial: "222" }, { iso: "MU", dial: "230" }, { iso: "YT", dial: "262" }, { iso: "MA", dial: "212" },
  { iso: "MZ", dial: "258" }, { iso: "NA", dial: "264" }, { iso: "NE", dial: "227" }, { iso: "NG", dial: "234" },
  { iso: "RE", dial: "262" }, { iso: "RW", dial: "250" }, { iso: "ST", dial: "239" }, { iso: "SN", dial: "221" },
  { iso: "SC", dial: "248" }, { iso: "SL", dial: "232" }, { iso: "SO", dial: "252" }, { iso: "ZA", dial: "27" },
  { iso: "SS", dial: "211" }, { iso: "SD", dial: "249" }, { iso: "TZ", dial: "255" }, { iso: "TG", dial: "228" },
  { iso: "TN", dial: "216" }, { iso: "UG", dial: "256" }, { iso: "ZM", dial: "260" }, { iso: "ZW", dial: "263" },
  // Asia & Middle East
  { iso: "IN", dial: "91" }, { iso: "PH", dial: "63" }, { iso: "CN", dial: "86" }, { iso: "JP", dial: "81" },
  { iso: "KR", dial: "82" }, { iso: "VN", dial: "84" }, { iso: "AE", dial: "971" }, { iso: "SA", dial: "966" },
  { iso: "IL", dial: "972" }, { iso: "TR", dial: "90" }, { iso: "LB", dial: "961" },
  // Oceania
  { iso: "AU", dial: "61" }, { iso: "NZ", dial: "64" }, { iso: "NC", dial: "687" }, { iso: "PF", dial: "689" },
];

/** "US" → 🇺🇸 (regional indicator letters). */
export const flag = (iso: string) => String.fromCodePoint(...[...iso.toUpperCase()].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));

// Pre-sorted by dial length descending so splitPhone doesn't re-sort on every call.
const BY_DIAL_LEN = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);

/** Splits a stored "+33 6 12 34 56 78" into its country and local part; numbers without "+" stay local. */
export function splitPhone(phone: string, fallback = "US"): { iso: string; local: string } {
  const v = phone.trim();
  if (!v.startsWith("+")) return { iso: fallback, local: v };
  const digits = v.slice(1).replace(/\D/g, "");
  // Longest code wins (+351 before +35…); a shared code (+1) keeps the fallback when it matches.
  const match = BY_DIAL_LEN.find((c) => digits.startsWith(c.dial));
  if (!match) return { iso: fallback, local: v };
  const iso = COUNTRIES.some((c) => c.iso === fallback && c.dial === match.dial) ? fallback : match.iso;
  const rest = v.slice(1).replace(/^\s*/, "");
  let n = 0, i = 0;
  while (i < rest.length && n < match.dial.length) { if (/\d/.test(rest[i])) n++; i++; }
  return { iso, local: rest.slice(i).trim() };
}

/** Joins country and local number; a local number already in "+…" form is kept as typed. */
export function joinPhone(iso: string, local: string): string {
  const v = local.trim();
  if (!v) return "";
  if (v.startsWith("+")) return v;
  const dial = COUNTRIES.find((c) => c.iso === iso)?.dial ?? "1";
  return `+${dial} ${v.replace(/^0+(?=\d)/, "")}`;
}
