// Phase 5c — Recherche du vivier via Meilisearch. Réutilise la sémantique du domaine (Phase 1).
import { Meilisearch } from "meilisearch";
import { isMobileTo, type CandidateProfile } from "@maximerit/domain";

const WEST_AFRICA = ["SN", "GN", "CI", "ML", "MR", "BF", "GH"];
export const CANDIDATES_INDEX = "candidates";

export function meili(): Meilisearch {
  return new Meilisearch({
    host: process.env.MEILI_HOST || "http://localhost:7700",
    apiKey: process.env.MEILI_MASTER_KEY || "masterKey_dev_change_me",
  });
}

export interface CandidateSearchDoc {
  id: number | string;
  name: string;
  currentPosition?: string;
  sector?: string;
  disciplines: string[];
  commodities: string[];
  countriesExperience: string[];
  mobileTo: string[];
  languages: string[];
  seniority?: string;
  yearsExperience: number | null;
  availabilityDays: number | null;
  status?: string;
  tags: (string | number)[];
  _text: string;
}

type CandidateLike = Omit<CandidateProfile, "tags"> & {
  id: number | string;
  firstName?: string;
  lastName?: string;
  tags?: (string | number | { slug?: string; id?: number })[];
};

export function toSearchDoc(c: CandidateLike): CandidateSearchDoc {
  const mining = c.mining ?? {};
  const disciplines = [c.targetDiscipline, ...(mining.disciplines ?? [])].filter(Boolean) as string[];
  // isMobileTo n'utilise pas `tags` ; cast pour réconcilier la forme des tags.
  const mobileTo = WEST_AFRICA.filter((code) => isMobileTo(c as unknown as CandidateProfile, code));
  return {
    id: c.id,
    name: `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim(),
    currentPosition: c.currentPosition,
    sector: c.sector,
    disciplines,
    commodities: mining.commodities ?? [],
    countriesExperience: mining.countriesExperience ?? [],
    mobileTo,
    languages: (c.languages ?? []).map((l) => l.code),
    seniority: c.seniority,
    yearsExperience: c.yearsExperience ?? null,
    availabilityDays: c.availabilityDays ?? null,
    status: c.status,
    tags: (c.tags ?? []).map((t) => (typeof t === "object" ? t.slug ?? t.id ?? "" : t)),
    _text: [c.firstName, c.lastName, c.currentPosition, c.currentCompany, ...(mining.commodities ?? []), ...disciplines]
      .filter(Boolean)
      .join(" "),
  };
}

const FILTERABLE = [
  "sector", "disciplines", "commodities", "countriesExperience", "mobileTo",
  "languages", "seniority", "yearsExperience", "availabilityDays", "status", "tags",
];

/** Crée l'index si besoin et applique les attributs filtrables/triables (idempotent). */
export async function ensureIndex() {
  const client = meili();
  await client.createIndex(CANDIDATES_INDEX, { primaryKey: "id" }).catch(() => {});
  const index = client.index(CANDIDATES_INDEX);
  const t1 = await index.updateFilterableAttributes(FILTERABLE);
  await client.tasks.waitForTask(t1.taskUid);
  const t2 = await index.updateSortableAttributes(["yearsExperience", "availabilityDays"]);
  await client.tasks.waitForTask(t2.taskUid);
  return index;
}

export async function indexCandidate(c: CandidateLike): Promise<void> {
  try {
    const client = meili();
    const task = await client.index(CANDIDATES_INDEX).addDocuments([toSearchDoc(c)], { primaryKey: "id" });
    await client.tasks.waitForTask(task.taskUid);
  } catch {
    // Fail-soft : la recherche ne doit jamais bloquer la création d'un candidat.
  }
}

export async function removeCandidate(id: number | string): Promise<void> {
  try {
    await meili().index(CANDIDATES_INDEX).deleteDocument(id);
  } catch {
    /* fail-soft */
  }
}

export interface SearchFilters {
  text?: string;
  sector?: string;
  discipline?: string;
  commodities?: string[];
  languagesAny?: string[];
  minYearsExperience?: number;
  maxAvailabilityDays?: number;
  mobilityCountry?: string;
  seniorityMin?: string;
  status?: string;
  limit?: number;
}

const quote = (s: unknown) => `"${String(s).replace(/"/g, "")}"`;

/** Traduit les filtres métier en expressions de filtre Meilisearch. */
export function buildMeiliFilter(f: SearchFilters): string[] {
  const F: string[] = [];
  if (f.sector) F.push(`sector = ${quote(f.sector)}`);
  if (f.discipline) F.push(`disciplines = ${quote(f.discipline)}`);
  if (f.commodities?.length) F.push(`commodities IN [${f.commodities.map(quote).join(", ")}]`);
  if (f.languagesAny?.length) F.push(`languages IN [${f.languagesAny.map(quote).join(", ")}]`);
  if (f.minYearsExperience != null) F.push(`yearsExperience >= ${Number(f.minYearsExperience)}`);
  if (f.maxAvailabilityDays != null) F.push(`availabilityDays <= ${Number(f.maxAvailabilityDays)}`);
  if (f.mobilityCountry) F.push(`mobileTo = ${quote(f.mobilityCountry)}`);
  if (f.status) F.push(`status = ${quote(f.status)}`);
  return F;
}

export async function searchCandidates(f: SearchFilters) {
  const index = meili().index(CANDIDATES_INDEX);
  return index.search(f.text ?? "", { filter: buildMeiliFilter(f), limit: f.limit ?? 20 });
}
