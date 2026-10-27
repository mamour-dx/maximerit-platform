import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { validateCandidateProfile, type CandidateProfile } from "@maximerit/domain";
import { ApplyError, submitApplication, type DocInput } from "@/lib/apply";
import { captchaEnabled, clientIp, rateLimiter, verifyTicket } from "@/lib/captcha";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const limited = rateLimiter(5);

/** Document du formulaire : fichier joint (`<champ>`) ou référence d'envoi direct (`<champ>Ref` + `<champ>Name`). */
function docFrom(form: FormData, field: string): DocInput {
  const file = form.get(field);
  if (file && typeof file !== "string" && file.size > 0) return { file };
  const ref = form.get(`${field}Ref`);
  if (typeof ref === "string" && ref) {
    const name = form.get(`${field}Name`);
    return { ref, name: typeof name === "string" ? name.slice(0, 200) : undefined };
  }
  return null;
}

/**
 * Étape finale d'une candidature : profil + CV (requis) + lettre de motivation (facultative, fichier ou texte).
 * Captcha : ticket exigé quand Turnstile est configuré (délivré par /apply/session après vérification).
 */
export async function POST(req: Request): Promise<Response> {
  if (limited(clientIp(req))) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // Anti-spam honeypot
  const honeypot = form.get("company_url");
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return NextResponse.json({ ok: true }, { status: 202 });
  }

  if (captchaEnabled() && !verifyTicket(form.get("ticket"))) {
    return NextResponse.json({ error: "captcha", errors: ["captcha"] }, { status: 403 });
  }

  // Profil (JSON) → validation métier (domaine, consentement obligatoire)
  let profile: CandidateProfile;
  try {
    profile = JSON.parse(String(form.get("profile") ?? "{}")) as CandidateProfile;
  } catch {
    return NextResponse.json({ error: "profil invalide" }, { status: 400 });
  }
  const check = validateCandidateProfile(profile);
  if (!check.valid) return NextResponse.json({ errors: check.errors }, { status: 400 });

  const jobRaw = form.get("jobId");
  const jobId = jobRaw != null && String(jobRaw).trim() !== "" ? Number(jobRaw) : undefined;
  if (jobId !== undefined && !Number.isInteger(jobId)) return NextResponse.json({ errors: ["offre invalide"] }, { status: 400 });

  try {
    const payload = await getPayload({ config });
    const letterText = form.get("coverLetterText");
    const result = await submitApplication(payload, {
      profile,
      jobId,
      cv: docFrom(form, "cv"),
      coverLetter: docFrom(form, "coverLetter"),
      coverLetterText: typeof letterText === "string" ? letterText : undefined,
    });
    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (err) {
    if (err instanceof ApplyError) return NextResponse.json({ error: err.code, errors: [err.code] }, { status: err.code === "cv_too_large" || err.code === "letter_too_large" ? 413 : 400 });
    console.error("[apply] échec création:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
