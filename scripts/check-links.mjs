#!/usr/bin/env node
// Crawler de liens internes : part de /, /en/, du sitemap et d'amorces, suit tous les liens <a href>,
// vérifie le statut HTTP de chaque URL, l'existence des ancres (#id) dans la page cible, et les
// alternates hreflang / canonical. Échoue (exit 1) s'il reste un lien cassé.
//
// Usage : node scripts/check-links.mjs http://localhost:3000 [--max 600]
//   (cibler un serveur de production : `pnpm --filter web build && pnpm --filter web start`)

const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const maxIdx = process.argv.indexOf("--max");
const MAX_PAGES = maxIdx > 0 ? Number(process.argv[maxIdx + 1]) : 600;
const SITE_HOSTS = new Set(["www.maximerit.com", "maximerit.com", new URL(base).host]);

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"');

/** URL absolue ou relative → chemin interne (+ query), ou null si externe / non-HTTP. */
function toInternal(href, from) {
  if (!href || /^(mailto:|tel:|javascript:|data:)/i.test(href)) return null;
  let u;
  try {
    u = new URL(decode(href), from);
  } catch {
    return null;
  }
  if (!SITE_HOSTS.has(u.host)) return null;
  return { path: u.pathname + u.search, hash: u.hash.replace(/^#/, "") };
}

const pages = new Map(); // path → { status, html, redirect }
const queue = [];
const referrers = new Map(); // path → Set(page d'origine)
const anchorChecks = []; // { from, to, hash }
const external = new Set();

function enqueue(path, from) {
  if (!referrers.has(path)) referrers.set(path, new Set());
  if (from) referrers.get(path).add(from);
  if (!pages.has(path) && !queue.includes(path)) queue.push(path);
}

async function fetchPage(path) {
  try {
    const res = await fetch(base + path, { redirect: "manual", headers: { accept: "text/html" } });
    const status = res.status;
    const redirect = res.headers.get("location");
    const type = res.headers.get("content-type") || "";
    const html = status === 200 && type.includes("html") ? await res.text() : status === 200 ? (await res.text(), "") : "";
    return { status, redirect, html, type };
  } catch (err) {
    return { status: 0, redirect: null, html: "", error: String(err) };
  }
}

// Amorces : accueil, sitemaps, robots.
for (const p of ["/", "/en/"]) enqueue(p, "(amorce)");
try {
  for (const sm of ["/sitemap.xml", "/sitemap-jobs.xml"]) {
    const res = await fetch(base + sm);
    if (res.ok) {
      const xml = await res.text();
      for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
        const t = toInternal(m[1], base);
        if (t) enqueue(t.path, sm);
      }
    }
  }
} catch {
  /* sitemap indisponible : on crawle depuis les liens */
}

while (queue.length && pages.size < MAX_PAGES) {
  const path = queue.shift();
  if (pages.has(path)) continue;
  const page = await fetchPage(path);
  pages.set(path, page);

  // Redirection : on suit la cible (une seule fois) pour vérifier qu'elle existe.
  if (page.status >= 300 && page.status < 400 && page.redirect) {
    const t = toInternal(page.redirect, base + path);
    if (t) enqueue(t.path, `${path} (redirect)`);
    continue;
  }
  if (!page.html) continue;

  // <a href>
  for (const m of page.html.matchAll(/<a\s[^>]*?href="([^"]*)"/g)) {
    const href = decode(m[1]);
    const t = toInternal(href, base + path);
    if (!t) {
      if (/^https?:/i.test(href)) external.add(href);
      continue;
    }
    if (t.path.startsWith("/_next/")) continue;
    if (t.hash) anchorChecks.push({ from: path, to: t.path || path, hash: t.hash });
    enqueue(t.path, path);
  }
  // <form action> (GET vers une page interne)
  for (const m of page.html.matchAll(/<form\s[^>]*?action="([^"]*)"/g)) {
    const t = toInternal(m[1], base + path);
    if (t && !t.path.startsWith("/_next/") && !/\/(submit-lead|apply)/.test(t.path)) enqueue(t.path, `${path} (form)`);
  }
  // hreflang alternates + canonical
  for (const m of page.html.matchAll(/<link\s[^>]*?>/g)) {
    const tag = m[0];
    if (!/rel="(alternate|canonical)"/.test(tag)) continue;
    const href = /href="([^"]*)"/.exec(tag)?.[1];
    const t = href && toInternal(href, base + path);
    if (t) enqueue(t.path, `${path} (hreflang/canonical)`);
  }
}

// Ancres : l'id doit exister dans la page cible.
const anchorProblems = [];
for (const { from, to, hash } of anchorChecks) {
  const target = pages.get(to);
  if (!target?.html) continue;
  const re = new RegExp(`\\sid="${hash.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`);
  if (!re.test(target.html)) anchorProblems.push({ from, to, hash });
}

// Rapport
const broken = [];
const redirects = [];
let ok = 0;
for (const [path, p] of pages) {
  if (p.status === 200) ok++;
  else if (p.status >= 300 && p.status < 400) redirects.push(path);
  else broken.push(path);
}

const who = (path) => [...(referrers.get(path) ?? [])].slice(0, 3).join(", ");
console.log(`\nCrawl de ${base} — ${pages.size} URL internes testées`);
console.log(`  OK (200) : ${ok}   redirections : ${redirects.length}   en erreur : ${broken.length}   ancres cassées : ${anchorProblems.length}`);
console.log(`  liens externes (non testés) : ${external.size}`);
if (process.argv.includes("--list")) {
  const groups = {};
  for (const path of pages.keys()) {
    const key = "/" + (path.split("/")[1] === "en" ? "en/" + (path.split("/")[2] ?? "") : path.split("/")[1] ?? "");
    groups[key] = (groups[key] ?? 0) + 1;
  }
  console.log("  par section :", JSON.stringify(groups));
  console.log("  externes :", [...external].join(" | "));
}

if (redirects.length) {
  console.log("\nRedirections (liens internes qui ne pointent pas directement la cible) :");
  for (const r of redirects) console.log(`  ${pages.get(r).status} ${r} → ${pages.get(r).redirect}   ← ${who(r)}`);
}
if (broken.length) {
  console.log("\nLIENS CASSÉS :");
  for (const b of broken) console.log(`  ${pages.get(b).status} ${b}   ← ${who(b)}`);
}
if (anchorProblems.length) {
  console.log("\nANCRES INTROUVABLES :");
  for (const a of anchorProblems) console.log(`  ${a.to}#${a.hash}   ← ${a.from}`);
}
process.exit(broken.length || anchorProblems.length ? 1 : 0);
