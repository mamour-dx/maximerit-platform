// Validation sécurisée des documents candidats — CV et lettre de motivation (Art. VI : contrôle type/taille, jamais public).

export const ALLOWED_CV_MIME: Record<string, string> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};
export const MAX_CV_MB = 20;
export const MAX_CV_BYTES = MAX_CV_MB * 1024 * 1024; // 20 Mo
/** Lettre de motivation saisie dans le formulaire (texte) : environ 2 pages. */
export const MAX_COVER_LETTER_CHARS = 8000;

export function validateCvFile(file: { mimetype?: string; size?: number; name?: string }): {
  valid: boolean;
  error?: string;
} {
  const mime = file.mimetype ?? "";
  if (!ALLOWED_CV_MIME[mime]) return { valid: false, error: "type de fichier non autorisé (PDF ou DOCX)" };
  if (!file.size || file.size <= 0) return { valid: false, error: "fichier vide" };
  if (file.size > MAX_CV_BYTES) return { valid: false, error: `fichier trop volumineux (max ${MAX_CV_MB} Mo)` };
  // Cohérence extension / MIME (défense en profondeur).
  const ext = (file.name ?? "").toLowerCase().split(".").pop() ?? "";
  if (ext && ext !== ALLOWED_CV_MIME[mime]) return { valid: false, error: "extension incohérente avec le type" };
  return { valid: true };
}

/**
 * Type réel d'un document d'après ses premiers octets (le type déclaré par le navigateur n'est pas fiable) :
 * PDF = « %PDF- », DOCX = archive ZIP « PK\x03\x04 ».
 */
export function sniffDocumentMime(bytes: Uint8Array): string | null {
  const b = bytes;
  if (b.length >= 5 && b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46 && b[4] === 0x2d) return "application/pdf";
  if (b.length >= 4 && b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return null;
}

/** Validation complète d'un document reçu : métadonnées + contenu réellement conforme au type annoncé. */
export function validateDocument(file: { mimetype?: string; size?: number; name?: string; bytes: Uint8Array }): { valid: boolean; error?: string } {
  const meta = validateCvFile(file);
  if (!meta.valid) return meta;
  if (sniffDocumentMime(file.bytes) !== file.mimetype) return { valid: false, error: "contenu du fichier non conforme (PDF ou DOCX attendu)" };
  return { valid: true };
}

/** Neutralise les noms de fichier (path traversal, caractères douteux). */
export function sanitizeFilename(name: string): string {
  const base = (name || "cv").split(/[\\/]/).pop() ?? "cv";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_").slice(0, 120);
  return cleaned || "cv";
}
