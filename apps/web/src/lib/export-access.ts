// Export des données candidats — qui peut exporter (Art. VI : moindre privilège).
// Module sans dépendance : importé à la fois par le serveur (endpoint) et par le bouton du back-office.

/** Collections exportables depuis le back-office. */
export const EXPORTABLE = ["candidates", "applications"] as const;
export type ExportCollection = (typeof EXPORTABLE)[number];

export const EXPORT_FORMATS = ["xlsx", "csv"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

/**
 * Un export sort en masse des données personnelles du back-office : réservé aux rôles qui traitent les
 * candidats (recruteurs) et aux administrateurs. Lecture seule, marketing et contenu : consultation uniquement.
 */
export const EXPORT_ROLES = ["SUPER_ADMIN", "ADMIN", "RECRUITER"] as const;

export const canExport = (user: unknown): boolean => {
  const role = (user as { role?: string } | null | undefined)?.role;
  return !!role && (EXPORT_ROLES as readonly string[]).includes(role);
};

/** Au-delà, l'export est refusé (message explicite) plutôt que tronqué en silence. */
export const MAX_EXPORT_ROWS = 10000;
