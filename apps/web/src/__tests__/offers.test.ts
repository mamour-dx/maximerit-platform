import { describe, it, expect } from "vitest";
import redirects from "@/redirects.generated.json";
import { getService } from "@/lib/content";
import { OFFERS, getOffer, offerPath, offersOf } from "@/lib/offers";
import { STATIC_INDEXABLE } from "@/lib/seo";

const table = redirects as Record<string, { to?: string; status: number }>;

describe("prestations (reprise de l'ancien site)", () => {
  it("chaque prestation est rattachée à un pôle existant, slug unique dans son pôle", () => {
    for (const o of OFFERS) expect(getService(o.service), o.slug).not.toBeNull();
    const keys = OFFERS.map((o) => `${o.service}/${o.slug}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(getOffer("qhse-esg", "strategie-esg")?.title).toMatch(/ESG/);
    expect(getOffer("qhse-esg", "inexistant")).toBeNull();
    expect(offersOf("qhse-esg").length).toBe(5);
    expect(offersOf("externalisation-rh-paie").length).toBe(4);
  });

  it("contenu FR et EN renseigné", () => {
    for (const o of OFFERS) {
      for (const v of [o.title, o.intro, o.body, o.titleEn, o.introEn, o.bodyEn]) expect(v.length, o.slug).toBeGreaterThan(10);
      expect(o.bullets.length).toBe(o.bulletsEn.length);
    }
  });

  it("chaque ancienne URL redirige (301) vers sa prestation", () => {
    for (const o of OFFERS)
      for (const legacy of o.legacy) expect(table[legacy], legacy).toEqual({ to: offerPath(o), status: 301 });
  });

  it("prestations FR et EN dans le sitemap", () => {
    for (const o of OFFERS) {
      expect(STATIC_INDEXABLE).toContain(offerPath(o));
      expect(STATIC_INDEXABLE).toContain(`/en${offerPath(o)}`);
    }
  });
});
