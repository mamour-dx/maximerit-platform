/**
 * Phase 2 — Tests SEO du registre de routes. `node --test scripts/tests/routes.test.mjs`
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const routes = JSON.parse(readFileSync(new URL('../../specs/phase-2-ux-seo/route-registry.json', import.meta.url), 'utf8'));
const MAP = new URL('../../specs/phase-0-seo-migration/audit/master-url-migration-file.csv', import.meta.url);

const paths = routes.map((r) => r.path);
const pathSet = new Set(paths);
const byLocalePath = new Set(routes.map((r) => `${r.locale}:${r.path}`));

function parseCsv(text) {
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
    else if (c !== '\r') f += c;
  }
  if (f.length || row.length) { row.push(f); rows.push(row); }
  return rows.filter((r) => r.length > 1);
}

// 1. Pas de conflit de routes (chemins uniques)
test('pas de conflit de routes (chemins uniques)', () => {
  assert.equal(pathSet.size, paths.length, 'chemins dupliqués détectés');
});

// 2. Toute route a un titre (source du H1 unique) et un path
test('toute route a un path et un titre', () => {
  for (const r of routes) {
    assert.ok(r.path?.startsWith('/'), `path invalide: ${JSON.stringify(r)}`);
    assert.ok(r.title?.trim(), `titre manquant pour ${r.path}`);
  }
});

// 3. Fil d'Ariane / maillage : tout parent existe dans la même langue (pas d'orphelin)
test('parents (fil d’Ariane) résolus — aucune page orpheline', () => {
  const noParentTypes = new Set(['home', 'landing', 'utility', 'system']);
  for (const r of routes) {
    if (r.parent == null) { assert.ok(noParentTypes.has(r.type), `parent null inattendu pour ${r.path} (${r.type})`); continue; }
    assert.ok(byLocalePath.has(`${r.locale}:${r.parent}`), `parent introuvable: ${r.locale}:${r.parent} (enfant ${r.path})`);
  }
});

// 4. i18n : EN sous /en, FR à la racine
test('locales : EN préfixé /en, FR à la racine', () => {
  for (const r of routes) {
    if (r.locale === 'en') assert.ok(r.path === '/en/' || r.path.startsWith('/en/'), `EN sans préfixe: ${r.path}`);
    else assert.ok(!r.path.startsWith('/en/'), `FR avec préfixe /en: ${r.path}`);
  }
});

// 5. hreflang : réciprocité FR↔EN par hrefGroup (sauf singleLocale)
test('hreflang : chaque groupe non single-locale a une variante FR ET EN', () => {
  const groups = new Map();
  for (const r of routes) {
    if (r.type === 'system') continue;
    if (!groups.has(r.hrefGroup)) groups.set(r.hrefGroup, new Set());
    groups.get(r.hrefGroup).add(r.locale);
  }
  for (const r of routes) {
    if (r.type === 'system' || r.singleLocale) continue;
    const locs = groups.get(r.hrefGroup);
    assert.ok(locs.has('fr') && locs.has('en'), `hreflang incomplet pour groupe ${r.hrefGroup} (${[...locs]})`);
  }
});

// 6. Indexabilité
test('règles d’indexabilité (système non indexable, landing hors nav)', () => {
  const sys = routes.find((r) => r.type === 'system');
  assert.equal(sys.indexable, false, '404/système doit être non indexable');
  for (const r of routes.filter((x) => x.type === 'landing')) {
    assert.equal(r.inNav, false, 'les LP ne doivent pas être dans la nav principale');
  }
});

// 7. Bouclage Phase 0 ↔ Phase 2 : toute cible KEEP/301 de la carte de migration existe comme route
test('migration : chaque cible (KEEP/301) existe dans le registre de routes', () => {
  const [header, ...body] = parseCsv(readFileSync(MAP, 'utf8'));
  const rows = body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
  const missing = [];
  for (const r of rows) {
    if (r.action !== 'KEEP' && r.action !== '301') continue;
    const p = r.new_url.startsWith('http') ? new URL(r.new_url).pathname : r.new_url;
    if (!pathSet.has(p)) missing.push(`${r.old_url} → ${p}`);
  }
  assert.deepEqual(missing, [], `Cibles de migration sans route correspondante:\n${missing.join('\n')}`);
});

// 8. Verticale Mining : silos présents (hub, 4 disciplines, métiers, recrutement-minier, pays)
test('silos Mining : hub + 4 disciplines + métiers + pages pays présents', () => {
  assert.ok(pathSet.has('/mines/'), 'hub /mines/ manquant');
  assert.ok(pathSet.has('/mines/recrutement-minier/'), 'page commerciale minière manquante');
  const disciplines = routes.filter((r) => r.type === 'discipline' && r.locale === 'fr');
  assert.equal(disciplines.length, 4, '4 disciplines Mining attendues');
  const metiers = routes.filter((r) => r.type === 'metier' && r.locale === 'fr');
  assert.equal(metiers.length, 26, '26 fiches métiers FR attendues (taxonomie)');
  const pays = routes.filter((r) => r.type === 'country' && r.locale === 'fr');
  assert.equal(pays.length, 7, '7 pages pays prioritaires attendues');
});

// 9. Répartition SEO 4 niveaux : chaque route de contenu porte un seoLevel valide
test('SEO : niveaux 1–4 renseignés sur les pages de contenu', () => {
  const contentTypes = new Set(['home', 'section', 'service', 'sector', 'sector-hub', 'commercial', 'listing', 'discipline', 'metier', 'country', 'candidate-page', 'resource-section', 'tool', 'page', 'landing']);
  for (const r of routes) {
    if (!contentTypes.has(r.type)) continue;
    assert.ok([1, 2, 3, 4].includes(r.seoLevel), `seoLevel invalide (${r.seoLevel}) pour ${r.path}`);
  }
});
