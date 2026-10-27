// @vitest-environment node
// Stockage privé des documents candidats (Vercel Blob « Private ») : écriture/lecture privées, en-têtes de
// réponse sans cache, lecture bornée — et configuration Payload en mode production (disque local désactivé).
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@vercel/blob", () => ({ put: vi.fn(async () => ({})), get: vi.fn(), del: vi.fn(async () => undefined), list: vi.fn() }));
vi.mock("@payloadcms/plugin-cloud-storage/utilities", () => ({ getStorageFilePath: vi.fn(async ({ filename }: { filename: string }) => `cvs/${filename}`) }));
import * as sdk from "@vercel/blob";
import { delPrivate, getPrivate, putPrivate, readPrivate, serveStored, sweepAbandonedUploads } from "@/lib/blob-storage";

const stream = (data: Uint8Array) => new ReadableStream<Uint8Array>({ start: (c) => (c.enqueue(data), c.close()) });
const found = (data: Uint8Array, contentType = "application/pdf") => ({ statusCode: 200, stream: stream(data), blob: { contentType, size: data.byteLength } });
const req = { payload: { logger: { error: vi.fn() } } } as never;

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllEnvs());

describe("Vercel Blob privé", () => {
  it("écrit toujours en accès privé, sans suffixe aléatoire (chemin géré par Payload)", async () => {
    await putPrivate("cvs/cv.pdf", Buffer.from("x"), "application/pdf");
    expect(sdk.put).toHaveBeenCalledWith("cvs/cv.pdf", expect.any(Buffer), { access: "private", contentType: "application/pdf", addRandomSuffix: false, allowOverwrite: true });
  });

  it("lit en accès privé, sans cache CDN ; absent → null", async () => {
    vi.mocked(sdk.get).mockResolvedValueOnce(null);
    expect(await getPrivate("cvs/absent.pdf")).toBeNull();
    expect(sdk.get).toHaveBeenCalledWith("cvs/absent.pdf", { access: "private", useCache: false });
  });

  it("lecture bornée : un fichier plus gros que la limite est refusé, pas tronqué", async () => {
    vi.mocked(sdk.get).mockResolvedValueOnce(found(new Uint8Array(11)) as never);
    await expect(readPrivate("incoming/x.pdf", 10)).rejects.toThrow("too_large");
    vi.mocked(sdk.get).mockResolvedValueOnce(found(new Uint8Array([1, 2, 3])) as never);
    expect((await readPrivate("incoming/x.pdf", 10))?.buffer).toEqual(Buffer.from([1, 2, 3]));
  });

  it("téléchargement depuis le back-office : flux privé, jamais mis en cache", async () => {
    vi.mocked(sdk.get).mockResolvedValueOnce(found(new Uint8Array([37, 80, 68, 70])) as never);
    const res = await serveStored(req, { collection: { slug: "cvs" } as never, doc: { id: 1 }, filename: "cv.pdf" });
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("content-type")).toBe("application/pdf");
    expect(sdk.get).toHaveBeenCalledWith("cvs/cv.pdf", expect.objectContaining({ access: "private" }));

    vi.mocked(sdk.get).mockResolvedValueOnce(null);
    expect((await serveStored(req, { collection: { slug: "cvs" } as never, filename: "absent.pdf" })).status).toBe(404);
  });

  it("suppression", async () => {
    await delPrivate("incoming/x.pdf");
    expect(sdk.del).toHaveBeenCalledWith("incoming/x.pdf");
  });
});

describe("dépôts abandonnés (incoming/)", () => {
  const blobAt = (name: string, minutesAgo: number, now: number) => ({ url: `https://s.private.blob.vercel-storage.com/incoming/${name}`, pathname: `incoming/${name}`, size: 1, uploadedAt: new Date(now - minutesAgo * 60_000) });

  it("supprime les dépôts de plus d'une heure, garde les récents, parcourt toutes les pages", async () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "vercel_blob_rw_teststore_secret");
    const now = Date.now();
    vi.mocked(sdk.list)
      .mockResolvedValueOnce({ blobs: [blobAt("vieux.pdf", 90, now), blobAt("recent.pdf", 10, now)], hasMore: true, cursor: "c2" } as never)
      .mockResolvedValueOnce({ blobs: [blobAt("vieux2.docx", 600, now)], hasMore: false } as never);
    expect(await sweepAbandonedUploads(now, true)).toBe(2);
    expect(sdk.list).toHaveBeenNthCalledWith(1, { prefix: "incoming/", cursor: undefined, limit: 1000 });
    expect(sdk.list).toHaveBeenNthCalledWith(2, { prefix: "incoming/", cursor: "c2", limit: 1000 });
    expect(vi.mocked(sdk.del).mock.calls.flat(2)).toEqual([expect.stringContaining("vieux.pdf"), expect.stringContaining("vieux2.docx")]);
  });

  it("au plus une fois par demi-heure ; inactif sans stockage privé", async () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "vercel_blob_rw_teststore_secret");
    vi.mocked(sdk.list).mockResolvedValue({ blobs: [], hasMore: false } as never);
    const t = Date.now() + 10 * 3_600_000;
    await sweepAbandonedUploads(t);
    expect(await sweepAbandonedUploads(t + 60_000)).toBe(0);
    expect(sdk.list).toHaveBeenCalledTimes(1);
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
    expect(await sweepAbandonedUploads(t + 3_600_000, true)).toBe(0);
    expect(sdk.list).toHaveBeenCalledTimes(1);
  });
});

describe("configuration Payload en production (BLOB_READ_WRITE_TOKEN défini)", () => {
  it("documents candidats sur le stockage privé : disque local désactivé, accès contrôlé par Payload", async () => {
    vi.resetModules();
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "vercel_blob_rw_teststore_secret");
    const { default: cfg } = await import("@payload-config");
    const cvs = (await cfg).collections.find((c) => c.slug === "cvs")!;
    const upload = cvs.upload as { disableLocalStorage?: boolean; handlers?: unknown[] };
    expect(upload.disableLocalStorage).toBe(true);
    expect(upload.handlers?.length).toBe(1); // lecture servie par l'application (après contrôle d'accès)
    expect(cvs.access?.read).toBeTypeOf("function");
    const names = cvs.fields.map((f) => ("name" in f ? f.name : null));
    expect(names).toEqual(expect.arrayContaining(["prefix", "_objectKey", "url"]));
  });

  it("en local (sans jeton) : même schéma, disque local conservé", async () => {
    vi.resetModules();
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
    const { default: cfg } = await import("@payload-config");
    const cvs = (await cfg).collections.find((c) => c.slug === "cvs")!;
    expect((cvs.upload as { disableLocalStorage?: boolean }).disableLocalStorage).toBeFalsy();
    expect(cvs.fields.map((f) => ("name" in f ? f.name : null))).toEqual(expect.arrayContaining(["prefix", "_objectKey"]));
  });
});
