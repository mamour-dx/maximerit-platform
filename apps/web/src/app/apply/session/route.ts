import { after, NextResponse } from "next/server";
import { clientIp, issueTicket, rateLimiter, verifyCaptcha } from "@/lib/captcha";
import { blobEnabled, sweepAbandonedUploads } from "@/lib/blob-storage";
import { MAX_CV_BYTES } from "@/lib/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const limited = rateLimiter(10);

/**
 * Étape 1 d'une candidature : vérifie le captcha (une seule fois) et remet un ticket signé de courte durée,
 * exigé pour envoyer les fichiers puis la fiche. Indique aussi au formulaire s'il doit envoyer les fichiers
 * directement au stockage privé (production) ou avec la fiche (développement).
 */
export async function POST(req: Request): Promise<Response> {
  const ip = clientIp(req);
  if (limited(ip)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  let body: { captchaToken?: unknown } = {};
  try {
    body = (await req.json()) as { captchaToken?: unknown };
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const captcha = await verifyCaptcha(body.captchaToken, ip);
  if (!captcha.ok) return NextResponse.json({ error: "captcha", reason: captcha.reason }, { status: 403 });

  // Après la réponse : suppression des dépôts abandonnés (CV déposés sans formulaire envoyé).
  const sweep = () =>
    sweepAbandonedUploads()
      .then((n) => void (n && console.info(`[apply] ${n} dépôt(s) abandonné(s) supprimé(s)`)))
      .catch((err) => console.error("[apply] nettoyage :", err instanceof Error ? err.message : err));
  try {
    after(sweep);
  } catch {
    void sweep(); // hors d'une requête Next (appel direct en test)
  }

  return NextResponse.json({ ticket: issueTicket(), directUpload: blobEnabled(), maxBytes: MAX_CV_BYTES }, { headers: { "cache-control": "no-store" } });
}
