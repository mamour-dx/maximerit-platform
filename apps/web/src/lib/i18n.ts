// Phase i18n — fondation FR/EN. FR à la racine, EN sous /en (ADR-0002).

export type Locale = "fr" | "en";
export const LOCALES: Locale[] = ["fr", "en"];
export const DEFAULT_LOCALE: Locale = "fr";

/** Map hreflang pour les métadonnées Next (`alternates.languages`). x-default = FR. */
export function hreflang(fr: string, en: string): Record<string, string> {
  return { fr, en, "x-default": fr };
}

/** Chemin équivalent dans l'autre langue (pour le sélecteur de langue). */
export function counterpartPath(pathname: string): { locale: Locale; href: string } {
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const stripped = pathname.replace(/^\/en/, "") || "/";
    return { locale: "fr", href: stripped };
  }
  return { locale: "en", href: pathname === "/" ? "/en/" : `/en${pathname}` };
}
