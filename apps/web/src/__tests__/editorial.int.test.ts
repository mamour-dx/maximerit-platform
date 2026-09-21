// @vitest-environment node
// Intégration Phase 7b : blog (publié vs brouillon) et ressources (gated).
import { describe, it, expect, beforeAll } from "vitest";
import { getPayload, type Payload, type Where } from "payload";
import config from "@payload-config";

let payload: Payload;

async function ensure(collection: "articles" | "resources", slug: string, data: Record<string, unknown>) {
  const found = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1 });
  return found.docs[0] ?? (await payload.create({ collection, data: { slug, ...data } as never }));
}
async function publishedBySlug(collection: "articles" | "resources", slug: string) {
  const where: Where = { and: [{ slug: { equals: slug } }, { status: { equals: "published" } }] };
  const res = await payload.find({ collection, where, limit: 1 });
  return res.docs[0] ?? null;
}

beforeAll(async () => {
  payload = await getPayload({ config });
  await ensure("articles", "art-pub", { title: "Article publié", status: "published", category: "mining", content: "Corps." });
  await ensure("articles", "art-draft", { title: "Article brouillon", status: "draft", content: "Corps." });
  await ensure("resources", "guide-gated", { type: "guides", title: "Guide protégé", status: "published", gated: true, content: "Secret." });
  await ensure("resources", "etude-open", { type: "etudes", title: "Étude ouverte", status: "published", gated: false, content: "Public." });
}, 60000);

describe("Éditorial — blog & ressources", () => {
  it("article publié visible, brouillon masqué", async () => {
    expect(await publishedBySlug("articles", "art-pub")).toBeTruthy();
    expect(await publishedBySlug("articles", "art-draft")).toBeNull();
  });

  it("ressource gated marquée comme telle (contenu à protéger côté rendu)", async () => {
    const guide = (await publishedBySlug("resources", "guide-gated")) as { gated?: boolean } | null;
    expect(guide?.gated).toBe(true);
    const etude = (await publishedBySlug("resources", "etude-open")) as { gated?: boolean } | null;
    expect(etude?.gated).toBe(false);
  });
});
