import { describe, it, expect } from "vitest";
import {
  parseJobFilters,
  hasActiveFilters,
  filterJobs,
  jobFacets,
  similarJobs,
  contractLabel,
  countryLabel,
  disciplineLabel,
  postedLabel,
  isNew,
  type BoardJob,
} from "@/lib/job-board";

const NOW = new Date("2026-10-12T12:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 864e5).toISOString();
const future = new Date(NOW.getTime() + 30 * 864e5).toISOString();

const JOBS: BoardJob[] = [
  { id: 1, title: "Géologue d'exploration senior", country: "SN", location: "Kédougou", discipline: "geologie-exploration", contractType: "cdi", status: "publiee", publishedAt: daysAgo(2), expiresAt: future, mission: "Campagnes de forage aurifère" },
  { id: 2, title: "Resource Geologist", country: "GN", location: "Boké", discipline: "geologie-exploration", contractType: "fifo-roster", status: "publiee", publishedAt: daysAgo(10), expiresAt: future },
  { id: 3, title: "Mine Planning Engineer", country: "SN", location: "Sabodala", discipline: "exploitation-operations", contractType: "cdi", status: "publiee", publishedAt: daysAgo(1), expiresAt: future },
  { id: 4, title: "Contrôleur de gestion minier", country: "CI", discipline: "finance-miniere", contractType: "cdd", status: "publiee", publishedAt: daysAgo(40), expiresAt: future },
  { id: 5, title: "Géologue (expirée)", country: "SN", discipline: "geologie-exploration", contractType: "cdi", status: "publiee", publishedAt: daysAgo(60), expiresAt: daysAgo(1) },
  { id: 6, title: "Géologue (brouillon)", country: "SN", discipline: "geologie-exploration", contractType: "cdi", status: "brouillon", expiresAt: future },
];

describe("parseJobFilters", () => {
  it("lit et borne les paramètres, prend la 1re valeur d'un tableau", () => {
    const f = parseJobFilters({ q: "  geologue ", country: ["SN", "GN"], contract: "cdi" });
    expect(f).toEqual({ q: "geologue", country: "SN", discipline: "", contract: "cdi" });
    expect(parseJobFilters({ q: "x".repeat(500) }).q).toHaveLength(80);
  });
  it("hasActiveFilters", () => {
    expect(hasActiveFilters(parseJobFilters({}))).toBe(false);
    expect(hasActiveFilters(parseJobFilters({ discipline: "finance-miniere" }))).toBe(true);
  });
});

describe("filterJobs", () => {
  const all = parseJobFilters({});
  it("ne retourne que les offres live, les plus récentes d'abord", () => {
    expect(filterJobs(JOBS, all, "fr", NOW).map((j) => j.id)).toEqual([3, 1, 2, 4]);
  });
  it("recherche plein texte insensible à la casse et aux accents (tous les termes)", () => {
    expect(filterJobs(JOBS, parseJobFilters({ q: "GEOLOGUE senior" }), "fr", NOW).map((j) => j.id)).toEqual([1]);
    expect(filterJobs(JOBS, parseJobFilters({ q: "forage" }), "fr", NOW).map((j) => j.id)).toEqual([1]);
  });
  it("recherche aussi sur le libellé du pays et du pôle", () => {
    expect(filterJobs(JOBS, parseJobFilters({ q: "guinée" }), "fr", NOW).map((j) => j.id)).toEqual([2]);
    expect(filterJobs(JOBS, parseJobFilters({ q: "finance" }), "fr", NOW).map((j) => j.id)).toEqual([4]);
  });
  it("combine pays, pôle et contrat", () => {
    expect(filterJobs(JOBS, parseJobFilters({ country: "sn" }), "fr", NOW).map((j) => j.id)).toEqual([3, 1]);
    expect(filterJobs(JOBS, parseJobFilters({ country: "SN", discipline: "geologie-exploration" }), "fr", NOW).map((j) => j.id)).toEqual([1]);
    expect(filterJobs(JOBS, parseJobFilters({ contract: "fifo-roster" }), "fr", NOW).map((j) => j.id)).toEqual([2]);
  });
});

describe("jobFacets", () => {
  it("compte uniquement les offres live, triées par fréquence", () => {
    const f = jobFacets(JOBS, "fr", NOW);
    expect(f.countries).toEqual([
      { value: "SN", label: "Sénégal", count: 2 },
      { value: "CI", label: "Côte d'Ivoire", count: 1 },
      { value: "GN", label: "Guinée", count: 1 },
    ]);
    expect(f.disciplines[0]).toEqual({ value: "geologie-exploration", label: "Géologie & Exploration", count: 2 });
    expect(f.contracts.find((c) => c.value === "cdi")?.count).toBe(2);
  });
  it("libellés anglais", () => {
    expect(jobFacets(JOBS, "en", NOW).countries[0].label).toBe("Senegal");
  });
});

describe("similarJobs", () => {
  it("privilégie le même pôle, puis le même pays ; exclut l'offre courante et les non-live", () => {
    expect(similarJobs(JOBS[0], JOBS, 3, NOW).map((j) => j.id)).toEqual([2, 3]);
  });
});

describe("libellés", () => {
  it("contrat, pays, pôle (avec repli sur la valeur brute)", () => {
    expect(contractLabel("cdi", "fr")).toBe("CDI");
    expect(contractLabel("cdi", "en")).toBe("Permanent");
    expect(contractLabel("autre", "fr")).toBe("autre");
    expect(countryLabel("gn", "en")).toBe("Guinea");
    expect(countryLabel("Togo", "fr")).toBe("Togo");
    expect(disciplineLabel("finance-miniere", "en")).toBe("Finance");
  });
  it("date relative de publication", () => {
    expect(postedLabel(daysAgo(0), "fr", NOW)).toBe("Publiée aujourd'hui");
    expect(postedLabel(daysAgo(1), "en", NOW)).toBe("Posted yesterday");
    expect(postedLabel(daysAgo(5), "fr", NOW)).toBe("Publiée il y a 5 jours");
    expect(postedLabel(daysAgo(40), "en", NOW)).toMatch(/^Posted \d+ \w+ 2026$/);
    expect(postedLabel(null, "fr", NOW)).toBe("");
  });
  it("badge « nouvelle » < 7 jours", () => {
    expect(isNew(daysAgo(3), NOW)).toBe(true);
    expect(isNew(daysAgo(8), NOW)).toBe(false);
  });
});
