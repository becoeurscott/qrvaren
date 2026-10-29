import { describe, expect, it } from "vitest";
import { flag, joinPhone, splitPhone } from "./phone";

describe("phone", () => {
  it("draws flags", () => {
    expect(flag("US")).toBe("🇺🇸");
    expect(flag("fr")).toBe("🇫🇷");
  });
  it("joins country code and local number, dropping the trunk 0", () => {
    expect(joinPhone("FR", "06 12 34 56 78")).toBe("+33 6 12 34 56 78");
    expect(joinPhone("US", "555 010 2030")).toBe("+1 555 010 2030");
    expect(joinPhone("US", "+44 20 7946 0000")).toBe("+44 20 7946 0000");
    expect(joinPhone("US", "")).toBe("");
  });
  it("splits stored numbers back", () => {
    expect(splitPhone("+33 6 12 34 56 78")).toEqual({ iso: "FR", local: "6 12 34 56 78" });
    expect(splitPhone("+351 912 345 678")).toEqual({ iso: "PT", local: "912 345 678" });
    expect(splitPhone("+1 555 010 2030", "CA")).toEqual({ iso: "CA", local: "555 010 2030" });
    expect(splitPhone("555 010 2030")).toEqual({ iso: "US", local: "555 010 2030" });
  });
});
