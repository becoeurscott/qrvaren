import { describe, expect, it } from "vitest";
import { TO_FILL, legalReady } from "./config";

describe("legalReady", () => {
  const full = { name: "Acme LLC", address: "1 Main St, Springfield", country: "USA", email: "hi@acme.test" };
  it("is true only when every legal detail is filled", () => {
    expect(legalReady(full)).toBe(true);
    for (const k of Object.keys(full) as (keyof typeof full)[]) {
      expect(legalReady({ ...full, [k]: TO_FILL }), k).toBe(false);
      expect(legalReady({ ...full, [k]: "" }), k).toBe(false);
    }
  });
});
