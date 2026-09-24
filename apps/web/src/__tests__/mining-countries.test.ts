import { describe, it, expect } from "vitest";
import { MINING_COUNTRIES, countryParams, findCountry, countryPaths } from "@/lib/mining-countries";

describe("pages pays Mining", () => {
  it("7 pays prioritaires", () => {
    expect(countryParams().length).toBe(7);
    expect(countryPaths()).toContain("/mines/guinee/");
  });

  it("résolution slug → pays", () => {
    const sn = findCountry("senegal");
    expect(sn?.label).toBe("Sénégal");
    expect(sn?.commodities).toContain("Or");
    expect(findCountry("nope")).toBeNull();
  });

  it("chaque pays porte une valeur locale (commodities + contexte)", () => {
    for (const c of MINING_COUNTRIES) {
      expect(c.commodities.length).toBeGreaterThan(0);
      expect(c.context.length).toBeGreaterThan(20);
    }
  });

  it("slugs uniques", () => {
    const slugs = MINING_COUNTRIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
