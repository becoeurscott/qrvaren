import { describe, expect, it } from "vitest";
import { countryLocale, preferredLanguages } from "./detect";

const LOCALES = ["en", "es", "fr"] as const;

describe("first-visit language", () => {
  it("reads the phone's languages in order of preference", () => {
    expect(preferredLanguages("de-DE,fr;q=0.8,en;q=0.9")).toEqual(["de", "en", "fr"]);
    expect(preferredLanguages(null)).toEqual([]);
  });

  it("lets the phone language decide when we offer it", () => {
    expect(countryLocale("en-US", "SN", LOCALES)).toBeNull();
    expect(countryLocale("de-DE,fr;q=0.5", "DE", LOCALES)).toBeNull();
  });

  it("falls back to the country when the phone language isn't offered", () => {
    expect(countryLocale("wo-SN", "SN", LOCALES)).toBe("fr");
    expect(countryLocale("ar-MA", "ma", LOCALES)).toBe("fr");
    expect(countryLocale("qu", "PE", LOCALES)).toBe("es");
    expect(countryLocale(null, "CI", LOCALES)).toBe("fr");
    expect(countryLocale("de-DE", "DE", LOCALES)).toBeNull();
    expect(countryLocale("de-DE", null, LOCALES)).toBeNull();
  });
});
