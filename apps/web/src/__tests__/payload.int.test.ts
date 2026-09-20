// @vitest-environment node
// Test d'intégration Phase 3b : connexion PostgreSQL + contrôle d'accès RBAC via Local API Payload.
// Nécessite la base up (docker compose up -d) et migrée. Exclu du run unitaire par défaut
// (voir vitest.config.ts → integration) ; lancé par `pnpm --filter web test:int`.
import { describe, it, expect, beforeAll } from "vitest";
import { getPayload, type Payload } from "payload";
import config from "@payload-config";

let payload: Payload;

beforeAll(async () => {
  payload = await getPayload({ config });
  // Seed idempotent du super-admin (rend le test reproductible, y compris sur une base CI fraîche).
  const email = "admin@maximerit.com";
  const existing = await payload.count({ collection: "users", where: { email: { equals: email } } });
  if (existing.totalDocs === 0) {
    await payload.create({
      collection: "users",
      data: { email, password: "ChangeMe_123!", role: "SUPER_ADMIN", firstName: "Super", lastName: "Admin" },
    });
  }
}, 60000);

describe("Payload — intégration DB + RBAC", () => {
  it("PostgreSQL joignable (au moins le super-admin bootstrap)", async () => {
    const { totalDocs } = await payload.count({ collection: "users" });
    expect(totalDocs).toBeGreaterThanOrEqual(1);
  });

  it("RBAC : un VIEWER ne peut pas créer d'utilisateur", async () => {
    const viewer = { id: 1, role: "VIEWER", collection: "users", email: "viewer@test.local" };
    await expect(
      payload.create({
        collection: "users",
        data: { email: `t${Date.now()}@test.local`, password: "x_123456", role: "VIEWER" },
        overrideAccess: false,
        user: viewer as never,
      }),
    ).rejects.toThrow();
  });

  it("RBAC : lecture publique des pages autorisée (sans utilisateur)", async () => {
    await expect(
      payload.find({ collection: "pages", overrideAccess: false, limit: 1 }),
    ).resolves.toBeTruthy();
  });
});
