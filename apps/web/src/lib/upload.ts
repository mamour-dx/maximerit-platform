// Validation sécurisée des uploads de CV (Art. VI : contrôle type/taille, jamais public).

export const ALLOWED_CV_MIME: Record<string, string> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};
export const MAX_CV_BYTES = 5 * 1024 * 1024; // 5 Mo

export function validateCvFile(file: { mimetype?: string; size?: number; name?: string }): {
  valid: boolean;
  error?: string;
} {
  const mime = file.mimetype ?? "";
  if (!ALLOWED_CV_MIME[mime]) return { valid: false, error: "type de fichier non autorisé (PDF ou DOCX)" };
  if (!file.size || file.size <= 0) return { valid: false, error: "fichier vide" };
  if (file.size > MAX_CV_BYTES) return { valid: false, error: "fichier trop volumineux (max 5 Mo)" };
  // Cohérence extension / MIME (défense en profondeur).
  const ext = (file.name ?? "").toLowerCase().split(".").pop() ?? "";
  if (ext && ext !== ALLOWED_CV_MIME[mime]) return { valid: false, error: "extension incohérente avec le type" };
  return { valid: true };
}

/** Neutralise les noms de fichier (path traversal, caractères douteux). */
export function sanitizeFilename(name: string): string {
  const base = (name || "cv").split(/[\\/]/).pop() ?? "cv";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_").slice(0, 120);
  return cleaned || "cv";
}
