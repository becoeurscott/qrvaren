import { describe, expect, it } from "vitest";
import { checkCapacity, encode, normalizeUrl } from "./encoders";
import { contrastRatio, readabilityIssues } from "./contrast";

describe("encode", () => {
  it("builds WiFi strings with escaping", () => {
    expect(encode({ type: "wifi", wifi: { ssid: "My;Net", password: 'p"w', encryption: "WPA" } })).toBe(
      'WIFI:T:WPA;S:My\\;Net;P:p\\"w;;',
    );
  });
  it("allows open WiFi without password", () => {
    expect(encode({ type: "wifi", wifi: { ssid: "Cafe", encryption: "nopass" } })).toBe("WIFI:T:nopass;S:Cafe;;");
  });
  it("rejects secured WiFi without password", () => {
    expect(encode({ type: "wifi", wifi: { ssid: "Cafe", encryption: "WPA" } })).toBeNull();
  });
  it("builds vCard 3.0", () => {
    const v = encode({ type: "vcard", vcard: { firstName: "Ann", lastName: "Lee", org: "A, B", phone: "+1 555" } });
    expect(v).toContain("BEGIN:VCARD\nVERSION:3.0\nN:Lee;Ann;;;\nFN:Ann Lee");
    expect(v).toContain("ORG:A\\, B");
    expect(v?.endsWith("END:VCARD")).toBe(true);
  });
  it("builds mailto with encoded subject", () => {
    expect(encode({ type: "email", email: { to: "a@b.co", subject: "Hi there" } })).toBe("mailto:a@b.co?subject=Hi%20there");
  });
  it("builds SMSTO", () => {
    expect(encode({ type: "sms", sms: { phone: "+1 (555) 010", message: "Yo" } })).toBe("SMSTO:+1555010:Yo");
  });
});

describe("normalizeUrl", () => {
  it("adds https", () => expect(normalizeUrl("example.com")).toBe("https://example.com/"));
  it("rejects javascript:", () => expect(normalizeUrl("javascript:alert(1)")).toBeNull());
  it("rejects bare words", () => expect(normalizeUrl("hello")).toBeNull());
});

describe("capacity & readability", () => {
  it("flags long payloads", () => expect(checkCapacity("x".repeat(1000), "M").ok).toBe(false));
  it("accepts short payloads", () => expect(checkCapacity("hello", "H").ok).toBe(true));
  it("computes contrast", () => expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21));
  it("flags low contrast and big logos", () => {
    expect(readabilityIssues({ fg: "#777777", bg: "#888888", logoRatio: 0.4 })).toEqual(["low_contrast", "logo_too_big"]);
  });
  it("flags inverted codes", () => expect(readabilityIssues({ fg: "#ffffff", bg: "#000000" })).toEqual(["inverted"]));
});
