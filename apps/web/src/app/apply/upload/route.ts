import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { clientIp, rateLimiter, verifyTicket } from "@/lib/captcha";
import { blobEnabled } from "@/lib/blob-storage";
import { ALLOWED_CV_MIME, MAX_CV_BYTES } from "@/lib/upload";
import { isIncomingPathname } from "@/lib/apply";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const limited = rateLimiter(10);

/**
 * Étape 2 (production) : autorise le navigateur à déposer UN document (CV ou lettre, 20 Mo max) directement
 * dans le stockage privé — sans passer par le serveur, dont les requêtes sont limitées à 4,5 Mo sur Vercel.
 * Le jeton délivré est restreint : ticket de candidature valide, chemin « incoming/<uuid>.<pdf|docx> »
 * imposé, types PDF/DOCX, taille maximale, 10 minutes. Le contenu est revérifié à l'étape 3 (/apply).
 */
export async function POST(req: Request): Promise<Response> {
  if (!blobEnabled()) return NextResponse.json({ error: "not_available" }, { status: 404 });
  if (limited(clientIp(req))) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  let body: HandleUploadBody;
  try {
    body = (await req.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  // Seule la génération de jeton est servie (aucun rappel « upload terminé » : la finalisation se fait à l'étape 3).
  if (body?.type !== "blob.generate-client-token") return NextResponse.json({ error: "bad_request" }, { status: 400 });

  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let ticket: unknown;
        try {
          ticket = (JSON.parse(clientPayload ?? "{}") as { ticket?: unknown }).ticket;
        } catch {
          ticket = undefined;
        }
        if (!verifyTicket(ticket)) throw new Error("ticket");
        if (!isIncomingPathname(pathname)) throw new Error("pathname");
        return {
          allowedContentTypes: Object.keys(ALLOWED_CV_MIME),
          maximumSizeInBytes: MAX_CV_BYTES,
          addRandomSuffix: false,
          allowOverwrite: false,
          validUntil: Date.now() + 10 * 60 * 1000,
        };
      },
    });
    return NextResponse.json(result, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    const reason = err instanceof Error ? err.message : "error";
    return NextResponse.json({ error: reason === "ticket" ? "captcha" : "bad_request" }, { status: reason === "ticket" ? 403 : 400 });
  }
}
