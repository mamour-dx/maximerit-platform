/**
 * Phase 1 — Modèle de domaine Maximerit : chargeurs, validateurs métier et moteur de
 * recherche multicritère. Stack-agnostique (aucune dépendance). En Phase 3, ces règles
 * alimentent les collections Payload (validation `hooks`) et l'index Meilisearch.
 */
// Import JSON par attribut : compatible `node --test` (Node 22+) ET bundler Next (les données
// sont ainsi tracées/incluses au build, pas lues via fs — évite les erreurs de fichier introuvable).
import enums from './enums.json' with { type: 'json' };
import mining from './taxonomy/mining.json' with { type: 'json' };
export { enums, mining };

// --- Index dérivés ---
const bySlug = (arr) => new Set(arr.map((x) => (typeof x === 'string' ? x : x.slug)));
export const ROLES = new Set(enums.roles);
export const SECTORS = bySlug(enums.sectors);
export const COMMODITIES = bySlug(enums.commodities);
export const MINE_TYPES = bySlug(enums.mineTypes);
export const CONTRACT_TYPES = bySlug(enums.contractTypes);
export const SENIORITY = new Map(enums.seniority.map((s) => [s.slug, s.rank]));
export const LANG_CODES = new Set(enums.languages.map((l) => l.code));
export const PROFICIENCY = new Map(enums.languageProficiency.map((p) => [p.slug, p.rank]));
export const PIPELINE = enums.candidatePipeline.map((s) => s.slug);
export const SIDE_STATES = bySlug(enums.candidateSideStates);
export const ALL_STATUSES = new Set([...PIPELINE, ...SIDE_STATES]);
export const COUNTRY_CODES = new Set(enums.countries.map((c) => c.code));
export const WEST_AFRICA = COUNTRY_CODES; // les 7 pays prioritaires

// Taxonomie Mining aplatie : specialty slug -> discipline slug (placement canonique)
export const SPECIALTY_TO_DISCIPLINE = new Map();
export const MINING_DISCIPLINES = new Set();
for (const d of mining.disciplines) {
  MINING_DISCIPLINES.add(d.slug);
  for (const sp of d.specialties) SPECIALTY_TO_DISCIPLINE.set(sp.slug, d.slug);
}
export const MINING_SPECIALTIES = new Set(SPECIALTY_TO_DISCIPLINE.keys());

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COUNTRY_RE = /^[A-Z]{2}$/;

/**
 * Valide un profil candidat selon les règles métier (cahier §14).
 * @returns {{valid:boolean, errors:string[]}}
 */
export function validateCandidateProfile(c) {
  const e = [];
  if (!c || typeof c !== 'object') return { valid: false, errors: ['profil manquant'] };

  // Identité
  if (!c.firstName?.trim()) e.push('firstName requis');
  if (!c.lastName?.trim()) e.push('lastName requis');
  if (!c.email || !EMAIL_RE.test(c.email)) e.push('email invalide');
  if (!c.phone?.trim() && !c.whatsapp?.trim()) e.push('téléphone ou WhatsApp requis');
  if (c.countryOfResidence && !COUNTRY_RE.test(c.countryOfResidence)) e.push('countryOfResidence : code pays ISO-2 attendu');
  // Consentement RGPD obligatoire
  if (c.consent !== true) e.push('consentement données obligatoire (consent=true)');

  // Professionnel
  if (c.yearsExperience != null && (!Number.isInteger(c.yearsExperience) || c.yearsExperience < 0)) e.push('yearsExperience : entier >= 0');
  if (c.sector && !SECTORS.has(c.sector)) e.push(`secteur inconnu: ${c.sector}`);
  if (c.seniority && !SENIORITY.has(c.seniority)) e.push(`seniority inconnue: ${c.seniority}`);
  if (c.targetSpecialty && !MINING_SPECIALTIES.has(c.targetSpecialty) && c.sector === 'mines-ressources-naturelles')
    e.push(`spécialité Mining inconnue: ${c.targetSpecialty}`);
  if (c.targetDiscipline && !MINING_DISCIPLINES.has(c.targetDiscipline) && c.sector === 'mines-ressources-naturelles')
    e.push(`discipline Mining inconnue: ${c.targetDiscipline}`);
  for (const ct of c.contractTypes || []) if (!CONTRACT_TYPES.has(ct)) e.push(`type de contrat inconnu: ${ct}`);

  // Langues
  for (const l of c.languages || []) {
    if (!LANG_CODES.has(l.code)) e.push(`langue inconnue: ${l.code}`);
    if (l.proficiency && !PROFICIENCY.has(l.proficiency)) e.push(`niveau de langue inconnu: ${l.proficiency}`);
  }

  // Disponibilité
  if (c.availabilityDays != null && (typeof c.availabilityDays !== 'number' || c.availabilityDays < 0)) e.push('availabilityDays : nombre >= 0 ou null');

  // Bloc Mining
  if (c.mining) {
    for (const cm of c.mining.commodities || []) if (!COMMODITIES.has(cm)) e.push(`commodity inconnue: ${cm}`);
    for (const mt of c.mining.mineType || []) if (!MINE_TYPES.has(mt)) e.push(`type de mine inconnu: ${mt}`);
    for (const d of c.mining.disciplines || []) if (!MINING_DISCIPLINES.has(d)) e.push(`discipline Mining inconnue: ${d}`);
    for (const cc of c.mining.countriesExperience || []) if (!COUNTRY_RE.test(cc)) e.push(`pays d'expérience: code ISO-2 attendu (${cc})`);
  }

  // Statut (si présent, il doit être valide)
  if (c.status && !ALL_STATUSES.has(c.status)) e.push(`statut inconnu: ${c.status}`);

  return { valid: e.length === 0, errors: e };
}

