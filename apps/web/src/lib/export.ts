// Export des candidats / candidatures depuis le back-office (CSV, Excel).
// Logique 100 % serveur (Art. VII : pas de logique métier dans l'UI) ; l'endpoint Payload ne fait qu'appeler `handleExport`.
// Sécurité (Art. VI) : rôle vérifié, accès Payload appliqué (overrideAccess: false), filtres validés par Payload,
// protection contre l'injection de formules (CSV), chaque export est journalisé.
import type { Field, Payload, PayloadRequest, Sort, Where } from "payload";
import { mergeListSearchAndWhere } from "payload/shared";
import type { Application, Candidate, Cv, Job, Tag } from "@/payload-types";
import { canExport, EXPORT_FORMATS, EXPORTABLE, MAX_EXPORT_ROWS, type ExportCollection, type ExportFormat } from "./export-access";

// ───────────────────────────── Types ─────────────────────────────

export type Link = { text: string; url: string };
export type Cell = string | number | boolean | Date | Link | null | undefined;

interface Ctx {
  /** Libellé lisible d'une valeur de liste de choix (ex. « shortlist-client » → « Shortlist client »). */
  label: (collection: ExportCollection, field: string, value: unknown) => string;
  /** Adresse absolue (liens cliquables dans le fichier). */
  abs: (path: string) => string;
  /** Offres auxquelles chaque candidat a postulé (export « candidats »). */
  appliedTo: Map<number, string[]>;
}

interface Column<T> {
  header: string;
  width?: number;
  value: (doc: T, ctx: Ctx) => Cell;
}

export class ExportError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export interface ExportRequest {
  collection: ExportCollection;
  format: ExportFormat;
  where?: Where;
  search?: string;
  sort?: Sort;
}

export interface ExportFile {
  body: Uint8Array;
  filename: string;
  contentType: string;
  count: number;
}

// ───────────────────────────── Helpers de valeurs ─────────────────────────────

const obj = <T>(v: unknown): T | null => (v && typeof v === "object" ? (v as T) : null);
const idOf = (v: unknown): number | null => (typeof v === "number" ? v : (obj<{ id: number }>(v)?.id ?? null));
const list = (v: unknown): string => (Array.isArray(v) ? v.filter(Boolean).join(", ") : "");
const date = (v: unknown): Date | null => (typeof v === "string" && v ? new Date(v) : null);
const cvLink = (cv: unknown, ctx: Ctx): Link | null => {
  const c = obj<Cv>(cv);
  return c?.url ? { text: c.filename ?? "Document", url: ctx.abs(c.url) } : null;
};
const ficheLink = (collection: ExportCollection, id: number, ctx: Ctx): Link => ({
  text: "Ouvrir la fiche",
  url: ctx.abs(`/admin/collections/${collection}/${id}`),
});

// ───────────────────────────── Colonnes ─────────────────────────────
// Notes internes de l'équipe et données techniques (parsing CV) volontairement exclues : un export peut être
// transmis à l'extérieur (client, shortlist).

