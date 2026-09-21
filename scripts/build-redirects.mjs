#!/usr/bin/env node
/**
 * Phase 4b — Génère la table de redirections runtime consommée par le middleware Next,
 * à partir du Master URL Migration File (Phase 0). Ne dépend pas de la DB (CI-friendly).
 *
 * Sortie : apps/web/src/redirects.generated.json
 *   { "/ancien/chemin/": { "to": "/nouveau/chemin/", "status": 301 }, "/gone/": { "status": 410 } }
 *
 * Les entrées KEEP sont ignorées (l'URL ne bouge pas). Les redirections gérées par le CMS
 * (collection Redirects) seront fusionnées ici par un sync ultérieur (hook Payload — Phase 6/11).
 */
import { readFileSync, writeFileSync } from "node:fs";

const CSV = new URL("../specs/phase-0-seo-migration/audit/master-url-migration-file.csv", import.meta.url);
const OUT = new URL("../apps/web/src/redirects.generated.json", import.meta.url);

function parseCsv(text) {
  const rows = []; let row = [], f = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; }
    else if (c !== "\r") f += c;
  }
  if (f.length || row.length) { row.push(f); rows.push(row); }
  return rows.filter((r) => r.length > 1);
}

const pathOf = (u) => (u.startsWith("http") ? new URL(u).pathname : u);

const [header, ...body] = parseCsv(readFileSync(CSV, "utf8"));
const rows = body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));

const map = {};
let n301 = 0, n410 = 0;
for (const r of rows) {
  const from = pathOf(r.old_url);
  if (r.action === "301") { map[from] = { to: pathOf(r.new_url), status: 301 }; n301++; }
  else if (r.action === "410") { map[from] = { status: 410 }; n410++; }
  // KEEP / NOINDEX : pas d'entrée de redirection ici.
}

writeFileSync(OUT, JSON.stringify(map, null, 2) + "\n");
console.log(`Redirections générées : ${Object.keys(map).length} (${n301}×301, ${n410}×410) → ${OUT.pathname}`);
