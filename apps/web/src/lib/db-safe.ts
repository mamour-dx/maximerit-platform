// Lecture « fail-soft » de la base : si la DB est injoignable ou non migrée (environnement de démo,
// incident), les pages publiques se dégradent (liste vide, 404) au lieu de renvoyer une erreur 500.
// Réservé aux lectures publiques ; les écritures (leads, candidatures) gèrent leurs erreurs elles-mêmes.

export async function safeRead<T>(label: string, read: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await read();
  } catch (err) {
    console.error(`[db-safe] ${label} indisponible :`, err instanceof Error ? err.message : err);
    return fallback;
  }
}
