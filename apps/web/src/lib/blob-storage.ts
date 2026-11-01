// Stockage privé des documents candidats (CV, lettres) sur Vercel Blob — Art. VI : aucune URL publique.
// Actif dès que BLOB_READ_WRITE_TOKEN est défini (store « Private » connecté au projet Vercel) ; sinon les
// fichiers restent sur le disque local (développement, tests) via le `staticDir` de la collection `cvs`.
// Toutes les lectures passent par l'application (contrôle d'accès Payload), jamais par le navigateur.
import { del, get, list, put } from "@vercel/blob";
import type { CollectionConfig, PayloadRequest, TypeWithID } from "payload";
import { getStorageFilePath } from "@payloadcms/plugin-cloud-storage/utilities";

export const blobEnabled = (): boolean => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/** Préfixe des documents définitifs (gérés par Payload) et des envois directs du navigateur en attente. */
export const CVS_PREFIX = "cvs";
export const INCOMING_PREFIX = "incoming";

export interface StoredFile {
  stream: ReadableStream<Uint8Array>;
  contentType: string;
  size: number;
}

/** Point d'entrée de test : un émulateur local peut remplacer l'origine des lectures privées. */
const emulatorBase = () => process.env.STORAGE_VERCEL_BLOB_BASE_URL?.replace(/\/$/, "");

export async function putPrivate(pathname: string, body: Buffer | Uint8Array, contentType: string): Promise<void> {
  await put(pathname, Buffer.from(body), { access: "private", contentType, addRandomSuffix: false, allowOverwrite: true });
}

export async function getPrivate(pathname: string): Promise<StoredFile | null> {
  const base = emulatorBase();
  if (base) {
    const res = await fetch(`${base}/${pathname.split("/").map(encodeURIComponent).join("/")}`, {
      headers: { authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
    });
    if (res.status === 404) return null;
    if (!res.ok || !res.body) throw new Error(`Blob émulateur : ${res.status}`);
    return { stream: res.body, contentType: res.headers.get("content-type") ?? "application/octet-stream", size: Number(res.headers.get("content-length") ?? 0) };
  }
  const result = await get(pathname, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) return null;
  return { stream: result.stream, contentType: result.blob.contentType, size: result.blob.size };
}

export async function delPrivate(pathname: string): Promise<void> {
  await del(pathname);
}

// ───────────────────────────── Dépôts abandonnés ─────────────────────────────
// Un candidat peut déposer son CV (incoming/…) puis quitter la page sans envoyer le formulaire : ces fichiers
// (données personnelles) ne doivent pas rester. Balayage opportuniste, déclenché après les ouvertures de
// candidature (/apply/session), au plus une fois par demi-heure et par instance — aucune tâche planifiée à gérer.

export const ABANDONED_AFTER_MS = 60 * 60 * 1000;
const SWEEP_EVERY_MS = 30 * 60 * 1000;
let lastSweep = 0;

/** Supprime les dépôts « incoming/ » de plus d'une heure. Renvoie le nombre de fichiers supprimés. */
export async function sweepAbandonedUploads(now = Date.now(), force = false): Promise<number> {
  if (!blobEnabled() || (!force && now - lastSweep < SWEEP_EVERY_MS)) return 0;
  lastSweep = now;
  let removed = 0;
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: `${INCOMING_PREFIX}/`, cursor, limit: 1000 });
    const stale = page.blobs.filter((b) => now - new Date(b.uploadedAt).getTime() > ABANDONED_AFTER_MS).map((b) => b.url);
    if (stale.length) {
      await del(stale);
      removed += stale.length;
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return removed;
}

/** Lit un document privé en mémoire, avec plafond (un fichier plus gros que prévu est refusé, pas tronqué). */
export async function readPrivate(pathname: string, maxBytes: number): Promise<{ buffer: Buffer; contentType: string } | null> {
  const file = await getPrivate(pathname);
  if (!file) return null;
  if (file.size > maxBytes) {
    await file.stream.cancel().catch(() => undefined);
    throw new Error("too_large");
  }
  const chunks: Uint8Array[] = [];
  let total = 0;
  const reader = file.stream.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => undefined);
      throw new Error("too_large");
    }
    chunks.push(value);
  }
  return { buffer: Buffer.concat(chunks), contentType: file.contentType };
}

/** Chemin de stockage d'un document Payload (préfixe + clé d'objet propres au document). */
export async function storagePathOf(collection: CollectionConfig, doc: TypeWithID & Record<string, unknown>, filename: string, req: PayloadRequest): Promise<string> {
  return getStorageFilePath({ collection, collectionPrefix: CVS_PREFIX, doc, filename, req });
}

/**
 * Sert un document privé à un utilisateur du back-office. Payload a déjà vérifié le droit de lecture
 * (collection `cvs` : interne uniquement) avant d'appeler ce handler.
 */
export async function serveStored(
  req: PayloadRequest,
  args: { collection: CollectionConfig; doc?: TypeWithID; filename: string },
): Promise<Response> {
  try {
    const pathname = await getStorageFilePath({ collection: args.collection, collectionPrefix: CVS_PREFIX, doc: args.doc, filename: args.filename, req });
    const file = await getPrivate(pathname);
    if (!file) return new Response(null, { status: 404, statusText: "Not Found" });
    return new Response(file.stream, {
      headers: {
        "Content-Type": file.contentType,
        ...(file.size ? { "Content-Length": String(file.size) } : {}),
        "Content-Disposition": `inline; filename="${args.filename.replace(/"/g, "")}"`,
        // Données personnelles : jamais en cache partagé ni sur disque.
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    req.payload.logger.error({ err }, "Stockage privé : lecture impossible");
    return new Response("Internal Server Error", { status: 500 });
  }
}
