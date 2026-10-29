import { describe, expect, it } from "vitest";
import { safeNext } from "./safeNext";

describe("safeNext", () => {
  it("keeps site paths and rejects anything else", () => {
    expect(safeNext("/dashboard/card")).toBe("/dashboard/card");
    expect(safeNext("//evil.com")).toBeNull();
    expect(safeNext("https://evil.com")).toBeNull();
    expect(safeNext("/a?b=c")).toBeNull();
    expect(safeNext("")).toBeNull();
  });
});
