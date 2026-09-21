import { NextResponse, type NextRequest } from "next/server";
import { resolveRedirect } from "@/lib/redirects";

// Moteur de redirections SEO (Phase 4b) : applique les 301/410 de la carte de migration (Phase 0),
// côté serveur, sans chaîne. Table statique embarquée (edge, rapide, sans DB).
export function middleware(req: NextRequest) {
  const entry = resolveRedirect(req.nextUrl.pathname);
  if (!entry) return NextResponse.next();
  if (entry.status === 410) return new NextResponse("Gone", { status: 410 });
  if (entry.to) return NextResponse.redirect(new URL(entry.to, req.url), 301);
  return NextResponse.next();
}

// Exécuté sur toutes les routes sauf assets, admin Payload et API.
export const config = {
  matcher: ["/((?!_next/|admin|api|favicon.ico|.*\\.).*)"],
};
