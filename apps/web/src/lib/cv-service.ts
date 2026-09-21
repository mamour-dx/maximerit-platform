import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Payload } from "payload";
import { parseCvBuffer, type ParsedCvProposal } from "./cv-parse";

// Répertoire de stockage des CV (aligné payload.config.ts → cvs.upload.staticDir).
const CV_DIR = path.join(process.cwd(), "cv-uploads");

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
    const buffer = await readFile(path.join(CV_DIR, cvDoc.filename));
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
