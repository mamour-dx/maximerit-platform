#!/usr/bin/env node
/**
 * Phase 0 — Master URL Migration File.
 *
 * Lit l'inventaire (url-inventory.csv) et applique un jeu de règles ORDONNÉES et
 * reproductibles pour proposer, pour chaque ancienne URL : action (KEEP/301/410),
 * nouvelle URL cible (nouvelle architecture), justification et niveau de confiance.
 *
 *   HIGH        = décision structurelle certaine (doublon, exemple du cahier, changement
 *                 de structure de langue) — ne dépend pas des données de valeur.
 *   PENDING_GSC = la destination est proposée, mais l'arbitrage final KEEP vs 301 vs 410
 *                 exige les données de valeur (Google Search Console + backlinks).
 *                 Principe (constitution Art. V, cahier §40) : aucune URL ne disparaît en 410
 *                 sans preuve d'absence de valeur -> par défaut on 301 vers une destination
 *                 pertinente plutôt que 410 tant que la valeur est inconnue.
 *
 * Sortie : specs/phase-0-seo-migration/audit/master-url-migration-file.csv
 */
import { readFileSync, writeFileSync } from 'node:fs';

const INV = new URL('../specs/phase-0-seo-migration/audit/url-inventory.csv', import.meta.url);
const OUT = new URL('../specs/phase-0-seo-migration/audit/master-url-migration-file.csv', import.meta.url);

// --- Nouvelle architecture : chemins FR cibles (le préfixe /en est ajouté pour l'anglais) ---
const T = {
  home: '/',
  about: '/qui-nous-sommes/',            // conservé (antériorité) = page "À propos"
  contact: '/contact/',                  // conservé
  ese: '/entreprises/executive-search/',
  recrutement: '/entreprises/recrutement/',
  interim: '/entreprises/interim/',
  rhPaie: '/entreprises/externalisation-rh-paie/',
  finance: '/entreprises/finance-performance/',
  qhseEsg: '/entreprises/qhse-esg/',
  formation: '/entreprises/formation/',
  entreprises: '/entreprises/',          // hub services (fallback advisory/IT/general)
  services: '/secteurs/services/',
  jobs: '/candidats/offres-demploi/',    // listing (offres individuelles = /jobs/<slug>/)
  deposerCv: '/candidats/deposer-mon-cv/',
  vivier: '/candidats/rejoindre-le-vivier/',
  barometres: '/ressources/barometres/',
};

