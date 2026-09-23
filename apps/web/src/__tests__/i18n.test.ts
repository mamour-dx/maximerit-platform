import { describe, it, expect } from "vitest";
import { hreflang, counterpartPath, LOCALES } from "@/lib/i18n";

describe("hreflang", () => {
  it("mappe fr/en + x-default (FR)", () => {
    expect(hreflang("/mines/", "/en/mines/")).toEqual({
      fr: "/mines/",
      en: "/en/mines/",
      "x-default": "/mines/",
    });
  });
});

describe("counterpartPath", () => {
  it("FR → EN (préfixe /en)", () => {
    expect(counterpartPath("/")).toEqual({ locale: "en", href: "/en/" });
    expect(counterpartPath("/mines/")).toEqual({ locale: "en", href: "/en/mines/" });
  });
  it("EN → FR (retire /en)", () => {
    expect(counterpartPath("/en/")).toEqual({ locale: "fr", href: "/" });
    expect(counterpartPath("/en/contact/")).toEqual({ locale: "fr", href: "/contact/" });
  });
  it("réciprocité", () => {
    for (const p of ["/", "/mines/", "/contact/"]) {
      const en = counterpartPath(p).href;
      expect(counterpartPath(en).href).toBe(p);
    }
  });
  it("expose fr et en", () => {
    expect(LOCALES).toEqual(["fr", "en"]);
  });
});
