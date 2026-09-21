// @vitest-environment node
// Intégration Phase 5b : parsing d'un CV DOCX réel stocké → proposition de fiche + parseStatus.
import { describe, it, expect, beforeAll } from "vitest";
import JSZip from "jszip";
import { getPayload, type Payload } from "payload";
import config from "@payload-config";
import { parseCandidateCv } from "@/lib/cv-service";
import { POST as reparsePOST } from "@/app/reparse-cv/route";

let payload: Payload;

async function makeDocx(lines: string[]): Promise<Buffer> {
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`,
  );
  zip.folder("_rels")!.file(
    ".rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
  );
  const paras = lines
    .map((l) => `<w:p><w:r><w:t xml:space="preserve">${l.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</w:t></w:r></w:p>`)
    .join("");
  zip.folder("word")!.file(
    "document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paras}</w:body></w:document>`,
  );
  return zip.generateAsync({ type: "nodebuffer" });
}

beforeAll(async () => {
  payload = await getPayload({ config });
}, 60000);

describe("ATS — parsing CV (DOCX)", () => {
  it("produit une proposition de fiche et passe parseStatus=parsed", async () => {
    const docx = await makeDocx([
      "Awa Diop",
      "Resource Geologist",
      "Email: awa.parse@example.com",
      "10 ans d'expérience, gold, Sénégal, Guinée",
      "Langues: Français (natif), Anglais (courant)",
    ]);
    const cv = await payload.create({
      collection: "cvs",
      file: { data: docx, mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", name: "cv.docx", size: docx.length },
      data: { candidateName: "Awa Diop" },
    });
    const cand = await payload.create({
      collection: "candidates",
      overrideAccess: true,
      data: { firstName: "Awa", lastName: "Diop", email: `p${Date.now()}@example.com`, consent: true, cv: cv.id, status: "nouveau", parseStatus: "pending" },
    });

    const proposal = await parseCandidateCv(payload, cand.id);
    expect(proposal?.email).toBe("awa.parse@example.com");
    expect(proposal?.commodities).toContain("gold");
    expect(proposal?.languages.map((l) => l.code)).toEqual(expect.arrayContaining(["fr", "en"]));

    const reloaded = await payload.findByID({ collection: "candidates", id: cand.id });
    expect(reloaded.parseStatus).toBe("parsed");
    expect((reloaded.proposedProfile as { email?: string })?.email).toBe("awa.parse@example.com");
  });

  it("l'endpoint /reparse-cv refuse sans authentification (401)", async () => {
    const res = await reparsePOST(new Request("http://localhost/reparse-cv", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ candidateId: 1 }) }));
    expect(res.status).toBe(401);
  });
});
