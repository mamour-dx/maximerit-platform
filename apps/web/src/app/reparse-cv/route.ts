import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { parseCandidateCv } from "@/lib/cv-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Endpoint interne : (re)parse le CV d'un candidat. Réservé aux utilisateurs authentifiés (recruteurs+).
export async function POST(req: Request): Promise<Response> {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { candidateId?: number | string } = {};
  try {
    body = (await req.json()) as { candidateId?: number | string };
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (body.candidateId == null) return NextResponse.json({ error: "candidateId requis" }, { status: 400 });

  const proposal = await parseCandidateCv(payload, body.candidateId);
  if (!proposal) return NextResponse.json({ ok: false, parseStatus: "failed" }, { status: 422 });
  return NextResponse.json({ ok: true, proposal });
}
