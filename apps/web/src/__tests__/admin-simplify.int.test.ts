// @vitest-environment node
// Intégration Phase 14 : back-office simplifié — listes de choix alignées sur le domaine, rubriques réservées,
// adresse web et dates automatiques, rejet des valeurs invalides, premier compte = super administrateur.
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getPayload, type Payload } from "payload";
import config from "@payload-config";
import { mining, SECTORS, COUNTRY_CODES, CONTRACT_TYPES } from "@maximerit/domain";

let payload: Payload;
const created: { collection: "jobs" | "articles"; id: number }[] = [];
const stamp = Date.now();

type SelectLike = { name?: string; type?: string; options?: ({ value: string } | string)[] };
const values = (opts: SelectLike["options"] = []) => opts.map((o) => (typeof o === "string" ? o : o.value)).sort();

/** Retrouve un champ (select) de la collection, y compris dans les rangées / sections repliables. */
function findField(slug: string, name: string): SelectLike | undefined {
  const col = payload.config.collections.find((c) => c.slug === slug);
  const walk = (fields: unknown[]): SelectLike | undefined => {
    for (const f of fields as (SelectLike & { fields?: unknown[] })[]) {
      if (f.name === name) return f;
      if (f.fields) {
        const hit = walk(f.fields);
        if (hit) return hit;
      }
    }
    return undefined;
  };
  return col ? walk(col.fields as unknown[]) : undefined;
}

beforeAll(async () => {
  payload = await getPayload({ config });
});

afterAll(async () => {
  for (const c of created) await payload.delete({ collection: c.collection, id: c.id, overrideAccess: true }).catch(() => undefined);
});

describe("configuration du back-office", () => {
  it("API GraphQL désactivée, interface en français", () => {
    expect(payload.config.graphQL.disable).toBe(true);
    expect(payload.config.i18n.fallbackLanguage).toBe("fr");
  });

  it("listes de choix des offres = vocabulaires du domaine (aucune dérive)", () => {
    expect(values(findField("jobs", "country")?.options)).toEqual([...COUNTRY_CODES].sort());
    expect(values(findField("jobs", "sector")?.options)).toEqual([...SECTORS].sort());
    expect(values(findField("jobs", "contractType")?.options)).toEqual([...CONTRACT_TYPES].sort());
    expect(values(findField("jobs", "discipline")?.options)).toEqual(mining.disciplines.map((d) => d.slug).sort());
  });

  it("rubriques techniques masquées aux non-administrateurs ; CV hors menu mais accessibles", () => {
    const hidden = (slug: string, role: string) => {
      const h = payload.config.collections.find((c) => c.slug === slug)?.admin?.hidden;
      return typeof h === "function" ? h({ user: { role } } as never) : Boolean(h);
    };
    for (const slug of ["redirects", "tags", "talent-pools", "users"]) {
      expect(hidden(slug, "RECRUITER")).toBe(true);
      expect(hidden(slug, "ADMIN")).toBe(false);
    }
    expect(hidden("landing-pages", "RECRUITER")).toBe(true);
    expect(hidden("landing-pages", "MARKETING")).toBe(false);
    for (const slug of ["jobs", "applications", "candidates", "leads", "articles"]) expect(hidden(slug, "RECRUITER")).toBe(false);
    const cvs = payload.config.collections.find((c) => c.slug === "cvs");
    expect(cvs?.admin?.group).toBe(false);
    expect(cvs?.admin?.hidden).toBeUndefined(); // route conservée : on ouvre le CV depuis la fiche candidat
  });
});

