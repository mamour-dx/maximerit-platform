/**
 * Phase 1 — Tests du modèle de domaine. `node --test scripts/tests/domain.test.mjs`
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  enums, mining, validateCandidateProfile, matchesCandidate, buildCandidateQuery,
  isMobileTo, speaksAnyOf, SPECIALTY_TO_DISCIPLINE, MINING_DISCIPLINES, ROLES,
} from '../../packages/domain/model.mjs';

// ---------- Intégrité de la taxonomie Mining ----------
test('taxonomie : 4 disciplines Mining', () => {
  assert.equal(mining.disciplines.length, 4);
});

test('taxonomie : slugs de spécialité uniques (placement canonique unique)', () => {
  const all = mining.disciplines.flatMap((d) => d.specialties.map((s) => s.slug));
  assert.equal(new Set(all).size, all.length, 'slugs de spécialité dupliqués');
});

test('taxonomie : chaque spécialité a un label FR et EN', () => {
  for (const d of mining.disciplines)
    for (const s of d.specialties) {
      assert.ok(s.label_fr && s.label_en, `labels manquants pour ${s.slug}`);
    }
});

test('taxonomie : crossRefs pointent vers des spécialités canoniques existantes', () => {
  for (const d of mining.disciplines)
    for (const ref of d.crossRefs || [])
      assert.ok(SPECIALTY_TO_DISCIPLINE.has(ref), `crossRef inconnu: ${ref}`);
});

test('taxonomie : chaque discipline a une URL sous /mines/', () => {
  for (const d of mining.disciplines) assert.match(d.url, /^\/mines\//);
});

// ---------- Intégrité des enums / RBAC ----------
test('RBAC : 6 rôles attendus', () => {
  for (const r of ['SUPER_ADMIN', 'ADMIN', 'RECRUITER', 'CONTENT_MANAGER', 'MARKETING', 'VIEWER'])
    assert.ok(ROLES.has(r), `rôle manquant: ${r}`);
});

test('RBAC : toutes les actions de la matrice sont des actions connues', () => {
  const actions = new Set(enums.actions);
  for (const [role, res] of Object.entries(enums.permissionsMatrix))
    for (const [resource, acts] of Object.entries(res))
      for (const a of acts) assert.ok(actions.has(a), `action inconnue ${a} (${role}/${resource})`);
});

test('RBAC : VIEWER ne peut ni supprimer ni publier', () => {
  const v = enums.permissionsMatrix.VIEWER;
  for (const acts of Object.values(v)) {
    assert.ok(!acts.includes('delete'), 'VIEWER ne doit pas avoir delete');
    assert.ok(!acts.includes('publish'), 'VIEWER ne doit pas avoir publish');
  }
});

test('pipeline candidat : 10 étapes ordonnées + 4 états annexes', () => {
  assert.equal(enums.candidatePipeline.length, 10);
  assert.equal(enums.candidateSideStates.length, 4);
  const orders = enums.candidatePipeline.map((s) => s.order);
  assert.deepEqual(orders, [...orders].sort((a, b) => a - b), 'ordre non monotone');
});

test('pays prioritaires : les 7 pays d’Afrique de l’Ouest', () => {
  assert.deepEqual(enums.countries.map((c) => c.code), ['SN', 'GN', 'CI', 'ML', 'MR', 'BF', 'GH']);
});

// ---------- Validation du profil candidat ----------
const baseCandidate = () => ({
  firstName: 'Awa', lastName: 'Diop', email: 'awa@example.com', phone: '+221770000000',
  countryOfResidence: 'SN', consent: true, sector: 'mines-ressources-naturelles',
  targetDiscipline: 'geologie-exploration', targetSpecialty: 'exploration-geologist',
  yearsExperience: 9, seniority: 'senior',
  languages: [{ code: 'fr', proficiency: 'natif' }, { code: 'en', proficiency: 'courant' }],
  contractTypes: ['cdi', 'fifo-roster'], availabilityDays: 45, status: 'qualifie',
  mining: { commodities: ['gold'], mineType: ['ciel-ouvert'], disciplines: ['geologie-exploration'], countriesExperience: ['SN', 'ML'], fifoRoster: true },
  mobilityScopes: ['regionale-afrique-ouest'], tags: ['GEOLOGY', 'GOLD'],
});

test('candidat valide passe la validation', () => {
  const r = validateCandidateProfile(baseCandidate());
  assert.ok(r.valid, JSON.stringify(r.errors));
});

test('consentement obligatoire', () => {
  const c = baseCandidate(); c.consent = false;
  const r = validateCandidateProfile(c);
  assert.ok(!r.valid && r.errors.some((e) => e.includes('consentement')));
});

test('email invalide rejeté', () => {
  const c = baseCandidate(); c.email = 'not-an-email';
  assert.ok(!validateCandidateProfile(c).valid);
});

test('téléphone OU whatsapp requis', () => {
  const c = baseCandidate(); c.phone = ''; c.whatsapp = '';
  assert.ok(!validateCandidateProfile(c).valid);
  const c2 = baseCandidate(); c2.phone = ''; c2.whatsapp = '+221771111111';
  assert.ok(validateCandidateProfile(c2).valid);
});

test('valeurs de vocabulaire inconnues rejetées', () => {
  const c = baseCandidate(); c.mining.commodities = ['unobtainium'];
  assert.ok(!validateCandidateProfile(c).valid);
  const c2 = baseCandidate(); c2.status = 'nimportequoi';
  assert.ok(!validateCandidateProfile(c2).valid);
  const c3 = baseCandidate(); c3.yearsExperience = -2;
  assert.ok(!validateCandidateProfile(c3).valid);
});

// ---------- Règles de recherche (exemple canonique du cahier §20) ----------
// « géologues Gold, francophones/anglophones, 8+ ans, mobiles Guinée, disponibles sous 60 jours »
const miningSearch = {
  discipline: 'geologie-exploration', commodities: ['gold'],
  languagesAny: ['fr', 'en'], minYearsExperience: 8, mobilityCountry: 'GN', maxAvailabilityDays: 60,
};

test('recherche : le candidat idéal correspond à la requête canonique', () => {
  assert.ok(matchesCandidate(baseCandidate(), miningSearch));
});

test('recherche : chaque critère filtre correctement (ET logique)', () => {
  // < 8 ans d'expérience
  let c = baseCandidate(); c.yearsExperience = 5;
  assert.ok(!matchesCandidate(c, miningSearch), 'devrait échouer sur expérience');
  // pas de gold
  c = baseCandidate(); c.mining.commodities = ['bauxite'];
  assert.ok(!matchesCandidate(c, miningSearch), 'devrait échouer sur commodity');
  // dispo > 60j
  c = baseCandidate(); c.availabilityDays = 90;
  assert.ok(!matchesCandidate(c, miningSearch), 'devrait échouer sur disponibilité');
  // ne parle ni FR ni EN au niveau requis
  c = baseCandidate(); c.languages = [{ code: 'pt', proficiency: 'natif' }];
  assert.ok(!matchesCandidate(c, miningSearch), 'devrait échouer sur langue');
  // pas mobile vers la Guinée
  c = baseCandidate(); c.mobilityScopes = ['locale']; c.internationalMobility = false; c.mining.countriesExperience = ['SN'];
  assert.ok(!matchesCandidate(c, miningSearch), 'devrait échouer sur mobilité');
});

test('mobilité : expérience dans le pays = mobilité de fait', () => {
  const c = baseCandidate(); c.mobilityScopes = ['locale']; c.mining.countriesExperience = ['GN'];
  assert.ok(isMobileTo(c, 'GN'));
});

test('langue : niveau minimal respecté (notions ne suffit pas)', () => {
  const c = baseCandidate(); c.languages = [{ code: 'en', proficiency: 'notions' }];
  assert.ok(!speaksAnyOf(c, ['en'], 'professionnel'));
  assert.ok(speaksAnyOf(c, ['en'], 'notions'));
});

test('recherche full-text sur tags/poste', () => {
  const c = baseCandidate(); c.currentPosition = 'Senior Exploration Geologist';
  assert.ok(matchesCandidate(c, { text: 'exploration geologist' }));
  assert.ok(matchesCandidate(c, { text: 'gold' })); // via tag GOLD
  assert.ok(!matchesCandidate(c, { text: 'metallurgist' }));
});

test('buildCandidateQuery : produit des prédicats normalisés cohérents', () => {
  const p = buildCandidateQuery(miningSearch);
  assert.ok(p.find((x) => x.field === 'yearsExperience' && x.op === 'gte' && x.value === 8));
  assert.ok(p.find((x) => x.field === 'mining.commodities' && x.op === 'in'));
  assert.ok(p.find((x) => x.field === 'availabilityDays' && x.op === 'lte' && x.value === 60));
});
