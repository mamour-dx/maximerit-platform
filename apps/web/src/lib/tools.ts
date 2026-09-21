// Phase 7 — Outils d'acquisition B2B (moteur PUR, testable). Résultats INDICATIFS, méthodologie
// explicite (cahier §12). Réglages centralisés ici pour ajustement facile par l'équipe.

export interface ToolError { errors: string[] }
const WORKING_DAYS_PER_YEAR = 260;

// ---------- 1. Coût d'un poste vacant (Cost of Vacancy) ----------
export interface VacancyInput { monthlySalary: number; vacancyDays: number; impactFactor?: number }
export interface VacancyResult { dailyValue: number; total: number; methodology: string }
export function costOfVacancy(i: VacancyInput): VacancyResult | ToolError {
  const errors: string[] = [];
  if (!(i.monthlySalary > 0)) errors.push("salaire mensuel > 0 requis");
  if (!(i.vacancyDays > 0)) errors.push("durée de vacance (jours) > 0 requise");
  const factor = i.impactFactor ?? 1.3; // surcharge équipe + retard projet
  if (!(factor > 0)) errors.push("facteur d'impact > 0 requis");
  if (errors.length) return { errors };
  const dailyValue = Math.round(((i.monthlySalary * 12) / WORKING_DAYS_PER_YEAR) * 100) / 100;
  const total = Math.round(dailyValue * i.vacancyDays * factor);
  return { dailyValue, total, methodology: `Valeur quotidienne = salaire annuel / ${WORKING_DAYS_PER_YEAR} jours ouvrés, × jours de vacance × facteur d'impact ${factor}.` };
}

// ---------- 2. Coût d'un recrutement (Cost of Recruitment) ----------
export type RecruitmentChannel = "interne" | "agence" | "mixte";
const RECRUITMENT_RATE: Record<RecruitmentChannel, number> = { interne: 0.15, agence: 0.2, mixte: 0.17 };
export interface RecruitmentInput { annualSalary: number; channel: RecruitmentChannel }
export interface RecruitmentResult { rate: number; total: number; methodology: string }
export function costOfRecruitment(i: RecruitmentInput): RecruitmentResult | ToolError {
  const errors: string[] = [];
  if (!(i.annualSalary > 0)) errors.push("salaire annuel > 0 requis");
  if (!(i.channel in RECRUITMENT_RATE)) errors.push("canal invalide (interne|agence|mixte)");
  if (errors.length) return { errors };
  const rate = RECRUITMENT_RATE[i.channel];
  return { rate, total: Math.round(i.annualSalary * rate), methodology: `Coût = salaire annuel × taux indicatif du canal (${Math.round(rate * 100)} %).` };
}

// ---------- 3. Benchmark salaire ----------
// Base annuelle indicative (EUR) par discipline Mining, ajustée pays et expérience.
const SALARY_BASE: Record<string, number> = {
  "geologie-exploration": 55000,
  "exploitation-operations": 60000,
  "finance-miniere": 65000,
  "leadership-executive-search": 110000,
};
const COUNTRY_MULT: Record<string, number> = { SN: 1, GN: 1.05, CI: 1, ML: 1.05, MR: 1.1, BF: 1, GH: 1 };
export interface BenchmarkInput { discipline: string; country: string; yearsExperience: number }
export interface BenchmarkResult { min: number; median: number; max: number; methodology: string }
export function salaryBenchmark(i: BenchmarkInput): BenchmarkResult | ToolError {
  const errors: string[] = [];
  if (!SALARY_BASE[i.discipline]) errors.push("discipline Mining inconnue");
  if (!COUNTRY_MULT[i.country]) errors.push("pays hors périmètre prioritaire");
  if (!(i.yearsExperience >= 0)) errors.push("années d'expérience >= 0 requises");
  if (errors.length) return { errors };
  const seniority = 1 + Math.min(i.yearsExperience, 20) * 0.03; // +3 %/an, plafonné à 20 ans
  const median = Math.round(SALARY_BASE[i.discipline] * COUNTRY_MULT[i.country] * seniority);
  return { min: Math.round(median * 0.85), median, max: Math.round(median * 1.2), methodology: "Base par discipline × coefficient pays × ancienneté (+3 %/an, plafond 20 ans). Fourchette −15 % / +20 %." };
}

// ---------- 4. Mining Team Planner ----------
export type ProjectPhase = "exploration" | "feasibility" | "construction" | "production";
const TEAM_BY_PHASE: Record<ProjectPhase, { specialty: string; count: number }[]> = {
  exploration: [
    { specialty: "exploration-geologist", count: 2 },
    { specialty: "geophysicien", count: 1 },
    { specialty: "hse-manager", count: 1 },
  ],
  feasibility: [
    { specialty: "resource-geologist", count: 1 },
    { specialty: "mining-engineer", count: 1 },
    { specialty: "metallurgist", count: 1 },
    { specialty: "project-finance-mining", count: 1 },
  ],
  construction: [
    { specialty: "mine-planning-engineer", count: 2 },
    { specialty: "process-engineer", count: 2 },
    { specialty: "hse-manager", count: 2 },
    { specialty: "operations-director", count: 1 },
  ],
  production: [
    { specialty: "mine-manager", count: 1 },
    { specialty: "mining-engineer", count: 3 },
    { specialty: "maintenance-manager", count: 2 },
    { specialty: "metallurgist", count: 2 },
    { specialty: "cost-controller-mining", count: 1 },
    { specialty: "hse-manager", count: 2 },
  ],
};
export interface TeamPlanResult { phase: ProjectPhase; roles: { specialty: string; count: number }[]; total: number; methodology: string }
export function miningTeamPlan(i: { phase: ProjectPhase }): TeamPlanResult | ToolError {
  if (!TEAM_BY_PHASE[i.phase]) return { errors: ["phase invalide (exploration|feasibility|construction|production)"] };
  const roles = TEAM_BY_PHASE[i.phase];
  return { phase: i.phase, roles, total: roles.reduce((n, r) => n + r.count, 0), methodology: "Composition indicative d'équipe par phase de projet minier (à affiner selon la taille du gisement)." };
}

export function isToolError(r: unknown): r is ToolError {
  return !!r && typeof r === "object" && Array.isArray((r as ToolError).errors);
}

export const TOOLS = {
  "cout-recrutement": { title: "Coût d'un recrutement" },
  "cout-vacance": { title: "Coût d'un poste vacant" },
  "benchmark-salaire": { title: "Benchmark salaire" },
  "mining-team-planner": { title: "Mining Team Planner" },
} as const;
export type ToolSlug = keyof typeof TOOLS;
