// @vitest-environment node
// Intégration — export CSV / Excel des candidats et candidatures depuis le back-office.
// Vérifie : droits par rôle, export filtré / sélection / recherche, candidatures par offre, libellés lisibles,
// relecture du classeur Excel, endpoint déclaré sur les deux collections.
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getPayload, type Payload } from "payload";
import ExcelJS from "exceljs";
import config from "@payload-config";
import { buildExport, ExportError, type ExportRequest } from "@/lib/export";

let payload: Payload;
const stamp = `${Date.now()}`;
const tag = `exp${stamp}`; // isole les données de ce test (recherche sur le poste actuel)
const created: { collection: "candidates" | "applications" | "jobs"; id: number }[] = [];
const ids: number[] = [];
let jobId: number;

const asUser = (role: string) => ({ user: { id: 1, role, collection: "users", email: `${role.toLowerCase()}@test.local` } as never });
const run = (role: string, input: Omit<ExportRequest, "format"> & { format?: ExportRequest["format"] }) =>
  buildExport(payload, asUser(role), { format: "csv", ...input }, "https://maximerit.test");
const csvRows = (body: Uint8Array) =>
  new TextDecoder()
    .decode(body)
    .replace(/^﻿/, "")
    .trim()
    .split("\r\n")
    .map((l) => l.split(";"));

beforeAll(async () => {
  payload = await getPayload({ config });
  const job = await payload.create({ collection: "jobs", overrideAccess: true, data: { title: `Géologue ${tag}`, status: "brouillon" } });
  jobId = job.id;
  created.push({ collection: "jobs", id: job.id });

  const people = [
    { firstName: "Awa", lastName: "Diop", status: "vivier" as const, yearsExperience: 9, internationalMobility: true },
    { firstName: "Moussa", lastName: "Ba", status: "shortlist-client" as const, yearsExperience: 4, internationalMobility: false },
    { firstName: "=HYPERLINK(\"http://evil\")", lastName: "Sow", status: "vivier" as const, yearsExperience: 2 },
  ];
  for (const p of people) {
    const c = await payload.create({
      collection: "candidates",
      overrideAccess: true,
      data: { ...p, email: `${p.lastName.toLowerCase()}.${stamp}@example.com`, currentPosition: `Poste ${tag}`, consent: true },
    });
    ids.push(c.id);
    created.push({ collection: "candidates", id: c.id });
  }
  // Awa a postulé à l'offre ; Moussa a une candidature spontanée.
  for (const [candidate, job] of [[ids[0], jobId], [ids[1], undefined]] as const) {
    const a = await payload.create({ collection: "applications", overrideAccess: true, data: { candidate, job, status: "en-revue" } });
    created.push({ collection: "applications", id: a.id });
  }
}, 120000);

afterAll(async () => {
  for (const c of [...created].reverse()) await payload.delete({ collection: c.collection, id: c.id, overrideAccess: true }).catch(() => undefined);
});

describe("droits", () => {
  it("anonyme → 401 ; lecture seule / marketing / contenu → 403", async () => {
    await expect(buildExport(payload, { user: null }, { collection: "candidates", format: "csv" }, "")).rejects.toMatchObject({ status: 401 });
    for (const role of ["VIEWER", "MARKETING", "CONTENT_MANAGER"]) {
      await expect(run(role, { collection: "candidates", search: tag })).rejects.toBeInstanceOf(ExportError);
      await expect(run(role, { collection: "candidates", search: tag })).rejects.toMatchObject({ status: 403 });
    }
  });

  it("recruteur et administrateur → autorisés", async () => {
    for (const role of ["RECRUITER", "ADMIN"]) expect((await run(role, { collection: "candidates", search: tag })).count).toBe(3);
  });
});

