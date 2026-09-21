import redirects from "@/redirects.generated.json";

export interface RedirectEntry {
  to?: string;
  status: number; // 301 | 410
}

const MAP = redirects as Record<string, RedirectEntry>;

function withTrailingSlash(p: string): string {
  if (p.length > 1 && !p.endsWith("/")) return `${p}/`;
  return p;
}

/** Résout une redirection pour un chemin (tolère l'absence de slash final). */
export function resolveRedirect(pathname: string): RedirectEntry | null {
  return MAP[withTrailingSlash(pathname)] ?? MAP[pathname] ?? null;
}
