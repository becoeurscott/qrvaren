// Country dialing codes for the phone field. US first (main market), then alphabetical by ISO code.
export const COUNTRIES: readonly { iso: string; dial: string }[] = [
  { iso: "US", dial: "1" }, { iso: "CA", dial: "1" }, { iso: "MX", dial: "52" }, { iso: "GB", dial: "44" },
  { iso: "FR", dial: "33" }, { iso: "BE", dial: "32" }, { iso: "CH", dial: "41" }, { iso: "ES", dial: "34" },
  { iso: "DE", dial: "49" }, { iso: "IT", dial: "39" }, { iso: "PT", dial: "351" }, { iso: "NL", dial: "31" },
  { iso: "IE", dial: "353" }, { iso: "BR", dial: "55" }, { iso: "AR", dial: "54" }, { iso: "CO", dial: "57" },
  { iso: "CL", dial: "56" }, { iso: "PE", dial: "51" }, { iso: "DO", dial: "1" }, { iso: "PR", dial: "1" },
  { iso: "HT", dial: "509" }, { iso: "CM", dial: "237" }, { iso: "CI", dial: "225" }, { iso: "SN", dial: "221" },
  { iso: "MA", dial: "212" }, { iso: "DZ", dial: "213" }, { iso: "TN", dial: "216" }, { iso: "NG", dial: "234" },
  { iso: "GH", dial: "233" }, { iso: "KE", dial: "254" }, { iso: "ZA", dial: "27" }, { iso: "CD", dial: "243" },
  { iso: "GA", dial: "241" }, { iso: "BJ", dial: "229" }, { iso: "TG", dial: "228" }, { iso: "ML", dial: "223" },
  { iso: "IN", dial: "91" }, { iso: "PH", dial: "63" }, { iso: "CN", dial: "86" }, { iso: "JP", dial: "81" },
  { iso: "KR", dial: "82" }, { iso: "VN", dial: "84" }, { iso: "AE", dial: "971" }, { iso: "SA", dial: "966" },
  { iso: "IL", dial: "972" }, { iso: "TR", dial: "90" }, { iso: "AU", dial: "61" }, { iso: "NZ", dial: "64" },
];

/** "US" → 🇺🇸 (regional indicator letters). */
export const flag = (iso: string) => String.fromCodePoint(...[...iso.toUpperCase()].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));

/** Splits a stored "+33 6 12 34 56 78" into its country and local part; numbers without "+" stay local. */
export function splitPhone(phone: string, fallback = "US"): { iso: string; local: string } {
  const v = phone.trim();
  if (!v.startsWith("+")) return { iso: fallback, local: v };
  const digits = v.slice(1).replace(/\D/g, "");
  // Longest code wins (+351 before +35…); a shared code (+1) keeps the fallback when it matches.
  const match = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length).find((c) => digits.startsWith(c.dial));
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
