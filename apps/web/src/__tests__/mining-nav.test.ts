import { describe, it, expect } from "vitest";
import { disciplineParams, findDiscipline, specialtyParams, findSpecialty, miningIndexablePaths, disciplineRoles } from "@/lib/mining-nav";

describe("mining-nav", () => {
  it("4 disciplines paramétrées", () => {
    expect(disciplineParams().length).toBe(4);
    expect(findDiscipline("geologie-exploration")?.slug).toBe("geologie-exploration");
    expect(findDiscipline("inexistant")).toBeNull();
  });

  it("26 fiches métiers paramétrées, résolution slug → discipline", () => {
    expect(specialtyParams().length).toBe(26);
    const r = findSpecialty("exploration-geologist");
    expect(r?.specialty.label_fr).toBeTruthy();
    expect(r?.discipline.slug).toBe("geologie-exploration");
    expect(findSpecialty("nope")).toBeNull();
  });

  it("chemins indexables du silo (disciplines + métiers + listing)", () => {
    const paths = miningIndexablePaths();
    expect(paths).toContain("/mines/metiers/");
    expect(paths).toContain("/mines/geologie-exploration/");
    expect(paths).toContain("/mines/metiers/exploration-geologist/");
    expect(paths.length).toBe(1 + 4 + 26);
  });

  it("métiers transverses (crossRefs) listés dans leur pôle de renvoi, sans dupliquer la fiche", () => {
    const leadership = findDiscipline("executive-search-mining")!;
    const slugs = disciplineRoles(leadership).map((s) => s.slug);
    expect(slugs).toContain("cfo-mining"); // Directeur financier : fiche canonique en Finance
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(findSpecialty("cfo-mining")?.discipline.slug).toBe("finance-miniere");
    expect(specialtyParams().filter((p) => p.slug === "cfo-mining")).toHaveLength(1);
  });
});
