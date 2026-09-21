// @vitest-environment node
// Intégration Phase 5c : indexation Meilisearch + recherche multicritère (requête canonique).
import { describe, it, expect, beforeAll } from "vitest";
import { ensureIndex, indexCandidate, searchCandidates, meili, CANDIDATES_INDEX } from "@/lib/search";
import { POST as searchPOST } from "@/app/search-candidates/route";

const MATCH = {
  id: 90001, firstName: "Awa", lastName: "Diop", targetDiscipline: "geologie-exploration",
  languages: [{ code: "fr" }, { code: "en" }], yearsExperience: 9, availabilityDays: 45,
  mining: { commodities: ["gold"], countriesExperience: ["GN"] }, status: "vivier",
};
const NO_MATCH = {
  id: 90002, firstName: "Bob", lastName: "Martin", targetDiscipline: "finance-miniere",
  languages: [{ code: "fr" }], yearsExperience: 5, availabilityDays: 90,
  mining: { commodities: ["bauxite"] }, status: "vivier",
};

const CANONICAL = {
  discipline: "geologie-exploration", commodities: ["gold"], languagesAny: ["fr", "en"],
  minYearsExperience: 8, mobilityCountry: "GN", maxAvailabilityDays: 60,
};

beforeAll(async () => {
  await ensureIndex();
  const client = meili();
  const t = await client.index(CANDIDATES_INDEX).deleteAllDocuments();
  await client.tasks.waitForTask(t.taskUid);
  await indexCandidate(MATCH);
  await indexCandidate(NO_MATCH);
}, 60000);

describe("recherche vivier — requête canonique", () => {
  it("retourne le géologue Gold francophone/anglophone 8+ ans mobile GN dispo 60j", async () => {
    const res = await searchCandidates(CANONICAL);
    const ids = res.hits.map((h) => h.id);
    expect(ids).toContain(90001);
    expect(ids).not.toContain(90002);
  });

  it("chaque critère filtre (moins d'expérience => exclu)", async () => {
    const res = await searchCandidates({ ...CANONICAL, minYearsExperience: 12 });
    expect(res.hits.map((h) => h.id)).not.toContain(90001);
  });

  it("recherche plein texte sur le nom/poste", async () => {
    const res = await searchCandidates({ text: "Awa" });
    expect(res.hits.map((h) => h.id)).toContain(90001);
  });

  it("l'endpoint /search-candidates refuse sans authentification (401)", async () => {
    const res = await searchPOST(new Request("http://localhost/search-candidates", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }));
    expect(res.status).toBe(401);
  });
});
