import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { validateCandidateProfile, type CandidateProfile } from "@maximerit/domain";
import { validateCvFile, sanitizeFilename } from "@/lib/upload";
import type { Candidate } from "@/payload-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

// Champs du profil recopiés vers la fiche candidat (whitelist stricte).
const PROFILE_KEYS: (keyof CandidateProfile)[] = [
  "firstName", "lastName", "email", "phone", "whatsapp", "countryOfResidence", "nationality",
  "internationalMobility", "currentPosition", "targetSpecialty", "targetDiscipline", "sector",
  "yearsExperience", "seniority", "currentCompany", "salaryExpectation", "availabilityDays",
  "languages", "mining",
];

export async function POST(req: Request): Promise<Response> {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

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

  // Profil (JSON) → validation métier (domaine, consentement obligatoire)
  let profile: CandidateProfile;
  try {
    profile = JSON.parse(String(form.get("profile") ?? "{}")) as CandidateProfile;
  } catch {
    return NextResponse.json({ error: "profil invalide" }, { status: 400 });
  }
  const check = validateCandidateProfile(profile);
  if (!check.valid) return NextResponse.json({ errors: check.errors }, { status: 400 });

  // CV (fichier) — requis, type/taille contrôlés
  const file = form.get("cv");
  if (!file || typeof file === "string") return NextResponse.json({ errors: ["CV requis"] }, { status: 400 });
  const upload = validateCvFile({ mimetype: file.type, size: file.size, name: file.name });
  if (!upload.valid) return NextResponse.json({ errors: [upload.error] }, { status: 400 });

  try {
    const payload = await getPayload({ config });
    const buffer = Buffer.from(await file.arrayBuffer());
    const cv = await payload.create({
      collection: "cvs",
      file: { data: buffer, mimetype: file.type, name: sanitizeFilename(file.name), size: file.size },
      data: { candidateName: `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() },
    });

    const data: Record<string, unknown> = { cv: cv.id, source: "site", consent: true, consentAt: new Date().toISOString(), parseStatus: "pending", status: "nouveau" };
    for (const k of PROFILE_KEYS) if (profile[k] != null) data[k] = profile[k];

    // Données assemblées dynamiquement puis validées (validateCandidateProfile) : on informe TS
    // via le type généré (les génériques Payload ne l'infèrent pas depuis un Record).
    const candidate = await payload.create({
      collection: "candidates",
      overrideAccess: true,
      data: data as unknown as Candidate,
    });

    // Candidature à une offre précise (Phase 6) : crée une Application reliée à l'ATS.
    const jobId = form.get("jobId");
    let applicationId: number | string | undefined;
    if (jobId != null && String(jobId).trim() !== "") {
      const application = await payload.create({
        collection: "applications",
        overrideAccess: true,
        data: { job: Number(jobId), candidate: candidate.id, cv: cv.id, status: "recue", source: "site" },
      });
      applicationId = application.id;
    }

    return NextResponse.json({ ok: true, id: candidate.id, cvId: cv.id, applicationId }, { status: 201 });
  } catch (err) {
    console.error("[apply] échec création:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
