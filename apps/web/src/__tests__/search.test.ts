import { describe, it, expect } from "vitest";
import { buildMeiliFilter, toSearchDoc } from "@/lib/search";

describe("buildMeiliFilter (filtres métier → Meilisearch)", () => {
  it("traduit la requête canonique du cahier", () => {
    const F = buildMeiliFilter({
      discipline: "geologie-exploration",
      commodities: ["gold"],
      languagesAny: ["fr", "en"],
      minYearsExperience: 8,
      mobilityCountry: "GN",
      maxAvailabilityDays: 60,
    });
    expect(F).toContain('disciplines = "geologie-exploration"');
    expect(F).toContain('commodities IN ["gold"]');
    expect(F).toContain('languages IN ["fr", "en"]');
    expect(F).toContain("yearsExperience >= 8");
    expect(F).toContain("availabilityDays <= 60");
    expect(F).toContain('mobileTo = "GN"');
  });

  it("échappe les guillemets (anti-injection de filtre)", () => {
    expect(buildMeiliFilter({ sector: 'a"b' })).toEqual(['sector = "ab"']);
  });
});

describe("toSearchDoc", () => {
  it("calcule mobileTo et aplatit le profil", () => {
    const doc = toSearchDoc({
      id: 1, firstName: "Awa", lastName: "Diop", targetDiscipline: "geologie-exploration",
      languages: [{ code: "fr" }, { code: "en" }],
      mining: { commodities: ["gold"], countriesExperience: ["GN"] },
      yearsExperience: 9,
    });
    expect(doc.name).toBe("Awa Diop");
    expect(doc.disciplines).toContain("geologie-exploration");
    expect(doc.commodities).toContain("gold");
    expect(doc.mobileTo).toContain("GN"); // expérience en Guinée => mobilité de fait
    expect(doc.languages).toEqual(["fr", "en"]);
  });

  it("internationalMobility => mobileTo couvre l'Afrique de l'Ouest", () => {
    const doc = toSearchDoc({ id: 2, internationalMobility: true, mining: {} });
    expect(doc.mobileTo).toEqual(expect.arrayContaining(["SN", "GN", "CI", "ML", "MR", "BF", "GH"]));
  });
});
