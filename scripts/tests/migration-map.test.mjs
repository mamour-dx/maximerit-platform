/**
 * Phase 0 — Tests de non-régression des URLs (couche « intégrité »).
 *
 * Exécution : `node --test scripts/tests/`
 *
 * Deux modes :
 *  - INTÉGRITÉ (par défaut, hors ligne) : valide la cohérence du Master URL Migration File
 *    (couverture 100 %, actions valides, KEEP = identité, pas d'auto-redirection, PAS DE CHAÎNE
 *    A→B→C, confiance valide). Runnable dès la Phase 0.
 *  - LIVE (si BASE_URL défini) : vérifiera en Phase 11 le statut HTTP réel de chaque ancienne URL
 *    contre l'action attendue. Documenté ici, activé à la recette.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const INV = new URL('../../specs/phase-0-seo-migration/audit/url-inventory.csv', import.meta.url);
const MAP = new URL('../../specs/phase-0-seo-migration/audit/master-url-migration-file.csv', import.meta.url);

// Parseur CSV minimal gérant les champs entre guillemets.
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (ch === '\r') { /* skip */ }
    else field += ch;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ''));
}

function load(url) {
  const [header, ...body] = parseCsv(readFileSync(url, 'utf8'));
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}

const pathOf = (u) => (u.startsWith('http') ? new URL(u).pathname : u);

const inventory = load(INV);
const map = load(MAP);
const byOld = new Map(map.map((r) => [r.old_url, r]));
const oldPaths = new Set(inventory.map((r) => pathOf(r.old_url)));
const VALID_ACTIONS = new Set(['KEEP', '301', '410']);
const VALID_CONF = new Set(['HIGH', 'PENDING_GSC']);

test('couverture : 100 % des anciennes URL sont présentes dans la carte (cahier §40)', () => {
  for (const inv of inventory) assert.ok(byOld.has(inv.old_url), `URL absente de la carte : ${inv.old_url}`);
  assert.equal(map.length, inventory.length, 'la carte et l’inventaire doivent avoir la même taille');
});

test('pas de doublon d’ancienne URL dans la carte', () => {
  assert.equal(byOld.size, map.length, 'une ancienne URL apparaît plusieurs fois');
});

test('chaque action est valide (KEEP / 301 / 410)', () => {
  for (const r of map) assert.ok(VALID_ACTIONS.has(r.action), `action invalide "${r.action}" pour ${r.old_url}`);
});

test('chaque niveau de confiance est valide', () => {
  for (const r of map) assert.ok(VALID_CONF.has(r.confidence), `confiance invalide "${r.confidence}" pour ${r.old_url}`);
});

test('KEEP = identité (nouvelle URL == ancien chemin)', () => {
  for (const r of map.filter((x) => x.action === 'KEEP')) {
    assert.equal(pathOf(r.new_url), pathOf(r.old_url), `KEEP doit conserver l’URL : ${r.old_url}`);
  }
});

test('301 : cible présente et pas d’auto-redirection', () => {
  for (const r of map.filter((x) => x.action === '301')) {
    assert.ok(r.new_url && r.new_url !== '', `301 sans cible : ${r.old_url}`);
    assert.notEqual(pathOf(r.new_url), pathOf(r.old_url), `301 vers soi-même : ${r.old_url}`);
  }
});

test('410 : aucune cible', () => {
  for (const r of map.filter((x) => x.action === '410')) {
    assert.equal(r.new_url, '', `410 ne doit pas avoir de cible : ${r.old_url}`);
  }
});

test('PAS DE CHAÎNE de redirection A→B→C (cahier §31) : toute cible 301 est finale', () => {
  for (const r of map.filter((x) => x.action === '301')) {
    const targetPath = pathOf(r.new_url);
    if (oldPaths.has(targetPath)) {
      const targetRow = map.find((x) => pathOf(x.old_url) === targetPath);
      assert.equal(
        targetRow?.action, 'KEEP',
        `Chaîne détectée : ${r.old_url} → ${r.new_url}, mais ${targetPath} est lui-même ${targetRow?.action}. ` +
        `Rediriger directement vers la destination finale.`,
      );
    }
  }
});

// --- Mode LIVE (Phase 11) ---
const BASE = process.env.BASE_URL;
test('LIVE : statut HTTP réel conforme à l’action (activé si BASE_URL défini)', { skip: !BASE }, async () => {
  for (const r of map) {
    const target = new URL(pathOf(r.old_url), BASE).toString();
    const res = await fetch(target, { redirect: 'manual' });
    if (r.action === 'KEEP') assert.equal(res.status, 200, `${target} devrait renvoyer 200`);
    else if (r.action === '301') {
      assert.ok([301, 308].includes(res.status), `${target} devrait renvoyer 301, reçu ${res.status}`);
      assert.equal(pathOf(res.headers.get('location') || ''), pathOf(r.new_url), `mauvaise destination pour ${target}`);
    } else if (r.action === '410') assert.equal(res.status, 410, `${target} devrait renvoyer 410`);
  }
});
