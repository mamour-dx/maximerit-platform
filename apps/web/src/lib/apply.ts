// Candidature (formulaire public « Postuler » / dépôt de CV) : documents reçus → fiche candidat (+ candidature à une offre).
// Deux modes d'envoi des fichiers, même validation :
//  - production : le navigateur dépose le fichier dans le stockage privé (/apply/upload), puis envoie sa référence ;
//  - développement / tests : le fichier est joint à la requête.
// Le contenu est toujours revérifié ici (taille, type réel d'après les octets), quelle que soit l'origine.
import type { Payload } from "payload";
import type { CandidateProfile } from "@maximerit/domain";
import type { Candidate } from "@/payload-types";
import { ALLOWED_CV_MIME, MAX_COVER_LETTER_CHARS, MAX_CV_BYTES, sanitizeFilename, sniffDocumentMime, validateDocument } from "./upload";
import { blobEnabled, delPrivate, INCOMING_PREFIX, readPrivate } from "./blob-storage";

/** Chemin imposé aux envois directs : incoming/<uuid>.<pdf|docx> (aucun chemin choisi librement par le client). */
const INCOMING_RE = new RegExp(`^${INCOMING_PREFIX}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(pdf|docx)$`);
export const isIncomingPathname = (p: unknown): p is string => typeof p === "string" && INCOMING_RE.test(p);

export type DocKind = "cv" | "letter";
export type ApplyErrorCode =
  | "cv_required"
  | "cv_too_large"
  | "cv_invalid"
  | "letter_too_large"
  | "letter_invalid"
  | "letter_text_too_long"
  | "upload_missing";

export class ApplyError extends Error {
  constructor(public code: ApplyErrorCode) {
    super(code);
  }
}

/** Ce que le formulaire envoie pour un document : un fichier joint, ou la référence d'un envoi direct. */
export type DocInput = { file: File } | { ref: string; name?: string } | null;

interface ResolvedDoc {
  buffer: Buffer;
  mimetype: string;
  name: string;
  incoming?: string;
}

const tooLarge = (kind: DocKind) => new ApplyError(kind === "cv" ? "cv_too_large" : "letter_too_large");
const invalid = (kind: DocKind) => new ApplyError(kind === "cv" ? "cv_invalid" : "letter_invalid");

async function resolveDoc(input: DocInput, kind: DocKind): Promise<ResolvedDoc | null> {
  if (!input) return null;

  if ("file" in input) {
    const f = input.file;
    if (f.size > MAX_CV_BYTES) throw tooLarge(kind);
    const buffer = Buffer.from(await f.arrayBuffer());
    const check = validateDocument({ mimetype: f.type, size: f.size, name: f.name, bytes: buffer });
    if (!check.valid) throw invalid(kind);
    return { buffer, mimetype: f.type, name: f.name };
  }

  // Envoi direct : la référence doit être un chemin « incoming/… » valide, et le stockage actif.
  if (!blobEnabled() || !isIncomingPathname(input.ref)) throw invalid(kind);
  let stored: Awaited<ReturnType<typeof readPrivate>>;
  try {
    stored = await readPrivate(input.ref, MAX_CV_BYTES);
  } catch (err) {
    if (err instanceof Error && err.message === "too_large") throw tooLarge(kind);
    throw err;
  }
  if (!stored) throw new ApplyError("upload_missing");
  const ext = input.ref.split(".").pop() as string;
  const mimetype = sniffDocumentMime(stored.buffer);
  if (!mimetype || ALLOWED_CV_MIME[mimetype] !== ext) throw invalid(kind);
  const base = (input.name ?? "").replace(/\.[^.]*$/, "") || (kind === "cv" ? "cv" : "lettre");
  return { buffer: stored.buffer, mimetype, name: `${base}.${ext}`, incoming: input.ref };
}

export interface ApplicationInput {
  profile: CandidateProfile;
  jobId?: number;
  cv: DocInput;
  coverLetter: DocInput;
  coverLetterText?: string;
}

// Champs du profil recopiés vers la fiche candidat (whitelist stricte).
const PROFILE_KEYS: (keyof CandidateProfile)[] = [
  "firstName", "lastName", "email", "phone", "whatsapp", "countryOfResidence", "nationality",
  "internationalMobility", "currentPosition", "targetSpecialty", "targetDiscipline", "sector",
  "yearsExperience", "seniority", "currentCompany", "salaryExpectation", "availabilityDays",
  "languages", "mining",
];

/** Normalise la lettre saisie : texte brut, espaces superflus retirés, longueur bornée. */
export function normalizeLetterText(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const text = raw.replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!text) return undefined;
  if (text.length > MAX_COVER_LETTER_CHARS) throw new ApplyError("letter_text_too_long");
  return text;
}

/**
 * Crée les documents, la fiche candidat et, le cas échéant, la candidature à l'offre.
 * Les dépôts directs en attente (incoming/…) sont supprimés une fois recopiés, ou en cas de refus.
 */
export async function submitApplication(payload: Payload, input: ApplicationInput) {
  // Dépôts directs à nettoyer dans tous les cas (succès, refus, erreur) : relevés avant toute validation.
  const incoming = [input.cv, input.coverLetter].flatMap((d) => (d && "ref" in d && isIncomingPathname(d.ref) ? [d.ref] : []));
  try {
    const coverLetterText = normalizeLetterText(input.coverLetterText);
    const cvDoc = await resolveDoc(input.cv, "cv");
    if (!cvDoc) throw new ApplyError("cv_required");
    const letterDoc = await resolveDoc(input.coverLetter, "letter");

    const fullName = `${input.profile.firstName ?? ""} ${input.profile.lastName ?? ""}`.trim();
    const store = (doc: ResolvedDoc, label: string) =>
      payload.create({
        collection: "cvs",
        overrideAccess: true,
        file: { data: doc.buffer, mimetype: doc.mimetype, name: sanitizeFilename(doc.name), size: doc.buffer.length },
        data: { candidateName: label ? `${fullName} — ${label}` : fullName },
      });

    const cv = await store(cvDoc, "");
    const letter = letterDoc ? await store(letterDoc, "lettre de motivation") : null;

    const data: Record<string, unknown> = {
      cv: cv.id,
      ...(letter ? { coverLetter: letter.id } : {}),
      ...(coverLetterText ? { coverLetterText } : {}),
      source: "site",
      consent: true,
      consentAt: new Date().toISOString(),
      parseStatus: "pending",
      status: "nouveau",
    };
    for (const k of PROFILE_KEYS) if (input.profile[k] != null) data[k] = input.profile[k];

    // Données assemblées dynamiquement puis validées (validateCandidateProfile) : on informe TS
    // via le type généré (les génériques Payload ne l'infèrent pas depuis un Record).
    const candidate = await payload.create({ collection: "candidates", overrideAccess: true, data: data as unknown as Candidate });

    // Candidature à une offre précise (Phase 6) : crée une Application reliée à l'ATS.
    let applicationId: number | undefined;
    if (input.jobId != null) {
      const application = await payload.create({
        collection: "applications",
        overrideAccess: true,
        data: {
          job: input.jobId,
          candidate: candidate.id,
          cv: cv.id,
          ...(letter ? { coverLetter: letter.id } : {}),
          ...(coverLetterText ? { coverLetterText } : {}),
          status: "recue",
          source: "site",
        },
      });
      applicationId = application.id;
    }

    return { id: candidate.id, cvId: cv.id, coverLetterId: letter?.id, applicationId };
  } finally {
    for (const p of incoming) await delPrivate(p).catch(() => undefined);
  }
}