/** Un candidat est-il mobile vers un pays donné ? */
export function isMobileTo(c, code) {
  if (!code) return true;
  if (c.internationalMobility === true) return true;
  const scopes = c.mobilityScopes || [];
  if (scopes.includes('internationale')) return true;
  if (scopes.includes('regionale-afrique-ouest') && WEST_AFRICA.has(code)) return true;
  if ((c.mobilityCountries || []).includes(code)) return true;
  // A déjà travaillé dans ce pays => mobilité de fait
  if ((c.mining?.countriesExperience || []).includes(code)) return true;
  return false;
}

/** Le candidat parle-t-il l'une des langues au niveau minimal requis ? */
export function speaksAnyOf(c, codes, minProficiency = 'professionnel') {
  const min = PROFICIENCY.get(minProficiency) ?? 3;
  return (c.languages || []).some((l) => codes.includes(l.code) && (PROFICIENCY.get(l.proficiency) ?? 0) >= min);
}

/** Discipline effective du candidat (cible, spécialité, ou expériences Mining). */
function candidateDisciplines(c) {
  const set = new Set(c.mining?.disciplines || []);
  if (c.targetDiscipline) set.add(c.targetDiscipline);
  if (c.targetSpecialty && SPECIALTY_TO_DISCIPLINE.has(c.targetSpecialty)) set.add(SPECIALTY_TO_DISCIPLINE.get(c.targetSpecialty));
  return set;
}

const intersects = (a = [], b = []) => a.some((x) => b.includes(x));

/**
 * Évaluateur en mémoire : le candidat satisfait-il TOUS les filtres fournis (ET) ?
 * Sert de spécification exécutable des règles de recherche ; en prod la même sémantique
 * est traduite en requête SQL/Meilisearch (cf. buildCandidateQuery).
 */
export function matchesCandidate(c, f = {}) {
  if (f.text) {
    const hay = [c.firstName, c.lastName, c.currentPosition, ...(c.tags || []), ...(c.skills || [])]
      .filter(Boolean).join(' ').toLowerCase();
    const tokens = f.text.toLowerCase().split(/\s+/).filter(Boolean);
    if (!tokens.every((t) => hay.includes(t))) return false;
  }
  if (f.sector && c.sector !== f.sector) return false;
  if (f.specialty && c.targetSpecialty !== f.specialty) return false;
  if (f.discipline && !candidateDisciplines(c).has(f.discipline)) return false;
  if (f.commodities?.length && !intersects(f.commodities, c.mining?.commodities || [])) return false;
  if (f.mineType?.length && !intersects(f.mineType, c.mining?.mineType || [])) return false;
  if (f.languagesAny?.length && !speaksAnyOf(c, f.languagesAny, f.minLanguageProficiency)) return false;
  if (f.languagesAll?.length && !f.languagesAll.every((code) => speaksAnyOf(c, [code], f.minLanguageProficiency))) return false;
  if (f.minYearsExperience != null && !(Number(c.yearsExperience) >= f.minYearsExperience)) return false;
  if (f.seniorityMin && !((SENIORITY.get(c.seniority) ?? 0) >= (SENIORITY.get(f.seniorityMin) ?? 0))) return false;
  if (f.countriesExperienceAny?.length && !intersects(f.countriesExperienceAny, c.mining?.countriesExperience || [])) return false;
  if (f.mobilityCountry && !isMobileTo(c, f.mobilityCountry)) return false;
  if (f.maxAvailabilityDays != null && !(c.availabilityDays != null && c.availabilityDays <= f.maxAvailabilityDays)) return false;
  if (f.status && c.status !== f.status) return false;
  if (f.availableOnly && (c.availabilityDays == null)) return false;
  return true;
}

/**
 * Traduit des filtres en prédicats normalisés {field, op, value} — base de la génération
 * SQL/Meilisearch en Phase 5. N'exécute rien ; documente et fige la sémantique.
 */
export function buildCandidateQuery(f = {}) {
  const p = [];
  if (f.text) p.push({ field: '_fulltext', op: 'match', value: f.text });
  if (f.sector) p.push({ field: 'sector', op: 'eq', value: f.sector });
  if (f.specialty) p.push({ field: 'targetSpecialty', op: 'eq', value: f.specialty });
  if (f.discipline) p.push({ field: 'disciplines', op: 'contains', value: f.discipline });
  if (f.commodities?.length) p.push({ field: 'mining.commodities', op: 'in', value: f.commodities });
  if (f.mineType?.length) p.push({ field: 'mining.mineType', op: 'in', value: f.mineType });
  if (f.languagesAny?.length) p.push({ field: 'languages.code', op: 'in', value: f.languagesAny });
  if (f.languagesAll?.length) p.push({ field: 'languages.code', op: 'all', value: f.languagesAll });
  if (f.minYearsExperience != null) p.push({ field: 'yearsExperience', op: 'gte', value: f.minYearsExperience });
  if (f.seniorityMin) p.push({ field: 'seniorityRank', op: 'gte', value: SENIORITY.get(f.seniorityMin) });
  if (f.countriesExperienceAny?.length) p.push({ field: 'mining.countriesExperience', op: 'in', value: f.countriesExperienceAny });
  if (f.mobilityCountry) p.push({ field: 'mobilityCountry', op: 'mobileTo', value: f.mobilityCountry });
  if (f.maxAvailabilityDays != null) p.push({ field: 'availabilityDays', op: 'lte', value: f.maxAvailabilityDays });
  if (f.status) p.push({ field: 'status', op: 'eq', value: f.status });
  return p;
}
