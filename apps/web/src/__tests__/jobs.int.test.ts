// @vitest-environment node
// Intégration Phase 6 : offres (live/expirée/brouillon), candidature reliée à l'ATS, sitemap.
import { describe, it, expect, beforeAll } from "vitest";
import { getPayload, type Payload } from "payload";
import config from "@payload-config";
import { POST as applyPOST } from "@/app/apply/route";
import { isLive, type JobLike } from "@/lib/job";

let payload: Payload;
let liveId: number;

const MINIMAL_PDF = `%PDF-1.1
1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj
2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj
3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>endobj
xref
0 4
0000000000 65535 f
0000000010 00000 n
0000000059 00000 n
0000000118 00000 n
trailer<< /Root 1 0 R /Size 4 >>
startxref
190
%%EOF`;
const pdf = () => new File([Buffer.from(MINIMAL_PDF)], "cv.pdf", { type: "application/pdf" });
const future = new Date(Date.now() + 30 * 864e5).toISOString();
const past = new Date(Date.now() - 864e5).toISOString();

type JobStatus = "brouillon" | "publiee" | "expiree" | "pourvue" | "archivee";
async function ensureJob(slug: string, status: JobStatus, expiresAt?: string) {
  const found = await payload.find({ collection: "jobs", where: { slug: { equals: slug } }, limit: 1 });
  if (found.docs[0]) return found.docs[0];
  return payload.create({ collection: "jobs", data: { title: `Job ${slug}`, slug, status, publishedAt: new Date().toISOString(), expiresAt } });
}

beforeAll(async () => {
  payload = await getPayload({ config });
  const live = await ensureJob("live-geologist", "publiee", future);
  await ensureJob("expired-geologist", "publiee", past);
  await ensureJob("draft-geologist", "brouillon", future);
  liveId = live.id as number;
}, 60000);

describe("Offres & candidatures", () => {
  it("candidature à une offre → 201 + Application reliée à l'ATS", async () => {
    const fd = new FormData();
    fd.set("profile", JSON.stringify({ firstName: "Awa", lastName: "Diop", email: `job${Date.now()}@example.com`, phone: "+221770000000", consent: true }));
    fd.set("cv", pdf());
    fd.set("jobId", String(liveId));
    const res = await applyPOST(new Request("http://localhost/apply", { method: "POST", headers: { "x-forwarded-for": `12.${Math.floor(Math.random() * 250)}.0.1` }, body: fd }));
    expect(res.status).toBe(201);
    const j = (await res.json()) as { id: number; applicationId: number };
    expect(j.applicationId).toBeTruthy();
    const app = await payload.findByID({ collection: "applications", id: j.applicationId });
    expect(typeof app.job === "object" ? app.job?.id : app.job).toBe(liveId);
    expect(app.status).toBe("recue");
  });

  it("le sitemap Jobs ne contient que les offres actives", async () => {
    const res = await payload.find({ collection: "jobs", where: { status: { equals: "publiee" } }, limit: 100 });
    const liveSlugs = (res.docs as JobLike[]).filter((j) => isLive(j)).map((j) => j.slug);
    expect(liveSlugs).toContain("live-geologist");
    expect(liveSlugs).not.toContain("expired-geologist"); // publiée mais expirée
    expect(liveSlugs).not.toContain("draft-geologist"); // brouillon (hors requête)
  });

  it("RBAC : candidatures non lisibles publiquement", async () => {
    await expect(payload.find({ collection: "applications", overrideAccess: false, limit: 1 })).rejects.toThrow();
  });
});
