// @vitest-environment node
// Intégration Phase 4b : rendu des Pages CMS (publiée visible, brouillon masqué sauf preview).
import { describe, it, expect, beforeAll } from "vitest";
import { getPayload, type Payload, type Where } from "payload";
import config from "@payload-config";

let payload: Payload;

async function ensurePage(slug: string, status: "draft" | "published") {
  const found = await payload.find({ collection: "pages", where: { slug: { equals: slug } }, limit: 1 });
  if (found.docs[0]) return found.docs[0];
  return payload.create({ collection: "pages", data: { title: `Page ${slug}`, slug, status, content: "Contenu de test.\n\nDeuxième paragraphe." } });
}

// Réplique la logique de requête de src/app/[...slug]/page.tsx
async function getPage(slug: string, preview: boolean) {
  const conditions: Where[] = [{ slug: { equals: slug } }];
  if (!preview) conditions.push({ status: { equals: "published" } });
  const res = await payload.find({ collection: "pages", where: { and: conditions }, limit: 1 });
  return res.docs[0] ?? null;
}

beforeAll(async () => {
  payload = await getPayload({ config });
  await ensurePage("test-published", "published");
  await ensurePage("test-draft", "draft");
}, 60000);

describe("Pages CMS — publication & preview", () => {
  it("une page publiée est servie", async () => {
    const p = await getPage("test-published", false);
    expect(p).toBeTruthy();
    expect(p?.status).toBe("published");
  });

  it("un brouillon est masqué sans preview (→ 404)", async () => {
    expect(await getPage("test-draft", false)).toBeNull();
  });

  it("un brouillon est visible en mode preview", async () => {
    const p = await getPage("test-draft", true);
    expect(p).toBeTruthy();
    expect(p?.status).toBe("draft");
  });
});
