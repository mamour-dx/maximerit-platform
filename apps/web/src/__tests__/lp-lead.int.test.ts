// @vitest-environment node
// Intégration Phase 4a : parcours acquisition Landing Page → Lead (route /submit-lead + DB).
import { describe, it, expect, beforeAll } from "vitest";
import { getPayload, type Payload } from "payload";
import config from "@payload-config";
import { POST } from "@/app/submit-lead/route";

let payload: Payload;
let lpId: number;

beforeAll(async () => {
  payload = await getPayload({ config });
  const slug = "recrutement-geologue-test";
  const existing = await payload.find({ collection: "landing-pages", where: { slug: { equals: slug } }, limit: 1 });
  lpId = (existing.docs[0]?.id as number) ??
    ((await payload.create({
      collection: "landing-pages",
      data: { title: "Recrutement géologue", slug, status: "published", promise: "Trouvez vos géologues." },
    })).id as number);
}, 60000);

function post(body: unknown): Promise<Response> {
  return POST(
    new Request("http://localhost/submit-lead", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": `10.0.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` },
      body: JSON.stringify(body),
    }),
  );
}

describe("acquisition — LP → Lead", () => {
  it("crée un lead valide (201) avec UTM filtrées et landingPage rattachée", async () => {
    const res = await post({
      contactName: "Awa Diop",
      email: `awa${Date.now()}@example.com`,
      company: "Endeavour Mining",
      profileSought: "Resource Geologist",
      landingPage: lpId,
      source: "lp:test",
      utm: { source: "google", medium: "cpc", evil: "x" },
    });
    expect(res.status).toBe(201);
    const j = (await res.json()) as { id: number };
    const lead = await payload.findByID({ collection: "leads", id: j.id });
    expect((lead.utm as Record<string, unknown>).source).toBe("google");
    expect((lead.utm as Record<string, unknown>).evil).toBeUndefined();
    expect(lead.source).toBe("lp:test");
    expect(lead.landingPage).toBeTruthy();
  });

  it("neutralise le spam via honeypot (202, aucun stockage)", async () => {
    const before = await payload.count({ collection: "leads" });
    const res = await post({ contactName: "Bot", email: "bot@x.com", company_url: "http://spam.example" });
    expect(res.status).toBe(202);
    const after = await payload.count({ collection: "leads" });
    expect(after.totalDocs).toBe(before.totalDocs);
  });

  it("refuse un lead invalide (400)", async () => {
    const res = await post({ email: "pas-un-email" });
    expect(res.status).toBe(400);
  });

  it("RBAC : lecture publique des leads interdite", async () => {
    await expect(payload.find({ collection: "leads", overrideAccess: false, limit: 1 })).rejects.toThrow();
  });
});
