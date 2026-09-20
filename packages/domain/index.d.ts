// Types publics de @maximerit/domain. Alignés sur model.mjs (Phase 1) et docs/DATA_MODEL.md.

export type Locale = 'fr' | 'en';
export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'RECRUITER' | 'CONTENT_MANAGER' | 'MARKETING' | 'VIEWER';

export interface CandidateLanguage { code: string; proficiency?: string }

export interface CandidateMining {
  disciplines?: string[];
  commodities?: string[];
  mineType?: string[];
  countriesExperience?: string[];
  fifoRoster?: boolean;
}

export interface CandidateProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  countryOfResidence?: string;
  nationality?: string;
  internationalMobility?: boolean;
  currentPosition?: string;
  targetSpecialty?: string;
  targetDiscipline?: string;
  sector?: string;
  yearsExperience?: number;
  seniority?: string;
  currentCompany?: string;
  salaryExpectation?: number | string;
  contractTypes?: string[];
  languages?: CandidateLanguage[];
  skills?: string[];
  certifications?: string[];
  availabilityDays?: number | null;
  status?: string;
  mobilityScopes?: string[];
  mobilityCountries?: string[];
  mining?: CandidateMining;
  tags?: string[];
  source?: string;
  consent?: boolean;
}

export interface CandidateSearchFilters {
  text?: string;
  sector?: string;
  specialty?: string;
  discipline?: string;
  commodities?: string[];
  mineType?: string[];
  languagesAny?: string[];
  languagesAll?: string[];
  minLanguageProficiency?: string;
  minYearsExperience?: number;
  seniorityMin?: string;
  countriesExperienceAny?: string[];
  mobilityCountry?: string;
  maxAvailabilityDays?: number;
  status?: string;
  availableOnly?: boolean;
}

export interface QueryPredicate { field: string; op: string; value: unknown }
export interface ValidationResult { valid: boolean; errors: string[] }

export const enums: Record<string, unknown>;

export interface MiningSpecialty { slug: string; label_fr: string; label_en: string }
export interface MiningDiscipline {
  slug: string;
  label_fr: string;
  label_en: string;
  url: string;
  specialties: MiningSpecialty[];
  crossRefs?: string[];
}
export interface MiningTaxonomy {
  sector: { slug: string; label_fr: string; label_en: string; hubUrl: string; priority: boolean };
  disciplines: MiningDiscipline[];
}
export const mining: MiningTaxonomy;

export const ROLES: Set<Role>;
export const SECTORS: Set<string>;
export const COMMODITIES: Set<string>;
export const MINING_DISCIPLINES: Set<string>;
export const MINING_SPECIALTIES: Set<string>;
export const SPECIALTY_TO_DISCIPLINE: Map<string, string>;
export const PIPELINE: string[];

export function validateCandidateProfile(c: CandidateProfile): ValidationResult;
export function matchesCandidate(c: CandidateProfile, f?: CandidateSearchFilters): boolean;
export function buildCandidateQuery(f?: CandidateSearchFilters): QueryPredicate[];
export function isMobileTo(c: CandidateProfile, code: string): boolean;
export function speaksAnyOf(c: CandidateProfile, codes: string[], minProficiency?: string): boolean;