// --- 1) Overrides EXACTS par chemin (chemin FR sans /language/en) ---
// [action, targetFrPath, confidence, justification]
const EXACT = {
  '/': ['KEEP', T.home, 'HIGH', 'Page d’accueil — conservée.'],
  '/home/': ['301', T.home, 'HIGH', 'Doublon de la page d’accueil.'],
  '/about/': ['301', T.about, 'PENDING_GSC', 'Doublon EN de « qui-nous-sommes » à la racine.'],
  '/qui-nous-sommes/': ['KEEP', T.about, 'HIGH', 'Page institutionnelle « À propos » — URL FR conservée.'],
  '/nos-atouts/': ['301', T.about, 'PENDING_GSC', 'Contenu « nos atouts » intégré à la page À propos.'],
  '/contact/': ['KEEP', T.contact, 'HIGH', 'Page contact — conservée.'],
  '/contact-2/': ['301', T.contact, 'HIGH', 'Doublon de /contact/.'],
  '/contactez-nous/': ['301', T.contact, 'HIGH', 'Doublon de /contact/.'],
  '/demande-de-devis/': ['301', T.contact, 'PENDING_GSC', 'Demande de devis regroupée dans le formulaire de contact/lead.'],
  // Recrutement / candidats (exemples explicites du cahier §30)
  '/recrutement/': ['301', T.recrutement, 'HIGH', 'Cahier §30 : /recrutement/ → /entreprises/recrutement/.'],
  '/interim/': ['301', T.interim, 'HIGH', 'Cahier §30 : /interim/ → /entreprises/interim/.'],
  '/offres-demploi/': ['301', T.jobs, 'HIGH', 'Listing des offres.'],
  '/offre-demplois/': ['301', T.jobs, 'HIGH', 'Doublon (faute de frappe) du listing des offres.'],
  '/depot-cv/': ['301', T.deposerCv, 'HIGH', 'Dépôt de CV.'],
  '/depot-de-candidature-spontanee/': ['301', T.vivier, 'PENDING_GSC', 'Candidature spontanée → rejoindre le vivier.'],
  '/depot-de-candidature-2/': ['301', T.deposerCv, 'HIGH', 'Doublon de dépôt de candidature.'],
  '/publier-une-offre-demploi/': ['301', T.recrutement, 'PENDING_GSC', 'Publication d’offre = fonction back-office, retirée du public.'],
  '/tableau-de-bord-des-offres-demploi/': ['301', T.recrutement, 'PENDING_GSC', 'Tableau de bord = fonction back-office, retirée du public.'],
  // Offres individuelles anciennes/expirées
  '/operations-supervisor/': ['301', T.jobs, 'PENDING_GSC', 'Ancienne offre expirée → listing (Google : rediriger l’expiré vers une page pertinente).'],
  '/base-manager/': ['301', T.jobs, 'PENDING_GSC', 'Ancienne offre expirée → listing.'],
  '/cost-accountant/': ['301', T.jobs, 'PENDING_GSC', 'Ancienne offre expirée → listing.'],
  '/un-agent-de-liaison-communautaire/': ['301', T.jobs, 'PENDING_GSC', 'Ancienne offre expirée → listing.'],
  // ESG / développement durable
  '/esg/': ['301', T.qhseEsg, 'PENDING_GSC', 'ESG regroupé sous QHSE & ESG.'],
  '/developpement-durable/': ['301', T.qhseEsg, 'PENDING_GSC', 'Développement durable regroupé sous QHSE & ESG.'],
  '/etude-dimpact-environnemental-et-social/': ['301', T.qhseEsg, 'PENDING_GSC', 'Étude d’impact → QHSE & ESG.'],
  // Formation
  '/formations/': ['301', T.formation, 'PENDING_GSC', 'Formations → Entreprises/Formation.'],
  // Secteur hors priorité
  '/hotellerie-et-tourisme/': ['301', T.services, 'PENDING_GSC', 'Hors verticales prioritaires → Secteurs/Services (candidat 410 si sans valeur).'],
  // Site web (offre abandonnée)
  '/conception-et-realisation-de-site-web/': ['301', T.entreprises, 'PENDING_GSC', 'Offre « création de site » abandonnée (candidat 410 si sans valeur).'],
};

