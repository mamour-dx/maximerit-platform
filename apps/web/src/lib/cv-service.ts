import { readFile } from "node:fs/promises";
import path from "node:path";
import { createLocalReq, type Payload, type TypeWithID } from "payload";
import { parseCvBuffer, type ParsedCvProposal } from "./cv-parse";
import { blobEnabled, readPrivate, storagePathOf } from "./blob-storage";
import { MAX_CV_BYTES } from "./upload";

// Répertoire de stockage local des CV (aligné payload.config.ts → cvs.upload.staticDir), hors production.
const CV_DIR = path.join(process.cwd(), "cv-uploads");

/** Contenu d'un document candidat, où qu'il soit stocké (stockage privé en production, disque en local). */
async function readCvFile(payload: Payload, doc: TypeWithID & Record<string, unknown> & { filename: string }): Promise<Buffer> {
  if (!blobEnabled()) return readFile(path.join(CV_DIR, path.basename(doc.filename)));
  const req = await createLocalReq({}, payload);
  const pathname = await storagePathOf(payload.collections.cvs.config, doc, doc.filename, req);
  const stored = await readPrivate(pathname, MAX_CV_BYTES);
  if (!stored) throw new Error("cv_missing");
  return stored.buffer;
}

/**
 * Parse le CV d'un candidat et enregistre une PROPOSITION de fiche (proposedProfile),
 * sans écraser les champs saisis. parseStatus : pending → parsed (ou failed).
 * La validation/application reste une action explicite du recruteur.
 */
export async function parseCandidateCv(
  payload: Payload,
  candidateId: number | string,
): Promise<ParsedCvProposal | null> {
  const candidate = await payload.findByID({ collection: "candidates", id: candidateId, depth: 1 });
  const cvRef = candidate.cv;
  const cvDoc = cvRef && typeof cvRef === "object" ? cvRef : null;

  if (!cvDoc?.filename || !cvDoc.mimeType) {
    await payload.update({ collection: "candidates", id: candidateId, data: { parseStatus: "failed" } });
    return null;
  }

  try {
    const buffer = await readCvFile(payload, cvDoc as unknown as TypeWithID & Record<string, unknown> & { filename: string });
    const proposal = await parseCvBuffer(buffer, cvDoc.mimeType);
    await payload.update({
      collection: "candidates",
      id: candidateId,
      data: { proposedProfile: proposal as unknown as Record<string, unknown>, parseStatus: "parsed" },
    });
    return proposal;
  } catch {
    await payload.update({ collection: "candidates", id: candidateId, data: { parseStatus: "failed" } });
    return null;
  }
}
