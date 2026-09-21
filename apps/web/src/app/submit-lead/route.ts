import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { validateLead, isSpam, sanitizeUtm, type LeadInput } from "@/lib/lead";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Rate limiting best-effort en mémoire (par IP). En prod : store partagé (Redis).
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > MAX_PER_WINDOW;
}

export async function POST(req: Request): Promise<Response> {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  let body: LeadInput | null = null;
  try {
    body = (await req.json()) as LeadInput;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "bad_request" }, { status: 400 });

  // Honeypot : on accepte silencieusement (202) sans rien stocker, pour ne pas signaler le piège.
  if (isSpam(body)) return NextResponse.json({ ok: true }, { status: 202 });

  const { valid, errors, data } = validateLead(body);
  if (!valid || !data) return NextResponse.json({ errors }, { status: 400 });

  try {
    const payload = await getPayload({ config });
    const lead = await payload.create({
      collection: "leads",
      overrideAccess: true, // le contrôle d'accès public est remplacé par l'anti-spam ci-dessus
      data: {
        ...data,
        source: typeof body.source === "string" ? body.source : "site",
        utm: sanitizeUtm(body.utm),
        ...(body.landingPage != null ? { landingPage: body.landingPage as number } : {}),
      },
    });
    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