const CANDIDATE_COLUMNS: Column<Candidate>[] = [
  { header: "ID", width: 8, value: (c) => c.id },
  { header: "Prénom", value: (c) => c.firstName },
  { header: "Nom", value: (c) => c.lastName },
  { header: "Email", width: 28, value: (c) => c.email },
  { header: "Téléphone", value: (c) => c.phone },
  { header: "WhatsApp", value: (c) => c.whatsapp },
  { header: "Poste actuel", width: 26, value: (c) => c.currentPosition },
  { header: "Entreprise actuelle", width: 22, value: (c) => c.currentCompany },
  { header: "Années d'expérience", width: 12, value: (c) => c.yearsExperience },
  { header: "Niveau de séniorité", value: (c) => c.seniority },
  { header: "Étape du recrutement", width: 20, value: (c, x) => x.label("candidates", "status", c.status) },
  { header: "Candidatures (offres)", width: 34, value: (c, x) => (x.appliedTo.get(c.id) ?? []).join(" ; ") },
  { header: "Pays de résidence", value: (c) => c.countryOfResidence },
  { header: "Nationalité", value: (c) => c.nationality },
  { header: "Mobilité internationale", width: 12, value: (c) => c.internationalMobility ?? null },
  { header: "Pôle visé", value: (c) => c.targetDiscipline },
  { header: "Métier visé", value: (c) => c.targetSpecialty },
  { header: "Secteur", value: (c) => c.sector },
  { header: "Prétentions salariales", width: 14, value: (c) => c.salaryExpectation },
  { header: "Disponibilité (jours)", width: 12, value: (c) => c.availabilityDays },
  {
    header: "Langues",
    width: 22,
    value: (c) => (c.languages ?? []).map((l) => [l.code, l.proficiency && `(${l.proficiency})`].filter(Boolean).join(" ")).filter(Boolean).join(", "),
  },
  { header: "Substances", value: (c) => list(c.mining?.commodities) },
  { header: "Types de mine", value: (c) => list(c.mining?.mineType) },
  { header: "Pôles d'expérience", value: (c) => list(c.mining?.disciplines) },
  { header: "Pays d'expérience", value: (c) => list(c.mining?.countriesExperience) },
  { header: "FIFO / roster", width: 10, value: (c) => c.mining?.fifoRoster ?? null },
  { header: "Étiquettes", value: (c) => (c.tags ?? []).map((t) => obj<Tag>(t)?.label).filter(Boolean).join(", ") },
  { header: "Origine", value: (c) => c.source },
  { header: "Consentement RGPD", width: 12, value: (c) => c.consent },
  { header: "Date du consentement", width: 17, value: (c) => date(c.consentAt) },
  { header: "Reçu le", width: 17, value: (c) => date(c.createdAt) },
  { header: "CV", width: 24, value: (c, x) => cvLink(c.cv, x) },
  { header: "Lettre de motivation (fichier)", width: 24, value: (c, x) => cvLink(c.coverLetter, x) },
  { header: "Lettre de motivation (texte)", width: 50, value: (c) => c.coverLetterText },
  { header: "Fiche back-office", width: 18, value: (c, x) => ficheLink("candidates", c.id, x) },
];

const APPLICATION_COLUMNS: Column<Application>[] = [
  { header: "ID candidature", width: 10, value: (a) => a.id },
  { header: "Reçue le", width: 17, value: (a) => date(a.createdAt) },
  { header: "Offre", width: 32, value: (a) => obj<Job>(a.job)?.title ?? "Candidature spontanée" },
  { header: "Suivi de la candidature", width: 16, value: (a, x) => x.label("applications", "status", a.status) },
  { header: "Prénom", value: (a) => obj<Candidate>(a.candidate)?.firstName },
  { header: "Nom", value: (a) => obj<Candidate>(a.candidate)?.lastName },
  { header: "Email", width: 28, value: (a) => obj<Candidate>(a.candidate)?.email },
  { header: "Téléphone", value: (a) => obj<Candidate>(a.candidate)?.phone },
  { header: "Poste actuel", width: 26, value: (a) => obj<Candidate>(a.candidate)?.currentPosition },
  { header: "Années d'expérience", width: 12, value: (a) => obj<Candidate>(a.candidate)?.yearsExperience },
  { header: "Pays de résidence", value: (a) => obj<Candidate>(a.candidate)?.countryOfResidence },
  { header: "Étape du recrutement (candidat)", width: 20, value: (a, x) => x.label("candidates", "status", obj<Candidate>(a.candidate)?.status) },
  { header: "Source", value: (a) => a.source },
  { header: "Campagne — source", value: (a) => a.utm?.source },
  { header: "Campagne — support", value: (a) => a.utm?.medium },
  { header: "Campagne — nom", value: (a) => a.utm?.campaign },
  { header: "CV", width: 24, value: (a, x) => cvLink(a.cv, x) ?? cvLink(obj<Candidate>(a.candidate)?.cv, x) },
  { header: "Lettre de motivation (fichier)", width: 24, value: (a, x) => cvLink(a.coverLetter, x) },
  { header: "Lettre de motivation (texte)", width: 50, value: (a) => a.coverLetterText },
  {
    header: "Fiche candidat",
    width: 18,
    value: (a, x) => {
      const id = idOf(a.candidate);
      return id ? ficheLink("candidates", id, x) : null;
    },
  },
];

