import { describe, it, expect } from "vitest";
import { SECURITY_HEADERS, headersConfig } from "@/lib/security-headers";

const get = (k: string) => SECURITY_HEADERS.find((h) => h.key === k)?.value;

describe("en-têtes de sécurité", () => {
  it("inclut les protections essentielles", () => {
    expect(get("X-Content-Type-Options")).toBe("nosniff");
    expect(get("X-Frame-Options")).toBe("SAMEORIGIN");
    expect(get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(get("Strict-Transport-Security")).toContain("max-age=");
    expect(get("Permissions-Policy")).toContain("geolocation=()");
  });
  it("s'applique à toutes les routes", () => {
    const cfg = headersConfig();
    expect(cfg[0].source).toBe("/:path*");
    expect(cfg[0].headers).toBe(SECURITY_HEADERS);
  });
});
