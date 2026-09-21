// @vitest-environment node
// Intégration Phase 5a : intake candidature /apply (profil + CV), sécurité upload, RBAC.
import { describe, it, expect, beforeAll } from "vitest";
import { getPayload, type Payload } from "payload";
import config from "@payload-config";
import { POST } from "@/app/apply/route";

let payload: Payload;

const validProfile = () => ({
  firstName: "Awa",
  lastName: "Diop",
  email: `awa${Date.now()}${Math.floor(Math.random() * 1000)}@example.com`,
  phone: "+221770000000",
  consent: true,
  countryOfResidence: "SN",
  sector: "mines-ressources-naturelles",
  targetDiscipline: "geologie-exploration",
  yearsExperience: 9,
  languages: [{ code: "fr", proficiency: "natif" }],
  mining: { commodities: ["gold"], countriesExperience: ["SN"] },
});

function apply(profile: unknown, file?: File, honeypot?: string): Promise<Response> {
  const fd = new FormData();
  fd.set("profile", JSON.stringify(profile));
  if (file) fd.set("cv", file);
  if (honeypot) fd.set("company_url", honeypot);
  return POST(
    new Request("http://localhost/apply", {
      method: "POST",
      headers: { "x-forwarded-for": `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.1` },
      body: fd,
    }),
  );
}

// PDF minimal valide (structure complète : catalog + pages + page).
const MINIMAL_PDF = `%PDF-1.1
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>
endobj
xref
0 4
0000000000 65535 f
0000000010 00000 n
0000000059 00000 n
0000000118 00000 n
trailer
<< /Root 1 0 R /Size 4 >>
startxref
190
%%EOF`;
const pdf = () => new File([Buffer.from(MINIMAL_PDF, "utf8")], "cv.pdf", { type: "application/pdf" });

beforeAll(async () => {
  payload = await getPayload({ config });
}, 60000);

describe("ATS — intake /apply", () => {
  it("crée un candidat + CV (201) avec parseStatus=pending", async () => {
    const res = await apply(validProfile(), pdf());
    expect(res.status).toBe(201);
    const j = (await res.json()) as { id: number; cvId: number };
    const cand = await payload.findByID({ collection: "candidates", id: j.id });
    expect(cand.parseStatus).toBe("pending");
    expect(cand.cv).toBeTruthy();
    expect(cand.consent).toBe(true);
  });

  it("refuse sans consentement (400)", async () => {
    const res = await apply({ ...validProfile(), consent: false }, pdf());
    expect(res.status).toBe(400);
  });

  it("refuse un type de fichier non autorisé (400)", async () => {
    const txt = new File([Buffer.from("hello")], "cv.txt", { type: "text/plain" });
    const res = await apply(validProfile(), txt);
    expect(res.status).toBe(400);
  });

  it("refuse un fichier trop volumineux (400)", async () => {
    const big = new File([new Uint8Array(6 * 1024 * 1024)], "cv.pdf", { type: "application/pdf" });
    const res = await apply(validProfile(), big);
    expect(res.status).toBe(400);
  });

  it("exige un CV (400 si absent)", async () => {
    const res = await apply(validProfile());
    expect(res.status).toBe(400);
  });

  it("neutralise le spam via honeypot (202)", async () => {
    const res = await apply(validProfile(), pdf(), "http://spam.example");
    expect(res.status).toBe(202);
  });

  it("RBAC : candidats et CV non lisibles publiquement", async () => {
    await expect(payload.find({ collection: "candidates", overrideAccess: false, limit: 1 })).rejects.toThrow();
    await expect(payload.find({ collection: "cvs", overrideAccess: false, limit: 1 })).rejects.toThrow();
  });
});
