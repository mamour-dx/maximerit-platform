#!/usr/bin/env node
/**
 * Phase 2 — Génère le registre de routes (architecture UX + SEO) depuis la taxonomie et les
 * référentiels de la Phase 1. Sortie : specs/phase-2-ux-seo/route-registry.json
 *
 * Chaque route : { path, locale, type, title, seoLevel?, indexable, inNav, navGroup?, parent,
 *                   hrefGroup, singleLocale?, notes? }
 *   - hrefGroup : identifiant partagé par les variantes FR/EN (base des liens hreflang).
 *   - seoLevel  : 1 commercial · 2 métier · 3 informationnel · 4 géographique (stratégie SEO).
 *   - parent    : chemin du parent (fil d'Ariane / maillage). null pour home/lp/utility.
 *
 * FR à la racine, EN sous /en (ADR-0002). Canonical = auto-référencée (le path lui-même).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const load = (rel) => JSON.parse(readFileSync(new URL(rel, import.meta.url), 'utf8'));
const enums = load('../packages/domain/enums.json');
const mining = load('../packages/domain/taxonomy/mining.json');

const slugify = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/['’]/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const routes = [];
const add = (r) => { routes.push({ locale: 'fr', indexable: true, inNav: false, parent: null, singleLocale: false, ...r }); };

// ---------- Coeur éditorial (FR) — sera mirroré en EN ----------
add({ path: '/', type: 'home', title: 'Accueil', hrefGroup: 'home', inNav: true, navGroup: 'root', seoLevel: 1 });

// Entreprises (hub + 7 services) — piliers corporate
add({ path: '/entreprises/', type: 'section', title: 'Entreprises', hrefGroup: 'entreprises', inNav: true, navGroup: 'entreprises', parent: '/', seoLevel: 1 });
const ENTREPRISES = [
  ['recrutement', 'Recrutement'],
  ['executive-search', 'Executive Search'],
  ['interim', 'Intérim & mise à disposition'],
  ['externalisation-rh-paie', 'Externalisation RH & Paie'],
  ['finance-performance', 'Finance & Performance'],
  ['qhse-esg', 'QHSE & ESG'],
  ['formation', 'Formation'],
];
for (const [slug, title] of ENTREPRISES)
  add({ path: `/entreprises/${slug}/`, type: 'service', title, hrefGroup: `entreprises-${slug}`, inNav: true, navGroup: 'entreprises', parent: '/entreprises/', seoLevel: 1 });

// Secteurs (hub + 5 non-mining ; Mining pointe vers le hub /mines/)
add({ path: '/secteurs/', type: 'section', title: 'Secteurs', hrefGroup: 'secteurs', inNav: true, navGroup: 'secteurs', parent: '/', seoLevel: 1 });
for (const s of enums.sectors) {
  if (s.slug === 'mines-ressources-naturelles') continue; // = hub /mines/ (évite le doublon)
  add({ path: `/secteurs/${s.slug}/`, type: 'sector', title: s.label_fr, hrefGroup: `secteur-${s.slug}`, inNav: true, navGroup: 'secteurs', parent: '/secteurs/', seoLevel: 2 });
}

// ---------- Hub Mining (verticale prioritaire) ----------
add({ path: '/mines/', type: 'sector-hub', title: 'Recrutement minier en Afrique de l’Ouest', hrefGroup: 'mines', inNav: true, navGroup: 'mines', parent: '/', seoLevel: 1 });
add({ path: '/mines/recrutement-minier/', type: 'commercial', title: 'Recrutement minier', hrefGroup: 'mines-recrutement', inNav: true, navGroup: 'mines', parent: '/mines/', seoLevel: 1 });
add({ path: '/mines/metiers/', type: 'listing', title: 'Métiers miniers', hrefGroup: 'mines-metiers', inNav: true, navGroup: 'mines', parent: '/mines/', seoLevel: 2 });
add({ path: '/mines/vivier/', type: 'commercial', title: 'Vivier Mining', hrefGroup: 'mines-vivier', inNav: true, navGroup: 'mines', parent: '/mines/', seoLevel: 1 });

// Disciplines Mining (pages piliers) + métiers (longue traîne, niveau 2)
for (const d of mining.disciplines) {
  add({ path: d.url, type: 'discipline', title: d.label_fr, hrefGroup: `mines-discipline-${d.slug}`, inNav: true, navGroup: 'mines', parent: '/mines/', seoLevel: 1 });
  for (const sp of d.specialties) {
    const frSlug = slugify(sp.label_fr);
    add({ path: `/mines/metiers/${frSlug}/`, type: 'metier', title: sp.label_fr,
      hrefGroup: `mines-metier-${sp.slug}`, parent: d.url, seoLevel: 2,
      notes: `specialty=${sp.slug}` });
  }
}

// Pages pays Mining (niveau 4) — UNIQUEMENT si valeur locale spécifique (cahier §7)
for (const c of enums.countries) {
  add({ path: `/mines/${slugify(c.label_fr)}/`, type: 'country', title: `Recrutement minier — ${c.label_fr}`,
    hrefGroup: `mines-pays-${c.code}`, parent: '/mines/', seoLevel: 4, singleLocale: false,
    notes: `country=${c.code}; requiresLocalContent=true` });
}

// ---------- Candidats ----------
add({ path: '/candidats/', type: 'section', title: 'Candidats', hrefGroup: 'candidats', inNav: true, navGroup: 'candidats', parent: '/', seoLevel: 1 });
const CANDIDATS = [
  ['offres-demploi', 'Offres d’emploi'],
  ['deposer-mon-cv', 'Déposer mon CV'],
  ['rejoindre-le-vivier', 'Rejoindre le vivier Maximerit'],
  ['conseils-carriere', 'Conseils carrière'],
];
for (const [slug, title] of CANDIDATS)
  add({ path: `/candidats/${slug}/`, type: 'candidate-page', title, hrefGroup: `candidats-${slug}`, inNav: true, navGroup: 'candidats', parent: '/candidats/', seoLevel: 3 });

// ---------- Ressources ----------
add({ path: '/ressources/', type: 'section', title: 'Ressources', hrefGroup: 'ressources', inNav: true, navGroup: 'ressources', parent: '/', seoLevel: 3 });
const RESSOURCES = [
  ['blog', 'Blog'], ['guides', 'Guides'], ['barometres', 'Baromètres'],
  ['fiches-metiers', 'Fiches métiers'], ['outils', 'Outils gratuits'], ['etudes', 'Études'],
];
for (const [slug, title] of RESSOURCES)
  add({ path: `/ressources/${slug}/`, type: 'resource-section', title, hrefGroup: `ressources-${slug}`, inNav: true, navGroup: 'ressources', parent: '/ressources/', seoLevel: 3 });

// Outils gratuits (acquisition B2B) — sous /ressources/outils/
const OUTILS = [
  ['cout-recrutement', 'Calculateur coût d’un recrutement'],
  ['cout-employeur', 'Calculateur coût employeur (Cost of Vacancy)'],
  ['benchmark-salaire', 'Benchmark salaire'],
  ['mining-team-planner', 'Mining Team Planner'],
];
for (const [slug, title] of OUTILS)
  add({ path: `/ressources/outils/${slug}/`, type: 'tool', title, hrefGroup: `outil-${slug}`, parent: '/ressources/outils/', seoLevel: 3 });

// ---------- Institutionnel ----------
add({ path: '/qui-nous-sommes/', type: 'page', title: 'Qui sommes-nous', hrefGroup: 'about', inNav: true, navGroup: 'root', parent: '/', seoLevel: 3 });
add({ path: '/contact/', type: 'page', title: 'Contact', hrefGroup: 'contact', inNav: true, navGroup: 'root', parent: '/', seoLevel: 1 });

// ---------- Landing pages acquisition (hors nav, standalone) ----------
const LPS = [
  ['recrutement-minier', 'Recrutement minier — Afrique de l’Ouest', true],
  ['recrutement-geologue', 'Recrutement géologue', true],
  ['executive-search-mining', 'Executive Search Mining', true],
  ['recrutement-finance-mining', 'Recrutement Finance Mining', true],
  ['mise-a-disposition', 'Mise à disposition', false],
  ['recrutement-senegal', 'Recrutement minier Sénégal', false],
  ['recrutement-guinee', 'Recrutement minier Guinée', false],
];
for (const [slug, title, mirrorEn] of LPS)
  add({ path: `/lp/${slug}/`, type: 'landing', title, hrefGroup: `lp-${slug}`, parent: null, seoLevel: 1, singleLocale: !mirrorEn });

// ---------- Utilitaires ----------
add({ path: '/mentions-legales/', type: 'utility', title: 'Mentions légales', hrefGroup: 'mentions', parent: '/' });
add({ path: '/politique-confidentialite/', type: 'utility', title: 'Politique de confidentialité', hrefGroup: 'privacy', parent: '/' });
add({ path: '/404/', type: 'system', title: 'Page introuvable', hrefGroup: '404', parent: null, indexable: false, singleLocale: true });

// ---------- Miroir EN (/en/...) pour toute route non single-locale ----------
const frCore = routes.filter((r) => r.locale === 'fr' && !r.singleLocale && r.type !== 'system');
for (const r of frCore) {
  const enPath = r.path === '/' ? '/en/' : '/en' + r.path;
  const enParent = r.parent == null ? (r.type === 'landing' ? null : (r.path === '/' ? null : '/en/'))
    : (r.parent === '/' ? '/en/' : '/en' + r.parent);
  routes.push({ ...r, locale: 'en', path: enPath, parent: enParent });
}

// ---------- Écriture ----------
const out = new URL('../specs/phase-2-ux-seo/route-registry.json', import.meta.url);
mkdirSync(dirname(out.pathname), { recursive: true });
writeFileSync(out, JSON.stringify(routes, null, 2) + '\n');

const byType = routes.reduce((a, r) => ((a[r.type] = (a[r.type] || 0) + 1), a), {});
console.log(`Registre écrit : ${routes.length} routes → ${out.pathname}`);
console.log('  FR:', routes.filter((r) => r.locale === 'fr').length, '| EN:', routes.filter((r) => r.locale === 'en').length);
console.log('  Types:', byType);
