// Phase 9 — En-têtes de sécurité appliqués à toutes les réponses (via next.config headers()).
// Module pur pour être testable sans démarrer le serveur.

export const SECURITY_HEADERS: { key: string; value: string }[] = [
  // Empêche le MIME-sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Anti-clickjacking (l'admin reste en same-origin).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Ne fuite pas l'URL complète en cross-origin.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Réduit la surface d'API navigateur.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  // HSTS — effectif en HTTPS (production).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

export function headersConfig() {
  return [{ source: "/:path*", headers: SECURITY_HEADERS }];
}
