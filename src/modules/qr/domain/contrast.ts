// Readability guards: foreground/background contrast and logo coverage.

function luminance(hex: string): number {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return 0;
  const [r, g, b] = m.slice(1).map((h) => {
    const c = parseInt(h, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

export const MIN_CONTRAST = 4;
// Logo must stay under the error-correction budget; H recovers ~30%, we keep a margin.
export const MAX_LOGO_RATIO = 0.25;

export type ReadabilityIssue = "low_contrast" | "inverted" | "logo_too_big";

/** extra: other code colors (gradient end, corner accent) that must also stand out from bg. */
export function readabilityIssues(opts: { fg: string; bg: string; extra?: (string | undefined)[]; logoRatio?: number }): ReadabilityIssue[] {
  const issues: ReadabilityIssue[] = [];
  const colors = [opts.fg, ...(opts.extra ?? [])].filter((c): c is string => !!c);
  if (colors.some((c) => contrastRatio(c, opts.bg) < MIN_CONTRAST)) issues.push("low_contrast");
  // Many scanners fail on light-on-dark codes.
  else if (colors.some((c) => luminance(c) > luminance(opts.bg))) issues.push("inverted");
  if ((opts.logoRatio ?? 0) > MAX_LOGO_RATIO) issues.push("logo_too_big");
  return issues;
}