describe("export des candidats", () => {
  it("filtres de la liste + recherche rapide + tri", async () => {
    const file = await run("RECRUITER", { collection: "candidates", search: tag, where: { status: { equals: "vivier" } }, sort: "yearsExperience" });
    expect(file.count).toBe(2);
    expect(file.filename).toMatch(/^candidats-\d{4}-\d{2}-\d{2}\.csv$/);
    const [header, first, second] = csvRows(file.body);
    const col = (name: string) => header.indexOf(name);
    expect(second[col("Prénom")]).toBe("Awa"); // tri croissant sur l'expérience : 2 ans puis 9 ans
    expect(second[col("Étape du recrutement")]).toBe("Dans le vivier"); // libellé, pas la valeur technique
    expect(second[col("Mobilité internationale")]).toBe("Oui");
    expect(second[col("Candidatures (offres)")]).toBe(`Géologue ${tag}`);
    expect(second[col("Fiche back-office")]).toBe(`https://maximerit.test/admin/collections/candidates/${ids[0]}`);
    // Injection de formule neutralisée (le prénom vient du formulaire public).
    expect(first[col("Prénom")].replace(/^"/, "").startsWith("'=")).toBe(true);
    // Notes internes et données techniques jamais exportées.
    expect(header).not.toContain("Notes de l'équipe");
    expect(header.join(" ")).not.toMatch(/proposedProfile|Proposition issue du CV/);
  });

  it("sélection de lignes (ids cochés)", async () => {
    const file = await run("RECRUITER", { collection: "candidates", where: { id: { in: [ids[1]] } } });
    expect(file.count).toBe(1);
    expect(csvRows(file.body)[1]).toContain("Shortlist client");
  });

  it("filtre sur un champ inexistant → 400 (pas d'erreur serveur)", async () => {
    await expect(run("RECRUITER", { collection: "candidates", where: { nope: { equals: 1 } } })).rejects.toMatchObject({ status: 400 });
  });

  it("Excel : feuille « Candidats », nombres typés, liens cliquables", async () => {
    const file = await run("ADMIN", { collection: "candidates", search: tag, format: "xlsx", sort: "-yearsExperience" });
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(Buffer.from(file.body) as never);
    const ws = wb.getWorksheet("Candidats")!;
    expect(ws.rowCount).toBe(4);
    const headers = (ws.getRow(1).values as unknown[]).slice(1);
    const cell = (name: string) => ws.getRow(2).getCell(headers.indexOf(name) + 1).value;
    expect(cell("Prénom")).toBe("Awa");
    expect(cell("Années d'expérience")).toBe(9);
    expect(cell("Fiche back-office")).toMatchObject({ hyperlink: `https://maximerit.test/admin/collections/candidates/${ids[0]}` });
  });
});

describe("export des candidatures", () => {
  it("filtré par offre : candidats ayant postulé, avec leurs coordonnées", async () => {
    const file = await run("RECRUITER", { collection: "applications", where: { job: { equals: jobId } } });
    expect(file.count).toBe(1);
    expect(file.filename).toMatch(/^candidatures-/);
    const [header, row] = csvRows(file.body);
    expect(row[header.indexOf("Offre")]).toBe(`Géologue ${tag}`);
    expect(row[header.indexOf("Email")]).toBe(`diop.${stamp}@example.com`);
    expect(row[header.indexOf("Suivi de la candidature")]).toBe("En revue");
    expect(row[header.indexOf("Étape du recrutement (candidat)")]).toBe("Dans le vivier");
  });

  it("candidature spontanée signalée comme telle", async () => {
    const file = await run("RECRUITER", { collection: "applications", where: { candidate: { equals: ids[1] } } });
    const [header, row] = csvRows(file.body);
    expect(row[header.indexOf("Offre")]).toBe("Candidature spontanée");
  });
});

describe("configuration", () => {
  it("endpoint POST /export et barre d'export sur Candidats et Candidatures uniquement", () => {
    for (const c of payload.config.collections) {
      const has = (c.endpoints || []).some((e) => e.path === "/export" && e.method === "post");
      const bar = (c.admin?.components?.beforeListTable ?? []).some((x) => String(x).includes("ExportBar"));
      const expected = ["candidates", "applications"].includes(c.slug);
      expect([c.slug, has, bar]).toEqual([c.slug, expected, expected]);
    }
  });
});