const SPECS = {
  candidates: { columns: CANDIDATE_COLUMNS, depth: 1, sheet: "Candidats", file: "candidats" },
  applications: { columns: APPLICATION_COLUMNS, depth: 2, sheet: "Candidatures", file: "candidatures" },
} as const;

// ───────────────────────────── Formats ─────────────────────────────

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Africa/Dakar",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const isLink = (v: Cell): v is Link => !!v && typeof v === "object" && !(v instanceof Date);

/** Valeur texte (CSV) d'une cellule. */
export function cellText(v: Cell): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "boolean") return v ? "Oui" : "Non";
  if (v instanceof Date) return dateFmt.format(v);
  if (isLink(v)) return v.url;
  return String(v);
}

/**
 * Échappement CSV + neutralisation de l'injection de formules (OWASP) : les champs viennent d'un formulaire
 * public ; une valeur commençant par = + - @ (ou tabulation / retour) serait exécutée par le tableur.
 * Exception : un numéro (« +221 77 000 00 00 », « -12,5 ») n'a ni fonction ni commande, il reste intact.
 */
const NUMERIC_LIKE = /^[+-]?[\d\s().,/-]+$/;
export function csvEscape(raw: string, sep = ";"): string {
  let s = raw;
  if (/^[=+\-@\t\r]/.test(s) && !NUMERIC_LIKE.test(s)) s = `'${s}`;
  if (s.includes(sep) || /["\r\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** CSV compatible Excel en français : séparateur « ; », UTF-8 avec BOM (accents), fins de ligne CRLF. */
export function toCsv(headers: string[], rows: Cell[][]): Uint8Array {
  const lines = [headers, ...rows.map((r) => r.map(cellText))].map((r) => r.map((c) => csvEscape(c)).join(";"));
  return new TextEncoder().encode(`﻿${lines.join("\r\n")}\r\n`);
}

/** Classeur Excel : en-tête figé et filtrable, dates et nombres typés, liens cliquables. */
export async function toXlsx(sheetName: string, columns: { header: string; width?: number }[], rows: Cell[][]): Promise<Uint8Array> {
  const { default: ExcelJS } = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  wb.creator = "Maximerit";
  wb.created = new Date();
  const ws = wb.addWorksheet(sheetName, { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = columns.map((c) => ({ header: c.header, width: c.width ?? 18 }));

  for (const r of rows) {
    // Chaînes écrites comme texte (jamais comme formule) : pas d'injection possible dans le classeur.
    const row = ws.addRow(
      r.map((v) => {
        if (v === null || v === undefined) return null;
        if (typeof v === "boolean") return v ? "Oui" : "Non";
        if (isLink(v)) return { text: v.text, hyperlink: v.url };
        return v;
      }),
    );
    r.forEach((v, i) => {
      const cell = row.getCell(i + 1);
      if (v instanceof Date) cell.numFmt = "dd/mm/yyyy hh:mm";
      if (isLink(v)) cell.font = { color: { argb: "FF0563C1" }, underline: true };
    });
  }

  const header = ws.getRow(1);
  header.font = { bold: true };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F1F1" } };
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };

  return new Uint8Array(await wb.xlsx.writeBuffer());
}

// ───────────────────────────── Données ─────────────────────────────

/** Libellés des listes de choix, lus depuis la configuration Payload (source unique, aucune duplication). */
function optionLabels(payload: Payload, collection: ExportCollection): Map<string, Map<string, string>> {
  const out = new Map<string, Map<string, string>>();
  const walk = (fields: Field[], prefix: string) => {
    for (const f of fields) {
      const named = "name" in f && f.name ? `${prefix}${f.name}` : null;
      if (f.type === "select" && named) {
        out.set(named, new Map(f.options.map((o) => (typeof o === "string" ? [o, o] : [o.value, String(o.label)]))));
      } else if (f.type === "tabs") {
        for (const t of f.tabs) walk(t.fields, "name" in t && t.name ? `${prefix}${t.name}.` : prefix);
      } else if ("fields" in f && Array.isArray(f.fields)) {
        walk(f.fields, f.type === "group" && named ? `${named}.` : prefix);
      }
    }
  };
  walk(payload.collections[collection].config.fields, "");
  return out;
}

const BATCH = 500;

async function fetchAll<T>(payload: Payload, req: Pick<PayloadRequest, "user">, collection: ExportCollection, where: Where, sort: Sort, depth: number): Promise<T[]> {
  const docs: T[] = [];
  for (let page = 1; ; page++) {
    const res = await payload.find({ collection, where, sort, depth, page, limit: BATCH, locale: "fr", overrideAccess: false, user: req.user });
    if (page === 1 && res.totalDocs > MAX_EXPORT_ROWS) {
      throw new ExportError(413, `Trop de résultats (${res.totalDocs}). Affinez les filtres : ${MAX_EXPORT_ROWS} lignes maximum par export.`);
    }
    docs.push(...(res.docs as T[]));
    if (!res.hasNextPage) return docs;
  }
}

/** Offres auxquelles chaque candidat a postulé (une seule requête par lot de candidats). */
async function applicationsByCandidate(payload: Payload, req: Pick<PayloadRequest, "user">, ids: number[]): Promise<Map<number, string[]>> {
  const map = new Map<number, string[]>();
  for (let i = 0; i < ids.length; i += BATCH) {
    const apps = await fetchAll<Application>(payload, req, "applications", { candidate: { in: ids.slice(i, i + BATCH) } }, "-createdAt", 1);
    for (const a of apps) {
      const cid = idOf(a.candidate);
      if (!cid) continue;
      const title = obj<Job>(a.job)?.title ?? "Candidature spontanée";
      map.set(cid, [...(map.get(cid) ?? []), title]);
    }
  }
  return map;
}

// ───────────────────────────── Point d'entrée ─────────────────────────────

/** Valide le corps de requête envoyé par le bouton d'export (tout ce qui vient du navigateur est suspect). */
export function parseExportRequest(collection: string, body: unknown): ExportRequest {
  if (!(EXPORTABLE as readonly string[]).includes(collection)) throw new ExportError(404, "Export indisponible pour cette rubrique.");
  const b = obj<Record<string, unknown>>(body) ?? {};
  const format = b.format ?? "xlsx";
  if (!(EXPORT_FORMATS as readonly unknown[]).includes(format)) throw new ExportError(400, "Format inconnu (csv ou xlsx).");
  if (b.where !== undefined && !obj(b.where)) throw new ExportError(400, "Filtres invalides.");
  if (b.search !== undefined && (typeof b.search !== "string" || b.search.length > 200)) throw new ExportError(400, "Recherche invalide.");
  if (b.sort !== undefined && (typeof b.sort !== "string" || !/^-?[A-Za-z0-9_.]{1,64}$/.test(b.sort))) throw new ExportError(400, "Tri invalide.");
  return {
    collection: collection as ExportCollection,
    format: format as ExportFormat,
    where: b.where as Where | undefined,
    search: (b.search as string | undefined)?.trim() || undefined,
    sort: b.sort as string | undefined,
  };
}

/** Construit le fichier d'export pour l'utilisateur connecté (droits vérifiés, accès Payload appliqué). */
export async function buildExport(payload: Payload, req: Pick<PayloadRequest, "user">, input: ExportRequest, baseUrl: string): Promise<ExportFile> {
  if (!req.user) throw new ExportError(401, "Connexion requise.");
  if (!canExport(req.user)) throw new ExportError(403, "Votre rôle ne permet pas d'exporter des données candidats.");

  const spec = SPECS[input.collection];
  const collectionConfig = payload.collections[input.collection].config;
  // Même logique que la liste du back-office : filtres + recherche rapide (champs « listSearchableFields »).
  const where = mergeListSearchAndWhere({ collectionConfig, search: input.search ?? "", where: input.where ?? {} });
  const sort = input.sort ?? collectionConfig.defaultSort ?? "-createdAt";

  let docs: unknown[];
  try {
    docs = await fetchAll(payload, req, input.collection, where, sort, spec.depth);
  } catch (err) {
    if (err instanceof ExportError) throw err;
    // Filtre sur un champ inexistant ou interdit : Payload refuse la requête.
    payload.logger.warn({ err, collection: input.collection }, "Export refusé : filtres invalides");
    throw new ExportError(400, "Filtres invalides pour l'export.");
  }

  const labels = optionLabels(payload, input.collection);
  const candidateLabels = input.collection === "candidates" ? labels : optionLabels(payload, "candidates");
  const ctx: Ctx = {
    label: (collection, field, value) => {
      if (value === null || value === undefined || value === "") return "";
      const m = (collection === input.collection ? labels : candidateLabels).get(field);
      return m?.get(String(value)) ?? String(value);
    },
    abs: (path) => (/^https?:\/\//.test(path) ? path : `${baseUrl.replace(/\/$/, "")}${path}`),
    appliedTo:
      input.collection === "candidates"
        ? await applicationsByCandidate(payload, req, (docs as Candidate[]).map((c) => c.id))
        : new Map(),
  };

  const columns = spec.columns as Column<unknown>[];
  const rows = docs.map((d) => columns.map((c) => c.value(d, ctx)));
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `${spec.file}-${stamp}.${input.format}`;
  const body =
    input.format === "csv"
      ? toCsv(columns.map((c) => c.header), rows)
      : await toXlsx(spec.sheet, columns, rows);

  // Journal d'audit (Art. VI) : qui a exporté quoi, combien, avec quels critères.
  const u = req.user as { id?: number | string; email?: string; role?: string };
  payload.logger.info(
    { event: "data-export", collection: input.collection, format: input.format, count: docs.length, userId: u.id, userEmail: u.email, role: u.role, where, sort },
    `Export ${input.collection} (${input.format}) : ${docs.length} ligne(s) par ${u.email ?? u.id}`,
  );

  return {
    body,
    filename,
    count: docs.length,
    contentType: input.format === "csv" ? "text/csv; charset=utf-8" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}

/** Handler de l'endpoint Payload `POST /api/<collection>/export`. */
export async function handleExport(req: PayloadRequest, collection: ExportCollection): Promise<Response> {
  try {
    const body = req.json ? await req.json().catch(() => ({})) : {};
    const input = parseExportRequest(collection, body);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (req.url ? new URL(req.url).origin : "");
    const file = await buildExport(req.payload, req, input, baseUrl);
    return new Response(file.body as BodyInit, {
      status: 200,
      headers: {
        "content-type": file.contentType,
        "content-disposition": `attachment; filename="${file.filename}"`,
        "cache-control": "no-store",
        "x-export-count": String(file.count),
      },
    });
  } catch (err) {
    const status = err instanceof ExportError ? err.status : 500;
    if (status === 500) req.payload.logger.error({ err }, "Export : erreur inattendue");
    const message = err instanceof ExportError ? err.message : "L'export a échoué. Réessayez ou contactez l'équipe technique.";
    return Response.json({ error: message }, { status, headers: { "cache-control": "no-store" } });
  }
}
