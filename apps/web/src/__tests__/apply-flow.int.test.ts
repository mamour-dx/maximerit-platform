// @vitest-environment node
// Intégration — candidature : CV jusqu'à 20 Mo, lettre de motivation (fichier ou texte), captcha (ticket),
// envoi direct au stockage privé (références « incoming/… ») et jeton d'upload restreint.
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { getPayload, type Payload } from "payload";
import config from "@payload-config";
import JSZip from "jszip";

// Stockage privé simulé : seules les fonctions réseau sont remplacées (le reste du module est réel).
vi.mock("@/lib/blob-storage", async (orig) => ({
  ...(await orig<typeof import("@/lib/blob-storage")>()),
  blobEnabled: vi.fn(() => false),
  readPrivate: vi.fn(),
  delPrivate: vi.fn(async () => undefined),
}));
import * as storage from "@/lib/blob-storage";
import { POST as applyPOST } from "@/app/apply/route";
import { POST as sessionPOST } from "@/app/apply/session/route";
import { POST as uploadPOST } from "@/app/apply/upload/route";
import { POST as leadPOST } from "@/app/submit-lead/route";

let payload: Payload;
const MB = 1024 * 1024;
const blob = vi.mocked(storage);

const pdfBytes = (size = 1200) => {
  const head = Buffer.from("%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\n");
  const tail = Buffer.from("\nxref\n0 1\n0000000000 65535 f \ntrailer << /Root 1 0 R /Size 1 >>\nstartxref\n0\n%%EOF\n");
  return Buffer.concat([head, Buffer.alloc(Math.max(0, size - head.length - tail.length), 0x20), tail]);
};
const pdf = (name = "cv.pdf", size?: number) => new File([new Uint8Array(pdfBytes(size))], name, { type: "application/pdf" });
/** DOCX minimal mais réel (Payload inspecte le contenu de l'archive). */
async function docx(name = "lettre.docx"): Promise<File> {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`);
  zip.folder("_rels")!.file(".rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
  zip.folder("word")!.file("document.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Madame, Monsieur,</w:t></w:r></w:p></w:body></w:document>`);
  return new File([new Uint8Array(await zip.generateAsync({ type: "nodebuffer" }))], name, { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
}

let n = 0;
const profile = () => ({ firstName: "Awa", lastName: "Diop", email: `flow${Date.now()}${n++}@example.com`, phone: "+221770000000", consent: true });
const ip = () => `10.9.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;

function apply(fields: Record<string, string | File | undefined>): Promise<Response> {
  const fd = new FormData();
  fd.set("profile", JSON.stringify(fields.profile ? JSON.parse(String(fields.profile)) : profile()));
  for (const [k, v] of Object.entries(fields)) if (k !== "profile" && v !== undefined) fd.set(k, v);
  return applyPOST(new Request("http://localhost/apply/", { method: "POST", headers: { "x-forwarded-for": ip() }, body: fd }));
}
const json = (url: string, body: unknown, route: (r: Request) => Promise<Response>) =>
  route(new Request(url, { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": ip() }, body: JSON.stringify(body) }));

beforeAll(async () => {
  payload = await getPayload({ config });
}, 60000);

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  blob.blobEnabled.mockReturnValue(false);
  blob.readPrivate.mockReset();
  blob.delPrivate.mockClear();
});

describe("taille du CV : 20 Mo", () => {
  it("accepte un CV de 12 Mo (refusé auparavant au-delà de 5 Mo)", async () => {
    const res = await apply({ cv: pdf("gros-cv.pdf", 12 * MB) });
    expect(res.status).toBe(201);
    const { cvId } = (await res.json()) as { cvId: number };
    const cv = await payload.findByID({ collection: "cvs", id: cvId, overrideAccess: true });
    expect(cv.filesize).toBe(12 * MB);
  });

  it("refuse au-delà de 20 Mo (413, code explicite)", async () => {
    const res = await apply({ cv: pdf("trop.pdf", 20 * MB + 1) });
    expect(res.status).toBe(413);
    expect(await res.json()).toMatchObject({ error: "cv_too_large" });
  });

  it("refuse un faux PDF (contenu non conforme)", async () => {
    const fake = new File([Buffer.from("<html>pas un pdf</html>")], "cv.pdf", { type: "application/pdf" });
    const res = await apply({ cv: fake });
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "cv_invalid" });
  });
});

describe("lettre de motivation (facultative)", () => {
  it("sans lettre : candidature acceptée", async () => {
    const res = await apply({ cv: pdf() });
    expect(res.status).toBe(201);
    const { id, coverLetterId } = (await res.json()) as { id: number; coverLetterId?: number };
    expect(coverLetterId).toBeUndefined();
    const c = await payload.findByID({ collection: "candidates", id, overrideAccess: true });
    expect(c.coverLetter ?? null).toBeNull();
    expect(c.coverLetterText ?? null).toBeNull();
  });

  it("fichier + texte, rattachés au candidat ET à la candidature à l'offre", async () => {
    const job = await payload.create({ collection: "jobs", overrideAccess: true, data: { title: `Offre lettre ${Date.now()}`, status: "brouillon" } });
    const res = await apply({ cv: pdf(), coverLetter: await docx(), coverLetterText: "Madame, Monsieur,\r\n\r\n\r\nJe postule.", jobId: String(job.id) });
    expect(res.status).toBe(201);
    const r = (await res.json()) as { id: number; coverLetterId: number; applicationId: number };
    const c = await payload.findByID({ collection: "candidates", id: r.id, overrideAccess: true, depth: 1 });
    expect(c.coverLetterText).toBe("Madame, Monsieur,\n\nJe postule.");
    expect(typeof c.coverLetter === "object" && c.coverLetter?.mimeType).toBe("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    expect(typeof c.coverLetter === "object" && c.coverLetter?.candidateName).toBe("Awa Diop — lettre de motivation");
    const a = await payload.findByID({ collection: "applications", id: r.applicationId, overrideAccess: true, depth: 0 });
    expect([a.coverLetter, a.coverLetterText]).toEqual([r.coverLetterId, "Madame, Monsieur,\n\nJe postule."]);
  });

  it("refuse une lettre invalide ou un texte trop long", async () => {
    const bad = new File([Buffer.from("MZ exe")], "lettre.pdf", { type: "application/pdf" });
    expect(await (await apply({ cv: pdf(), coverLetter: bad })).json()).toMatchObject({ error: "letter_invalid" });
    expect(await (await apply({ cv: pdf(), coverLetterText: "x".repeat(8001) })).json()).toMatchObject({ error: "letter_text_too_long" });
  });
});

describe("captcha (Turnstile configuré)", () => {
  const cloudflare = (success: boolean) =>
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(success ? { success: true } : { success: false, "error-codes": ["invalid-input-response"] }))));

  it("session : jeton refusé → 403 ; accepté → ticket", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "secret-test");
    cloudflare(false);
    expect((await json("http://localhost/apply/session/", { captchaToken: "bad" }, sessionPOST)).status).toBe(403);
    cloudflare(true);
    const res = await json("http://localhost/apply/session/", { captchaToken: "good" }, sessionPOST);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ticket: expect.any(String), directUpload: false, maxBytes: 20 * MB });
  });

  it("candidature sans ticket → 403 ; avec ticket → 201", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "secret-test");
    expect((await apply({ cv: pdf() })).status).toBe(403);
    cloudflare(true);
    const { ticket } = (await (await json("http://localhost/apply/session/", { captchaToken: "good" }, sessionPOST)).json()) as { ticket: string };
    expect((await apply({ cv: pdf(), ticket })).status).toBe(201);
  });
});

describe("envoi direct au stockage privé (production)", () => {
  const ref = "incoming/0f8fad5b-d9cb-469f-a165-70867728950e.pdf";

  it("référence valide : document relu, revérifié, recopié puis supprimé de « incoming/ »", async () => {
    blob.blobEnabled.mockReturnValue(true);
    blob.readPrivate.mockResolvedValue({ buffer: pdfBytes(15 * MB), contentType: "application/pdf" });
    const res = await apply({ cvRef: ref, cvName: "Mon CV final.pdf" });
    expect(res.status).toBe(201);
    const { cvId } = (await res.json()) as { cvId: number };
    const cv = await payload.findByID({ collection: "cvs", id: cvId, overrideAccess: true });
    expect([cv.filesize, cv.mimeType, cv.filename?.startsWith("Mon_CV_final")]).toEqual([15 * MB, "application/pdf", true]);
    expect(blob.readPrivate).toHaveBeenCalledWith(ref, 20 * MB);
    expect(blob.delPrivate).toHaveBeenCalledWith(ref);
  });

  it("contenu non conforme ou chemin arbitraire → refus, dépôt supprimé quand même", async () => {
    blob.blobEnabled.mockReturnValue(true);
    blob.readPrivate.mockResolvedValue({ buffer: Buffer.from("<script>"), contentType: "application/pdf" });
    expect(await (await apply({ cvRef: ref })).json()).toMatchObject({ error: "cv_invalid" });
    expect(blob.delPrivate).toHaveBeenCalledWith(ref);
    expect(await (await apply({ cvRef: "cvs/document-d-un-autre.pdf" })).json()).toMatchObject({ error: "cv_invalid" });
  });

  it("référence refusée si le stockage n'est pas actif", async () => {
    expect(await (await apply({ cvRef: ref })).json()).toMatchObject({ error: "cv_invalid" });
    expect(blob.readPrivate).not.toHaveBeenCalled();
  });
});

describe("jeton d'upload (/apply/upload)", () => {
  const ticketOf = async () => ((await (await json("http://localhost/apply/session/", {}, sessionPOST)).json()) as { ticket: string }).ticket;
  const ask = (pathname: string, clientPayload: string | null) =>
    json("http://localhost/apply/upload/", { type: "blob.generate-client-token", payload: { pathname, clientPayload, multipart: false } }, uploadPOST);
  const decode = (clientToken: string) => JSON.parse(Buffer.from(Buffer.from(clientToken.split("_").pop() as string, "base64").toString().split(".")[1], "base64").toString());

  it("indisponible sans stockage privé (404)", async () => {
    expect((await ask("incoming/0f8fad5b-d9cb-469f-a165-70867728950e.pdf", null)).status).toBe(404);
  });

  it("restreint : ticket exigé, chemin imposé, PDF/DOCX ≤ 20 Mo, sans écrasement, 10 minutes", async () => {
    blob.blobEnabled.mockReturnValue(true);
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "vercel_blob_rw_teststore_secretsecretsecret");
    expect((await ask("incoming/0f8fad5b-d9cb-469f-a165-70867728950e.pdf", JSON.stringify({ ticket: "faux" }))).status).toBe(403);
    const ticket = await ticketOf();
    expect((await ask("cvs/ecraser.pdf", JSON.stringify({ ticket }))).status).toBe(400);

    const res = await ask("incoming/0f8fad5b-d9cb-469f-a165-70867728950e.docx", JSON.stringify({ ticket }));
    expect(res.status).toBe(200);
    const { clientToken } = (await res.json()) as { clientToken: string };
    const claims = decode(clientToken);
    expect(claims).toMatchObject({
      pathname: "incoming/0f8fad5b-d9cb-469f-a165-70867728950e.docx",
      maximumSizeInBytes: 20 * MB,
      allowedContentTypes: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      addRandomSuffix: false,
      allowOverwrite: false,
    });
    expect(claims.validUntil - Date.now()).toBeLessThanOrEqual(10 * 60 * 1000);
    expect(claims.onUploadCompleted).toBeUndefined();
  });
});

describe("captcha — formulaire « Confier un recrutement »", () => {
  const lead = (extra: Record<string, unknown>) =>
    json("http://localhost/submit-lead/", { contactName: "Mme Test", email: `lead${Date.now()}${n++}@example.com`, source: "test", ...extra }, leadPOST);

  it("sans clé : inchangé (201)", async () => {
    expect((await lead({})).status).toBe(201);
  });

  it("avec clé : sans jeton ou jeton refusé → 403 ; jeton valide → 201", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "secret-test");
    vi.stubGlobal("fetch", vi.fn(async (_u: string, init: RequestInit) => new Response(JSON.stringify({ success: new URLSearchParams(String(init.body)).get("response") === "good" }))));
    expect((await lead({})).status).toBe(403);
    expect((await lead({ captchaToken: "bad" })).status).toBe(403);
    expect((await lead({ captchaToken: "good" })).status).toBe(201);
  });
});
