import { describe, expect, it, vi } from "vitest";
import worker, { slugFromHost, targetUrl } from "./worker.js";

describe("card subdomain worker", () => {
  it("reads the card slug from the host", () => {
    expect(slugFromHost("bluebakery.qrvaren.online")).toBe("bluebakery");
    expect(slugFromHost("Blue-Bakery.QRVAREN.online")).toBe("blue-bakery");
  });

  it("ignores the apex, www, reserved, nested and foreign hosts", () => {
    for (const h of ["qrvaren.online", "www.qrvaren.online", "admin.qrvaren.online", "a.b.qrvaren.online", "evil.com", "-x.qrvaren.online"]) {
      expect(slugFromHost(h), h).toBeNull();
    }
  });

  it("maps the root to the card page and keeps other paths", () => {
    expect(targetUrl("https://bluebakery.qrvaren.online/", "bluebakery").toString()).toBe("https://qrvaren.online/c/bluebakery");
    expect(targetUrl("https://bluebakery.qrvaren.online/_next/static/a.js?v=1", "bluebakery").toString()).toBe("https://qrvaren.online/_next/static/a.js?v=1");
  });

  it("redirects www to the apex", async () => {
    const res = await worker.fetch(new Request("https://www.qrvaren.online/fr/create"));
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe("https://qrvaren.online/fr/create");
  });

  it("proxies a card and keeps redirects on the subdomain", async () => {
    const fetchMock = vi.fn(async (url: URL, init: RequestInit) => {
      expect(url.toString()).toBe("https://qrvaren.online/c/bluebakery");
      expect(new Headers(init.headers).get("x-card-host")).toBe("bluebakery.qrvaren.online");
      return new Response(null, { status: 308, headers: { location: "https://qrvaren.online/c/bluebakery/?ref=qr" } });
    });
    vi.stubGlobal("fetch", fetchMock);
    const res = await worker.fetch(new Request("https://bluebakery.qrvaren.online/"));
    expect(res.headers.get("location")).toBe("https://bluebakery.qrvaren.online/?ref=qr");
    vi.unstubAllGlobals();
  });
});
