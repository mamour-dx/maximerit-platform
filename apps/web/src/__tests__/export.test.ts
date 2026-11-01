// @vitest-environment node
// Export candidats (CSV / Excel) — formats, échappement, injection de formules, validation des requêtes, droits.
import { describe, it, expect } from "vitest";
import ExcelJS from "exceljs";
import { canExport } from "@/lib/export-access";
import { cellText, csvEscape, ExportError, parseExportRequest, toCsv, toXlsx } from "@/lib/export";

const decode = (b: Uint8Array) => new TextDecoder().decode(b);

describe("droits d'export (moindre privilège)", () => {
  it("recruteurs et administrateurs uniquement", () => {
    for (const role of ["SUPER_ADMIN", "ADMIN", "RECRUITER"]) expect(canExport({ role })).toBe(true);
    for (const role of ["VIEWER", "MARKETING", "CONTENT_MANAGER", undefined]) expect(canExport({ role })).toBe(false);
    expect(canExport(null)).toBe(false);
  });
});

describe("CSV", () => {
  it("neutralise l'injection de formules (champs saisis sur le site public)", () => {
    for (const evil of ["=HYPERLINK(\"http://x\")", "+cmd|' /C calc'!A0", "-2+3+cmd|' /C calc'!A0", "@SUM(A1)", "\tx", "+A1"]) {
      expect(csvEscape(evil).replace(/^"/, "").startsWith("'")).toBe(true);
    }
    expect(csvEscape("Géologue")).toBe("Géologue");
    // Numéros de téléphone et nombres : inoffensifs, laissés tels quels.
    expect(csvEscape("+221 77 000 00 00")).toBe("+221 77 000 00 00");
    expect(csvEscape("+221770000001")).toBe("+221770000001");
    expect(csvEscape("-12,5")).toBe("-12,5");
  });

  it("échappe séparateurs, guillemets et retours à la ligne", () => {
    expect(csvEscape("a;b")).toBe('"a;b"');
    expect(csvEscape('il a dit "oui"')).toBe('"il a dit ""oui"""');
    expect(csvEscape("ligne 1\nligne 2")).toBe('"ligne 1\nligne 2"');
  });

  it("compatible Excel FR : BOM UTF-8, « ; », CRLF, accents intacts", () => {
    const bytes = toCsv(["Prénom", "Mobilité"], [["Aïssatou", true], ["Ndèye", false]]);
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]); // BOM : Excel détecte l'UTF-8
    expect(decode(bytes)).toBe("Prénom;Mobilité\r\nAïssatou;Oui\r\nNdèye;Non\r\n");
  });

  it("valeurs : dates en heure de Dakar, liens en URL, vide pour null", () => {
    expect(cellText(new Date("2026-10-27T14:05:00Z"))).toBe("27/10/2026 14:05");
    expect(cellText({ text: "CV", url: "https://x.test/cv.pdf" })).toBe("https://x.test/cv.pdf");
    expect(cellText(null)).toBe("");
    expect(cellText(12)).toBe("12");
  });
});

describe("Excel", () => {
  it("classeur relisible : en-tête, types, liens, formules jamais interprétées", async () => {
    const bytes = await toXlsx("Candidats", [{ header: "Nom" }, { header: "Années" }, { header: "Reçu le" }, { header: "CV" }], [
      ["=1+1", 7, new Date("2026-10-27T10:00:00Z"), { text: "cv.pdf", url: "https://x.test/cv.pdf" }],
    ]);
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(Buffer.from(bytes) as never);
    const ws = wb.getWorksheet("Candidats")!;
    expect(ws.getRow(1).values).toEqual([undefined, "Nom", "Années", "Reçu le", "CV"]);
    const row = ws.getRow(2);
    expect(row.getCell(1).value).toBe("=1+1"); // texte, pas une formule
    expect(row.getCell(1).type).toBe(ExcelJS.ValueType.String);
    expect(row.getCell(2).value).toBe(7);
    expect(row.getCell(3).value).toEqual(new Date("2026-10-27T10:00:00Z"));
    expect(row.getCell(4).value).toEqual({ text: "cv.pdf", hyperlink: "https://x.test/cv.pdf" });
    expect(ws.views[0]).toMatchObject({ state: "frozen", ySplit: 1 });
  });
});

describe("validation des requêtes d'export", () => {
  const status = (fn: () => unknown) => {
    try {
      fn();
    } catch (e) {
      return (e as ExportError).status;
    }
    return 0;
  };

  it("accepte une requête de la liste du back-office", () => {
    expect(parseExportRequest("candidates", { format: "csv", where: { status: { equals: "vivier" } }, search: " géo ", sort: "-createdAt" })).toEqual({
      collection: "candidates",
      format: "csv",
      where: { status: { equals: "vivier" } },
      search: "géo",
      sort: "-createdAt",
    });
    expect(parseExportRequest("applications", {}).format).toBe("xlsx");
  });

  it("refuse collections non exportables, formats, filtres et tris invalides", () => {
    expect(status(() => parseExportRequest("users", {}))).toBe(404);
    expect(status(() => parseExportRequest("candidates", { format: "pdf" }))).toBe(400);
    expect(status(() => parseExportRequest("candidates", { where: "1=1" }))).toBe(400);
    expect(status(() => parseExportRequest("candidates", { sort: "createdAt; DROP TABLE" }))).toBe(400);
    expect(status(() => parseExportRequest("candidates", { search: "x".repeat(201) }))).toBe(400);
  });
});
