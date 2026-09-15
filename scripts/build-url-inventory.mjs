#!/usr/bin/env node
/**
 * Phase 0 — Construit l'inventaire structuré des URLs à partir du sitemap WordPress.
 *
 * Source : https://maximerit.com/page-sitemap.xml (Yoast), crawlé le 2026-09-09 via
 * navigateur (le serveur bloque les requêtes scriptées : 403 WAF — cf. PROJECT_BASELINE P1).
 *
 * Sortie : specs/phase-0-seo-migration/audit/url-inventory.csv
 *
 * Ce fichier fige la liste faisant foi (129 URLs). Les colonnes de VALEUR
 * (clics / impressions / position / backlinks) restent vides jusqu'à obtention
 * de Google Search Console (fournie par le client) et d'un export backlinks.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

// [url, lastmod] tels qu'exportés par le sitemap.
const RAW = [
  ['https://maximerit.com/', '2026-04-20'],
  ['https://maximerit.com/creation-de-services-et-developpement-dactivites/', '2026-05-12'],
  ['https://maximerit.com/formations/', '2026-05-12'],
  ['https://maximerit.com/management-des-projet/', '2026-05-12'],
  ['https://maximerit.com/esg/', '2026-05-12'],
  ['https://maximerit.com/language/en/our-strengths/', '2026-04-28'],
  ['https://maximerit.com/language/en/who-are-we/', '2026-04-28'],
  ['https://maximerit.com/language/en/sustainable-development/', '2026-04-28'],
  ['https://maximerit.com/qui-nous-sommes/', '2026-04-28'],
  ['https://maximerit.com/accueil-et-integration/', '2026-04-28'],
  ['https://maximerit.com/developpement-durable/', '2026-04-28'],
  ['https://maximerit.com/nos-atouts/', '2026-04-28'],
  ['https://maximerit.com/language/en/environmental-and-social-impact-assessment/', '2026-04-28'],
  ['https://maximerit.com/etude-dimpact-environnemental-et-social/', '2026-04-28'],
  ['https://maximerit.com/language/en/environmental-social-and-governance/', '2026-04-28'],
  ['https://maximerit.com/language/en/human-resources-management/', '2026-04-23'],
  ['https://maximerit.com/gestion-des-ressources-humaines/', '2026-04-22'],
  ['https://maximerit.com/project-management-et-it/', '2026-04-21'],
  ['https://maximerit.com/finance-gestion/', '2026-04-21'],
  ['https://maximerit.com/management-hygiene-qualite-et-securite/', '2026-04-20'],
  ['https://maximerit.com/language/en/', '2026-04-15'],
  ['https://maximerit.com/language/en/request-quote/', '2026-04-15'],
  ['https://maximerit.com/demande-de-devis/', '2026-04-03'],
  ['https://maximerit.com/operations-supervisor/', '2025-12-15'],
  ['https://maximerit.com/base-manager/', '2025-12-15'],
  ['https://maximerit.com/depot-de-candidature-2/', '2025-12-15'],
  ['https://maximerit.com/depot-de-candidature-spontanee/', '2025-01-16'],
  ['https://maximerit.com/depot-cv/', '2025-01-16'],
  ['https://maximerit.com/cost-accountant/', '2025-01-15'],
  ['https://maximerit.com/offre-demplois/', '2025-01-15'],
  ['https://maximerit.com/contactez-nous/', '2024-11-13'],
  ['https://maximerit.com/language/en/job-offer/', '2024-02-23'],
  ['https://maximerit.com/offres-demploi/', '2023-12-21'],
  ['https://maximerit.com/un-agent-de-liaison-communautaire/', '2023-11-23'],
  ['https://maximerit.com/language/en/maintenance-of-computer-systems-and-networks/', '2023-11-22'],
  ['https://maximerit.com/language/en/community-liaison-officer/', '2023-08-07'],
  ['https://maximerit.com/tableau-de-bord-des-offres-demploi/', '2023-04-11'],
  ['https://maximerit.com/publier-une-offre-demploi/', '2023-04-11'],
  ['https://maximerit.com/language/en/reception-and-integration/', '2022-10-11'],
  ['https://maximerit.com/formation-en-rh/', '2022-10-11'],
  ['https://maximerit.com/language/en/hr-training/', '2022-10-11'],
  ['https://maximerit.com/language/en/qhse-training/', '2022-10-11'],
  ['https://maximerit.com/hotellerie-et-tourisme/', '2022-10-11'],
  ['https://maximerit.com/language/en/training/', '2022-10-11'],
  ['https://maximerit.com/language/en/hospitality-and-tourism/', '2022-10-11'],
  ['https://maximerit.com/formation-en-finance/', '2022-10-11'],
  ['https://maximerit.com/language/en/project-management/', '2022-10-11'],
  ['https://maximerit.com/gestion-des-projets/', '2022-10-11'],
  ['https://maximerit.com/language/en/finance-training/', '2022-10-11'],
  ['https://maximerit.com/language/en/projet-managuement/', '2022-10-07'],
  ['https://maximerit.com/language/en/contact-us/', '2022-10-07'],
  ['https://maximerit.com/language/en/drafting-of-procedures-manual/', '2022-10-07'],
  ['https://maximerit.com/maintenance-des-systemes-informatiques-et-reseaux/', '2022-10-07'],
  ['https://maximerit.com/conseil-en-qhse/', '2022-10-05'],
  ['https://maximerit.com/conseils/conseils-en-rh/', '2022-10-05'],
  ['https://maximerit.com/conseil-en-finance/', '2022-10-05'],
  ['https://maximerit.com/installation-video-surveillance/', '2022-09-28'],
  ['https://maximerit.com/facilities-management/', '2022-09-28'],
  ['https://maximerit.com/audit-qhse/', '2022-09-28'],
  ['https://maximerit.com/mise-a-disposition-equipe-qhse/', '2022-09-28'],
  ['https://maximerit.com/mise-en-place-dune-politique-qhse/', '2022-09-28'],
  ['https://maximerit.com/redaction-de-code-de-conduite/', '2022-09-28'],
  ['https://maximerit.com/evaluation-du-personnel/', '2022-09-28'],
  ['https://maximerit.com/enquetes-de-salaires/', '2022-09-28'],
  ['https://maximerit.com/coaching/', '2022-09-28'],
  ['https://maximerit.com/suivi-rh/', '2022-09-28'],
  ['https://maximerit.com/interim/', '2022-09-28'],
  ['https://maximerit.com/recrutement/', '2022-09-28'],
  ['https://maximerit.com/gestion-paie-et-des-declarations/', '2022-09-28'],
  ['https://maximerit.com/mise-en-place-doutils-delaboration-et-de-suivi-de-budget/', '2022-09-28'],
  ['https://maximerit.com/assistance-a-la-mise-en-place-de-systemes-de-reporting/', '2022-09-28'],
  ['https://maximerit.com/gestion-et-inventaire-des-immobilisations/', '2022-09-28'],
  ['https://maximerit.com/organisation-et-assistance-aux-services-comptables-et-financiers/', '2022-09-28'],
  ['https://maximerit.com/formation-en-qhse/', '2022-09-28'],
  ['https://maximerit.com/language/en/temping/', '2022-07-19'],
  ['https://maximerit.com/implementation-et-suivi-de-systeme-de-gestion-informatise/', '2022-07-19'],
  ['https://maximerit.com/language/en/financing/', '2022-07-15'],
  ['https://maximerit.com/financement/', '2022-07-15'],
  ['https://maximerit.com/language/en/definition-and-monitoring-of-performance-indicators/', '2022-07-12'],
  ['https://maximerit.com/language/en/development-of-business-plan/', '2022-07-12'],
  ['https://maximerit.com/language/en/organizational-audit/', '2022-07-12'],
  ['https://maximerit.com/language/en/creation-of-services-and-development-of-activities/', '2022-07-12'],
  ['https://maximerit.com/language/en/financial-consulting/', '2022-07-12'],
  ['https://maximerit.com/language/en/submission-of-application/', '2022-07-06'],
  ['https://maximerit.com/elaboration-de-business-plan/', '2022-07-06'],
  ['https://maximerit.com/definition-et-suivi-des-indicateurs-de-performance/', '2022-07-06'],
  ['https://maximerit.com/redaction-de-manuel-des-procedures/', '2022-07-06'],
  ['https://maximerit.com/audit-organisationnel/', '2022-07-06'],
  ['https://maximerit.com/language/en/implementation-and-monitoring-of-computerised-management-systems/', '2022-07-06'],
  ['https://maximerit.com/conseil-et-formation/', '2022-07-06'],
  ['https://maximerit.com/language/en/video-surveillance-installation/', '2022-07-06'],
  ['https://maximerit.com/support-it/', '2022-07-06'],
  ['https://maximerit.com/language/en/salary-surveys/', '2022-07-06'],
  ['https://maximerit.com/language/en/staff-evaluation/', '2022-07-06'],
  ['https://maximerit.com/language/en/recruitment/', '2022-07-06'],
  ['https://maximerit.com/services-generaux/', '2022-07-06'],
  ['https://maximerit.com/language/en/qhse-consulting/', '2022-07-06'],
  ['https://maximerit.com/language/en/payroll-and-returns-management/', '2022-07-06'],
  ['https://maximerit.com/language/en/provision-of-qhse-team/', '2022-07-06'],
  ['https://maximerit.com/language/en/organisation-and-assistance-to-the-accounting-and-financial-services/', '2022-07-06'],
  ['https://maximerit.com/language/en/organisation-of-company-events/', '2022-07-06'],
  ['https://maximerit.com/language/en/qhse-audit/', '2022-07-06'],
  ['https://maximerit.com/language/en/qhes-management/', '2022-07-06'],
  ['https://maximerit.com/management-qhes/', '2022-07-06'],
  ['https://maximerit.com/language/en/it-support/', '2022-07-06'],
  ['https://maximerit.com/language/en/implementation-of-budget-preparation-and-monitoring-tools/', '2022-07-06'],
  ['https://maximerit.com/language/en/implementation-of-a-qhse-policy/', '2022-07-06'],
  ['https://maximerit.com/language/en/hr-monitoring/', '2022-07-06'],
  ['https://maximerit.com/language/en/hr-consulting/', '2022-07-06'],
  ['https://maximerit.com/language/en/general-services/', '2022-07-06'],
  ['https://maximerit.com/language/en/g-hr/', '2022-07-06'],
  ['https://maximerit.com/g-rh/', '2022-07-06'],
  ['https://maximerit.com/language/en/finance/', '2022-07-06'],
  ['https://maximerit.com/language/en/facility-management/', '2022-07-06'],
  ['https://maximerit.com/finances/', '2022-07-06'],
  ['https://maximerit.com/language/en/drafting-of-a-code-of-conduct/', '2022-07-06'],
  ['https://maximerit.com/language/en/corporate-services/', '2022-07-05'],
  ['https://maximerit.com/contact/', '2022-07-05'],
  ['https://maximerit.com/language/en/consulting-and-finance-2/', '2022-07-05'],
  ['https://maximerit.com/conception-et-realisation-de-site-web/', '2022-07-05'],
  ['https://maximerit.com/language/en/coaching-2/', '2022-07-05'],
  ['https://maximerit.com/language/en/assistance-in-setting-up-reporting-systems/', '2022-07-05'],
  ['https://maximerit.com/language/en/asset-management-and-inventory/', '2022-07-05'],
  ['https://maximerit.com/language/en/website-design-and-development/', '2022-06-30'],
  ['https://maximerit.com/contact-2/', '2022-06-27'],
  ['https://maximerit.com/about/', '2022-06-27'],
  ['https://maximerit.com/home/', '2022-06-27'],
  ['https://maximerit.com/language/en/consulting/', '2022-06-21'],
  ['https://maximerit.com/conseils/', '2022-06-21'],
];

const csvEscape = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const rows = RAW.map(([url, lastmod]) => {
  const u = new URL(url);
  const path = u.pathname;
  const lang = path.startsWith('/language/en') ? 'en' : 'fr';
  const depth = path.split('/').filter(Boolean).length;
  return { url, path, lang, lastmod, depth };
});

const header = [
  'old_url', 'path', 'lang', 'lastmod', 'depth',
  // Colonnes de VALEUR — à remplir depuis Google Search Console / export backlinks :
  'gsc_clicks', 'gsc_impressions', 'gsc_position', 'ref_domains',
  // Colonnes de crawl technique — à remplir par scripts/seo-crawl.mjs :
  'http_status', 'title', 'h1', 'canonical', 'indexable',
];

const lines = [header.join(',')];
for (const r of rows) {
  lines.push([
    r.url, r.path, r.lang, r.lastmod, r.depth,
    '', '', '', '', '', '', '', '', '',
  ].map(csvEscape).join(','));
}

const out = new URL('../specs/phase-0-seo-migration/audit/url-inventory.csv', import.meta.url);
mkdirSync(dirname(out.pathname), { recursive: true });
writeFileSync(out, lines.join('\n') + '\n');

const nFr = rows.filter((r) => r.lang === 'fr').length;
const nEn = rows.filter((r) => r.lang === 'en').length;
console.log(`Inventaire écrit : ${rows.length} URLs (${nFr} FR, ${nEn} EN) → ${out.pathname}`);
