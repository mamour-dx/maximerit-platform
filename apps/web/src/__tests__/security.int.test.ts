// @vitest-environment node
// Phase 9 — Audit sécurité consolidé : RBAC (horizontal/vertical) + endpoints protégés.
import { describe, it, expect, beforeAll } from "vitest";
import { getPayload, type Payload } from "payload";
import config from "@payload-config";
import { POST as reparsePOST } from "@/app/reparse-cv/route";
import { POST as searchPOST } from "@/app/search-candidates/route";

let payload: Payload;
const SENSITIVE = ["candidates", "cvs", "leads", "applications", "talent-pools"] as const;

const asUser = (role: string) => ({ id: 1, role, collection: "users", email: `${role}@test.local` }) as never;

beforeAll(async () => {
  payload = await getPayload({ config });
}, 60000);

describe("RBAC — lecture publique interdite sur les données sensibles", () => {
  for (const collection of SENSITIVE) {
    it(`anonyme ne peut pas lister « ${collection} »`, async () => {
      await expect(payload.find({ collection, overrideAccess: false, limit: 1 })).rejects.toThrow();
    });
  }
});

describe("RBAC — élévation verticale refusée", () => {
  it("un VIEWER ne peut pas créer d'utilisateur", async () => {
    await expect(
      payload.create({ collection: "users", overrideAccess: false, user: asUser("VIEWER"), data: { email: `x${Date.now()}@t.local`, password: "x_123456", role: "VIEWER" } }),
    ).rejects.toThrow();
  });

  it("un RECRUITER peut lire mais pas supprimer un candidat (delete réservé ADMIN)", async () => {
    const c = await payload.create({ collection: "candidates", overrideAccess: true, data: { firstName: "Sec", lastName: "Test", email: `sec${Date.now()}@t.local`, consent: true } });
    // lecture autorisée
    await expect(payload.findByID({ collection: "candidates", id: c.id, overrideAccess: false, user: asUser("RECRUITER") })).resolves.toBeTruthy();
    // suppression refusée
    await expect(payload.delete({ collection: "candidates", id: c.id, overrideAccess: false, user: asUser("RECRUITER") })).rejects.toThrow();
  });
});

describe("Endpoints sensibles — authentification requise", () => {
  it("/reparse-cv → 401 sans auth", async () => {
    const res = await reparsePOST(new Request("http://localhost/reparse-cv", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ candidateId: 1 }) }));
    expect(res.status).toBe(401);
  });
  it("/search-candidates → 401 sans auth", async () => {
    const res = await searchPOST(new Request("http://localhost/search-candidates", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }));
    expect(res.status).toBe(401);
  });
});