// --- 2) Règles par mots-clés (buckets) sur le chemin, dans l'ordre ---
// Chaque règle : [regex, targetFrPath, confidence, justification]
const BUCKETS = [
  [/qhse|qhes|hygiene|code-de-conduite|code-of-conduct|manuel-des-procedures|procedures-manual|politique-qhse|qhse-policy/, T.qhseEsg, 'PENDING_GSC', 'Prestation QHSE → Entreprises/QHSE & ESG.'],
  [/environmental|environnemental|sustainable|developpement-durable/, T.qhseEsg, 'PENDING_GSC', 'ESG/environnement → QHSE & ESG.'],
  [/finance|financing|financement|business-plan|budget|reporting|immobilisation|asset-management|comptab|accounting|performance-indicator|indicateurs-de-performance|organizational-audit|audit-organisationnel/, T.finance, 'PENDING_GSC', 'Prestation finance → Entreprises/Finance & Performance.'],
  [/recruitment|recrutement/, T.recrutement, 'PENDING_GSC', 'Recrutement → Entreprises/Recrutement.'],
  [/temping|interim/, T.interim, 'PENDING_GSC', 'Intérim / mise à disposition → Entreprises/Intérim.'],
  [/payroll|paie|declarations|hr-|-hr|g-rh|g-hr|ressources-humaines|human-resources|suivi-rh|hr-monitoring|hr-consulting|staff-evaluation|evaluation-du-personnel|salary-survey|enquetes-de-salaires|coaching|reception-and-integration|accueil-et-integration|hr-training|formation-en-rh/, T.rhPaie, 'PENDING_GSC', 'Prestation RH/paie → Entreprises/Externalisation RH & Paie.'],
  [/finance-training|formation-en-finance|qhse-training|formation-en-qhse|training|formation/, T.formation, 'PENDING_GSC', 'Formation → Entreprises/Formation.'],
  [/it-support|support-it|computer-systems|informatiques|website|site-web|video-surveillance|project-management|management-des-projet|gestion-des-projets|systeme-de-gestion|management-systems/, T.entreprises, 'PENDING_GSC', 'Prestation IT/projets (dépriorisée) → hub Entreprises (candidat 410 si sans valeur).'],
  [/facilit|general-services|services-generaux|corporate-services|organisation-of-company-events|organisation-et-assistance/, T.services, 'PENDING_GSC', 'Services généraux → Secteurs/Services.'],
  [/consulting|conseil|creation-of-services|creation-de-services|elaboration/, T.entreprises, 'PENDING_GSC', 'Conseil/advisory → hub Entreprises.'],
  [/who-are-we|our-strengths|qui-nous-sommes|nos-atouts|about/, T.about, 'PENDING_GSC', 'Institutionnel → À propos.'],
  [/contact|request-quote|quote|devis/, T.contact, 'PENDING_GSC', 'Contact/devis → page contact.'],
  [/job-offer|offre|job|emploi/, T.jobs, 'PENDING_GSC', 'Offres → listing.'],
  [/submission-of-application|candidature|depot-cv|cv/, T.deposerCv, 'PENDING_GSC', 'Candidature → dépôt de CV.'],
  [/hospitality|hotellerie|tourism/, T.services, 'PENDING_GSC', 'Hors verticales prioritaires → Secteurs/Services.'],
];

function frTargetFor(pathFr) {
  if (EXACT[pathFr]) return EXACT[pathFr];
  for (const [re, target, conf, why] of BUCKETS) {
    if (re.test(pathFr)) return ['301', target, conf, why];
  }
  return ['301', T.entreprises, 'PENDING_GSC', 'Non classé automatiquement — à arbitrer manuellement avec données GSC.'];
}

// --- Chargement de l'inventaire ---
const rows = readFileSync(INV, 'utf8').trim().split('\n').slice(1).map((l) => {
  // parsing CSV simple (pas de virgules dans nos valeurs d'inventaire)
  const c = l.split(',');
  return { old_url: c[0], path: c[1], lang: c[2], lastmod: c[3] };
});

const csvEscape = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const header = ['old_url', 'lang', 'lastmod', 'action', 'new_url', 'confidence', 'justification',
  'gsc_clicks', 'gsc_impressions', 'ref_domains', 'final_decision'];
const out = [header.join(',')];

const counts = { KEEP: 0, '301': 0, '410': 0 };
const confCounts = { HIGH: 0, PENDING_GSC: 0 };

for (const r of rows) {
  const pathFr = r.lang === 'en' ? r.path.replace(/^\/language\/en/, '') || '/' : r.path;
  let [action, targetFr, conf, why] = frTargetFor(pathFr);

  // Application du préfixe langue
  let newUrl;
  if (r.lang === 'en') {
    // Toute URL EN change de structure (/language/en → /en) : au minimum un 301.
    newUrl = targetFr === '/' ? '/en/' : '/en' + targetFr;
    if (action === 'KEEP') { action = '301'; conf = 'HIGH'; why = 'Changement de structure de langue /language/en → /en (ADR-0002).'; }
  } else {
    newUrl = targetFr;
  }

  counts[action] = (counts[action] || 0) + 1;
  confCounts[conf] = (confCounts[conf] || 0) + 1;

  out.push([
    r.old_url, r.lang, r.lastmod, action, newUrl, conf, why,
    '', '', '', '', // valeur GSC + décision finale à compléter
  ].map(csvEscape).join(','));
}

writeFileSync(OUT, out.join('\n') + '\n');
console.log(`Migration map écrite : ${rows.length} lignes → ${OUT.pathname}`);
console.log('Actions :', counts);
console.log('Confiance :', confCounts);
