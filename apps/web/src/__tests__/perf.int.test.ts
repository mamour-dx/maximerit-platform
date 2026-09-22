// @vitest-environment node
// Phase 10 — Performance : recherche vivier à gros volume (Meilisearch) + pagination.
import { describe, it, expect, beforeAll } from "vitest";
import { ensureIndex, meili, CANDIDATES_INDEX, searchCandidates } from "@/lib/search";

const VOLUME = 3000;
const CANONICAL = {
  discipline: "geologie-exploration", commodities: ["gold"], languagesAny: ["fr", "en"],
  minYearsExperience: 8, mobilityCountry: "GN", maxAvailabilityDays: 60,
};

function makeDoc(i: number) {
  const match = i % 500 === 0; // ~6 correspondances parfaites sur 3000
  return {
    id: 100000 + i,
    name: match ? `Match Geologist ${i}` : `Candidate ${i}`,
    currentPosition: match ? "Resource Geologist" : "Accountant",
    sector: "mines-ressources-naturelles",
    disciplines: [match ? "geologie-exploration" : "finance-miniere"],
    commodities: [match ? "gold" : "bauxite"],
    countriesExperience: [match ? "GN" : "SN"],
    mobileTo: match ? ["GN", "SN"] : ["SN"],
    languages: match ? ["fr", "en"] : ["pt"],
    seniority: "senior",
    yearsExperience: match ? 9 : 3,
    availabilityDays: match ? 45 : 120,
    status: "vivier",
    tags: [] as string[],
    _text: match ? "resource geologist gold" : "accountant",
  };
}

beforeAll(async () => {
  await ensureIndex();
  const client = meili();
  const del = await client.index(CANDIDATES_INDEX).deleteAllDocuments();
  await client.tasks.waitForTask(del.taskUid);
  const docs = Array.from({ length: VOLUME }, (_, i) => makeDoc(i));
  for (let i = 0; i < docs.length; i += 1000) {
    const task = await client.index(CANDIDATES_INDEX).addDocuments(docs.slice(i, i + 1000), { primaryKey: "id" });
    await client.tasks.waitForTask(task.taskUid);
  }
}, 120000);

describe("recherche à gros volume (3000 candidats)", () => {
  it("filtre correctement et reste rapide", async () => {
    const res = await searchCandidates({ ...CANONICAL, limit: 20 });
    // Toutes les correspondances sont des géologues gold mobiles GN dispo ≤60j 8+ ans
    expect(res.estimatedTotalHits).toBeGreaterThan(0);
    expect(res.hits.every((h) => (h as { commodities: string[] }).commodities.includes("gold"))).toBe(true);
    // Budget de performance Meilisearch (traitement serveur).
    expect(res.processingTimeMs).toBeLessThan(150);
  });

  it("pagination : limit + offset", async () => {
    const page1 = await searchCandidates({ status: "vivier", limit: 10, offset: 0 });
    const page2 = await searchCandidates({ status: "vivier", limit: 10, offset: 10 });
    expect(page1.hits.length).toBe(10);
    expect(page2.hits.length).toBe(10);
    const ids1 = new Set(page1.hits.map((h) => h.id));
    expect(page2.hits.some((h) => ids1.has(h.id))).toBe(false); // pages disjointes
  });
});