describe("offres : automatismes", () => {
  it("adresse web générée depuis le titre, accents retirés, unique (-2)", async () => {
    const title = `Géologue d'exploration — Été ${stamp}`;
    const a = await payload.create({ collection: "jobs", data: { title }, overrideAccess: true });
    const b = await payload.create({ collection: "jobs", data: { title }, overrideAccess: true });
    created.push({ collection: "jobs", id: a.id }, { collection: "jobs", id: b.id });
    expect(a.slug).toBe(`geologue-d-exploration-ete-${stamp}`);
    expect(b.slug).toBe(`geologue-d-exploration-ete-${stamp}-2`);
  });

  it("une adresse saisie à la main est conservée", async () => {
    const j = await payload.create({ collection: "jobs", data: { title: `Titre ${stamp}`, slug: `mon-adresse-${stamp}` }, overrideAccess: true });
    created.push({ collection: "jobs", id: j.id });
    expect(j.slug).toBe(`mon-adresse-${stamp}`);
  });

  it("publication : date de publication = maintenant, fin de visibilité = +60 jours", async () => {
    const before = Date.now();
    const j = await payload.create({ collection: "jobs", data: { title: `Publiée ${stamp}`, status: "publiee" }, overrideAccess: true });
    created.push({ collection: "jobs", id: j.id });
    expect(Math.abs(new Date(j.publishedAt as string).getTime() - before)).toBeLessThan(15_000);
    const days = (new Date(j.expiresAt as string).getTime() - new Date(j.publishedAt as string).getTime()) / 864e5;
    expect(Math.round(days)).toBe(60);
  });

  it("un brouillon ne reçoit ni date de publication ni date de fin", async () => {
    const j = await payload.create({ collection: "jobs", data: { title: `Brouillon ${stamp}` }, overrideAccess: true });
    created.push({ collection: "jobs", id: j.id });
    expect(j.publishedAt ?? null).toBeNull();
    expect(j.expiresAt ?? null).toBeNull();
  });

  it("republier une offre expirée prolonge sa visibilité", async () => {
    const past = new Date(Date.now() - 10 * 864e5).toISOString();
    const j = await payload.create({ collection: "jobs", data: { title: `Expirée ${stamp}`, status: "expiree", expiresAt: past }, overrideAccess: true });
    created.push({ collection: "jobs", id: j.id });
    const again = await payload.update({ collection: "jobs", id: j.id, data: { status: "publiee" }, overrideAccess: true });
    expect(new Date(again.expiresAt as string).getTime()).toBeGreaterThan(Date.now() + 59 * 864e5);
  });

  it("republication depuis le formulaire (date de fin passée renvoyée telle quelle) : prolongée", async () => {
    const past = new Date(Date.now() - 10 * 864e5).toISOString();
    const j = await payload.create({ collection: "jobs", data: { title: `Formulaire ${stamp}`, status: "expiree", expiresAt: past }, overrideAccess: true });
    created.push({ collection: "jobs", id: j.id });
    const again = await payload.update({ collection: "jobs", id: j.id, data: { status: "publiee", expiresAt: j.expiresAt }, overrideAccess: true });
    expect(new Date(again.expiresAt as string).getTime()).toBeGreaterThan(Date.now() + 59 * 864e5);
  });

  it("offre créée « Publiée » avec une date de fin passée : la date est respectée (offre expirée)", async () => {
    const past = new Date(Date.now() - 3 * 864e5).toISOString();
    const j = await payload.create({ collection: "jobs", data: { title: `Passée ${stamp}`, status: "publiee", expiresAt: past }, overrideAccess: true });
    created.push({ collection: "jobs", id: j.id });
    expect(new Date(j.expiresAt as string).toISOString()).toBe(past);
  });

  it("une nouvelle date de fin passée, saisie volontairement à la republication, est respectée", async () => {
    const old = new Date(Date.now() - 20 * 864e5).toISOString();
    const chosen = new Date(Date.now() - 2 * 864e5).toISOString();
    const j = await payload.create({ collection: "jobs", data: { title: `Choix ${stamp}`, status: "expiree", expiresAt: old }, overrideAccess: true });
    created.push({ collection: "jobs", id: j.id });
    const again = await payload.update({ collection: "jobs", id: j.id, data: { status: "publiee", expiresAt: chosen }, overrideAccess: true });
    expect(new Date(again.expiresAt as string).toISOString()).toBe(chosen);
  });

  it("une date de fin choisie par l'équipe est respectée", async () => {
    const chosen = new Date(Date.now() + 15 * 864e5).toISOString();
    const j = await payload.create({ collection: "jobs", data: { title: `Date choisie ${stamp}`, status: "publiee", expiresAt: chosen }, overrideAccess: true });
    created.push({ collection: "jobs", id: j.id });
    expect(new Date(j.expiresAt as string).toISOString()).toBe(chosen);
  });

  it("pays hors liste refusé (plus de saisie libre)", async () => {
    await expect(
      payload.create({ collection: "jobs", data: { title: `Pays ${stamp}`, country: "XX" as never }, overrideAccess: true }),
    ).rejects.toThrow();
  });
});

describe("articles : date de publication automatique", () => {
  it("renseignée au passage en « Publié »", async () => {
    const a = await payload.create({ collection: "articles", data: { title: `Article ${stamp}`, status: "published" }, overrideAccess: true });
    created.push({ collection: "articles", id: a.id });
    expect(a.slug).toBe(`article-${stamp}`);
    expect(a.publishedAt).toBeTruthy();
  });
});

describe("comptes", () => {
  it("le tout premier compte est forcé en super administrateur (jamais « Lecture seule »)", async () => {
    const users = payload.config.collections.find((c) => c.slug === "users");
    const hook = users?.hooks?.beforeValidate?.[0] as unknown as (a: unknown) => Promise<{ role?: string }>;
    const run = (totalDocs: number) =>
      hook({ data: { email: "x@x.test", role: "VIEWER" }, operation: "create", req: { payload: { count: async () => ({ totalDocs }) } } });
    expect((await run(0)).role).toBe("SUPER_ADMIN");
    expect((await run(3)).role).toBe("VIEWER");
  });
});
