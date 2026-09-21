import { describe, it, expect } from "vitest";
import { structureCv } from "@/lib/cv-parse";

const CV = `Awa Diop
Resource Geologist

Email: awa.diop@example.com
Téléphone: +221 77 123 45 67
9 ans d'expérience dans l'exploration aurifère (gold) au Sénégal et en Guinée.

Langues: Français (natif), Anglais (courant)

Compétences
Modélisation de ressources, QAQC, Leapfrog, estimation

Certifications
JORC, SLR

Formation
Master Géologie - UCAD 2012

Expériences
2018 – présent : Resource Geologist, Endeavour Mining
2014 – 2018 : Mine Geologist, Teranga Gold`;

describe("structureCv", () => {
  const p = structureCv(CV);

  it("extrait email et téléphone", () => {
    expect(p.email).toBe("awa.diop@example.com");
    expect(p.phone).toContain("221");
  });

  it("détecte les langues avec niveau", () => {
    expect(p.languages).toEqual(
      expect.arrayContaining([
        { code: "fr", proficiency: "natif" },
        { code: "en", proficiency: "courant" },
      ]),
    );
  });

  it("détecte commodities et pays (Mining)", () => {
    expect(p.commodities).toContain("gold");
    expect(p.countries).toEqual(expect.arrayContaining(["SN", "GN"]));
  });

  it("extrait années d'expérience, nom et poste", () => {
    expect(p.yearsExperience).toBe(9);
    expect(p.name).toBe("Awa Diop");
    expect(p.currentPosition).toMatch(/Geologist/i);
  });

  it("extrait compétences, certifications, expériences", () => {
    expect(p.skills).toEqual(expect.arrayContaining(["QAQC"]));
    expect(p.certifications).toEqual(expect.arrayContaining(["JORC", "SLR"]));
    expect(p.experiences.length).toBeGreaterThanOrEqual(2);
  });

  it("ne renvoie rien d'aberrant sur un texte vide", () => {
    const empty = structureCv("");
    expect(empty.languages).toEqual([]);
    expect(empty.email).toBeUndefined();
  });
});
