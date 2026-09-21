import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { searchCandidates, type SearchFilters } from "@/lib/search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Recherche du vivier — réservée aux utilisateurs internes authentifiés (données candidats).
export async function POST(req: Request): Promise<Response> {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let filters: SearchFilters = {};
  try {
    filters = (await req.json()) as SearchFilters;
  } catch {
    /* corps vide = recherche sans filtre */
  }
  const res = await searchCandidates(filters);
  return NextResponse.json({ hits: res.hits, estimatedTotalHits: res.estimatedTotalHits });
}
