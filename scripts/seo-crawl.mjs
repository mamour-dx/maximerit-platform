#!/usr/bin/env node
/**
 * Phase 0 — Enrichissement technique de l'inventaire (crawl).
 *
 * Pour chaque ancienne URL : statut HTTP, redirections, title, H1, canonical, indexabilité.
 * Réécrit specs/phase-0-seo-migration/audit/url-inventory.csv avec les colonnes remplies.
 *
 * ⚠️ Contrainte réelle (PROJECT_BASELINE P1) : le serveur de production bloque les requêtes
 * scriptées (403 WAF). Ce script tente un fetch avec en-têtes navigateur ; les URLs bloquées
 * sont marquées `http_status=BLOCKED_WAF`. Pour un crawl exhaustif fiable, deux voies :
 *   1. exécuter depuis un contexte autorisé par le WAF (IP/UA whitelistés) ;
 *   2. ingérer l'export Google Search Console (couverture d'indexation) — fourni par le client —
 *      via `--gsc <export.csv>` (colonnes attendues : url, clicks, impressions, position).
 *
 * Usage :
 *   node scripts/seo-crawl.mjs            # crawl technique
 *   node scripts/seo-crawl.mjs --gsc data/gsc-export.csv   # + fusion valeur GSC
 */
import { readFileSync, writeFileSync } from 'node:fs';

const INV = new URL('../specs/phase-0-seo-migration/audit/url-inventory.csv', import.meta.url);
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';

function parseCsv(text) {
  const rows = [];
  let row = [], f = '', q = false;
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
const esc = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const pick = (html, re) => { const m = html.match(re); return m ? m[1].trim().replace(/\s+/g, ' ') : ''; };

async function crawlOne(url) {
  try {
    const res = await fetch(url, { redirect: 'manual', headers: { 'User-Agent': UA, 'Accept': 'text/html' } });
    const status = res.status;
    if (status === 403) return { http_status: 'BLOCKED_WAF', title: '', h1: '', canonical: '', indexable: '' };
    if (status >= 300 && status < 400) return { http_status: `${status}→${res.headers.get('location') || ''}`, title: '', h1: '', canonical: '', indexable: '' };
    const html = await res.text();
    const robots = pick(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
    return {
      http_status: String(status),
      title: pick(html, /<title[^>]*>([^<]*)<\/title>/i),
      h1: pick(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, ''),
      canonical: pick(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i),
      indexable: /noindex/i.test(robots) ? 'no' : 'yes',
    };
  } catch (e) {
    return { http_status: `ERR:${e.code || e.message}`, title: '', h1: '', canonical: '', indexable: '' };
  }
}

const [header, ...body] = parseCsv(readFileSync(INV, 'utf8'));
const rows = body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));

// Fusion GSC optionnelle
const gscArg = process.argv.indexOf('--gsc');
let gsc = new Map();
if (gscArg !== -1 && process.argv[gscArg + 1]) {
  const [gh, ...gb] = parseCsv(readFileSync(process.argv[gscArg + 1], 'utf8'));
  const idx = (n) => gh.findIndex((h) => h.toLowerCase().includes(n));
  const iu = idx('url') !== -1 ? idx('url') : idx('page');
  gsc = new Map(gb.map((r) => [r[iu], { clicks: r[idx('click')], impressions: r[idx('impress')], position: r[idx('position')] }]));
  console.log(`GSC : ${gsc.size} lignes fusionnées depuis ${process.argv[gscArg + 1]}`);
}

let blocked = 0;
for (const r of rows) {
  const c = await crawlOne(r.old_url);
  Object.assign(r, c);
  if (c.http_status === 'BLOCKED_WAF') blocked++;
  const g = gsc.get(r.old_url);
  if (g) { r.gsc_clicks = g.clicks; r.gsc_impressions = g.impressions; r.gsc_position = g.position; }
  process.stdout.write(c.http_status === 'BLOCKED_WAF' ? '.' : '#');
}
process.stdout.write('\n');

const out = [header.join(',')];
for (const r of rows) out.push(header.map((h) => esc(r[h])).join(','));
writeFileSync(INV, out.join('\n') + '\n');
console.log(`Crawl terminé : ${rows.length} URLs, ${blocked} bloquées par le WAF.`);
if (blocked) console.log('→ Voir l’en-tête du script pour les deux voies de contournement (contexte autorisé / export GSC).');
