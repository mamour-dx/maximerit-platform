import { NextResponse } from "next/server";

// Liveness — l'app répond. Pas d'accès aux dépendances.
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ status: "ok", service: "maximerit-web", ts: Date.now() });
}
