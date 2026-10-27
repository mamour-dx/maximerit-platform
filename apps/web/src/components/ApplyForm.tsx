"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Turnstile, captchaOnPage } from "@/components/Turnstile";
import { pushEvent, trackOnce } from "@/lib/analytics";

type Status = "idle" | "loading" | "success" | "error";
type LetterMode = "file" | "text";

// Limites affichées et contrôlées avant envoi (le serveur revérifie tout — src/lib/upload.ts).
const MAX_MB = 20;
const MAX_BYTES = MAX_MB * 1024 * 1024;
const MAX_LETTER_CHARS = 8000;
const MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const COPY = {
  fr: {
    successTitle: "Candidature envoyée — merci !",
    successBody: "Votre profil rejoint notre vivier. Un consultant vous recontacte si votre profil correspond.",
    applyTo: "Postuler à :",
    firstName: "Prénom *", lastName: "Nom *", email: "Email *", phone: "Téléphone *",
    currentPosition: "Poste actuel", cv: `CV (PDF ou DOCX, ${MAX_MB} Mo max) *`,
    letter: "Lettre de motivation (facultatif)", letterFile: "Joindre un fichier", letterText: "L'écrire ici",
    letterFileHint: `PDF ou DOCX, ${MAX_MB} Mo max.`, letterPlaceholder: "Présentez-vous en quelques paragraphes…",
    chars: "caractères",
    consent: "J'accepte que Maximerit traite mes données pour cette candidature et son vivier de talents.",
    submit: "Envoyer ma candidature", sending: "Envoi…", uploading: "Envoi des fichiers…",
    errors: {
      generic: "Vérifiez vos informations (email, téléphone, CV) et réessayez.",
      consent: "Veuillez accepter le traitement de vos données pour envoyer votre candidature.",
      cv_required: "Ajoutez votre CV (PDF ou DOCX).",
      cv_too_large: `Votre CV dépasse ${MAX_MB} Mo. Compressez-le ou exportez-le à nouveau en PDF.`,
      cv_invalid: "Le CV doit être un fichier PDF ou DOCX valide.",
      letter_too_large: `La lettre de motivation dépasse ${MAX_MB} Mo.`,
      letter_invalid: "La lettre de motivation doit être un fichier PDF ou DOCX valide.",
      letter_text_too_long: `La lettre de motivation dépasse ${MAX_LETTER_CHARS} caractères.`,
      captcha: "La vérification anti-robot n'a pas abouti. Réessayez.",
      captcha_pending: "Patientez quelques secondes : la vérification anti-robot est en cours.",
      rate_limited: "Trop de tentatives. Réessayez dans une minute.",
      upload: "L'envoi du fichier a échoué. Vérifiez votre connexion et réessayez.",
    },
  },
  en: {
    successTitle: "Application sent — thank you!",
    successBody: "Your profile joins our talent pool. A consultant will reach out if your profile matches.",
    applyTo: "Applying for:",
    firstName: "First name *", lastName: "Last name *", email: "Email *", phone: "Phone *",
    currentPosition: "Current position", cv: `CV (PDF or DOCX, ${MAX_MB} MB max) *`,
    letter: "Cover letter (optional)", letterFile: "Attach a file", letterText: "Write it here",
    letterFileHint: `PDF or DOCX, ${MAX_MB} MB max.`, letterPlaceholder: "Introduce yourself in a few paragraphs…",
    chars: "characters",
    consent: "I agree that Maximerit may process my data for this application and its talent pool.",
    submit: "Send my application", sending: "Sending…", uploading: "Uploading files…",
    errors: {
      generic: "Check your details (email, phone, CV) and try again.",
      consent: "Please accept the processing of your data to send your application.",
      cv_required: "Add your CV (PDF or DOCX).",
      cv_too_large: `Your CV is larger than ${MAX_MB} MB. Compress it or export it again as PDF.`,
      cv_invalid: "Your CV must be a valid PDF or DOCX file.",
      letter_too_large: `Your cover letter is larger than ${MAX_MB} MB.`,
      letter_invalid: "Your cover letter must be a valid PDF or DOCX file.",
      letter_text_too_long: `Your cover letter is longer than ${MAX_LETTER_CHARS} characters.`,
      captcha: "The anti-bot check did not complete. Please try again.",
      captcha_pending: "Please wait a few seconds: the anti-bot check is in progress.",
      rate_limited: "Too many attempts. Try again in a minute.",
      upload: "The file upload failed. Check your connection and try again.",
    },
  },
} as const;

type ErrorKey = keyof (typeof COPY)["fr"]["errors"];

const extOf = (f: File) => f.name.toLowerCase().split(".").pop() ?? "";
const fileOrNull = (v: FormDataEntryValue | null): File | null => (v && typeof v !== "string" && v.size > 0 ? v : null);
/** Type MIME fiable d'après l'extension (certains navigateurs mobiles n'en fournissent pas pour le DOCX). */
const withMime = (f: File) => (MIME_BY_EXT[extOf(f)] && f.type !== MIME_BY_EXT[extOf(f)] ? new File([f], f.name, { type: MIME_BY_EXT[extOf(f)] }) : f);

function checkFile(f: File | null, kind: "cv" | "letter"): ErrorKey | null {
  if (!f) return kind === "cv" ? "cv_required" : null;
  if (!MIME_BY_EXT[extOf(f)]) return kind === "cv" ? "cv_invalid" : "letter_invalid";
  if (f.size > MAX_BYTES) return kind === "cv" ? "cv_too_large" : "letter_too_large";
  return null;
}

export function ApplyForm({ jobId, jobTitle, lang = "fr" }: { jobId?: number | string; jobTitle?: string; lang?: "fr" | "en" }) {
  const trackId = jobId ?? "spontanee";
  const t = COPY[lang];
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<ErrorKey>("generic");
  const [progress, setProgress] = useState<number | null>(null);
  const [letterMode, setLetterMode] = useState<LetterMode>("file");
  const [letterChars, setLetterChars] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0); // remonte le widget → nouveau jeton après chaque tentative

  const fail = (key: ErrorKey) => {
    setError(key);
    setStatus("error");
    setProgress(null);
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!fd.get("consent")) return fail("consent");
    const cv = fileOrNull(fd.get("cv"));
    const letterFile = letterMode === "file" ? fileOrNull(fd.get("coverLetter")) : null;
    const letterText = letterMode === "text" ? String(fd.get("coverLetterText") ?? "").trim() : "";
    const fileError = checkFile(cv, "cv") ?? checkFile(letterFile, "letter");
    if (fileError) return fail(fileError);
    if (letterText.length > MAX_LETTER_CHARS) return fail("letter_text_too_long");
    if (captchaOnPage && !captchaToken) return fail("captcha_pending");

    setStatus("loading");
    try {
      // 1. Captcha vérifié une fois → ticket pour la suite ; le serveur indique le mode d'envoi des fichiers.
      const sres = await fetch("/apply/session/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ captchaToken }),
      });
      if (!sres.ok) return fail(sres.status === 429 ? "rate_limited" : "captcha");
      const session = (await sres.json()) as { ticket: string; directUpload: boolean };

      const profile = {
        firstName: fd.get("firstName"),
        lastName: fd.get("lastName"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        consent: true,
        currentPosition: fd.get("currentPosition"),
      };
      const body = new FormData();
      body.set("profile", JSON.stringify(profile));
      body.set("ticket", session.ticket);
      if (jobId != null) body.set("jobId", String(jobId));
      if (letterText) body.set("coverLetterText", letterText);
      body.set("company_url", String(fd.get("company_url") ?? "")); // honeypot

      const files = [
        ["cv", cv as File],
        ...(letterFile ? ([["coverLetter", letterFile]] as const) : []),
      ] as const;

      // 2. Fichiers : directement vers le stockage privé (production) ou joints à la requête (développement).
      if (session.directUpload) {
        const { upload } = await import("@vercel/blob/client");
        const total = files.reduce((n, [, f]) => n + f.size, 0);
        let done = 0;
        setProgress(0);
        for (const [field, raw] of files) {
          const f = withMime(raw);
          try {
            const blob = await upload(`incoming/${crypto.randomUUID()}.${extOf(f)}`, f, {
              access: "private",
              handleUploadUrl: "/apply/upload/",
              clientPayload: JSON.stringify({ ticket: session.ticket }),
              contentType: f.type,
              multipart: f.size > 8 * 1024 * 1024,
              onUploadProgress: ({ loaded }) => setProgress(Math.min(99, Math.round(((done + loaded) / total) * 100))),
            });
            done += f.size;
            body.set(`${field}Ref`, blob.pathname);
            body.set(`${field}Name`, f.name);
          } catch {
            return fail("upload");
          }
        }
        setProgress(100);
      } else {
        for (const [field, f] of files) body.set(field, withMime(f));
      }

      // 3. Fiche candidat.
      const res = await fetch("/apply/", { method: "POST", body });
      if (res.ok) {
        pushEvent("upload_cv", { jobId: trackId });
        pushEvent("submit_application", { jobId: trackId });
        setStatus("success");
        return;
      }
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.status === 429) return fail("rate_limited");
      return fail(j.error && j.error in t.errors ? (j.error as ErrorKey) : "generic");
    } catch {
      return fail("generic");
    } finally {
      setCaptchaToken(null);
      setCaptchaKey((k) => k + 1);
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-[var(--radius)] border border-border bg-surface p-6">
        <p className="font-semibold text-accent">{t.successTitle}</p>
        <p className="mt-1 text-sm text-muted">{t.successBody}</p>
      </div>
    );
  }

  const fileInput =
    "block w-full rounded-[var(--radius)] border border-dashed border-border bg-surface p-3 text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-brand-soft file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand";
  const tab = (active: boolean) =>
    `rounded-full px-3 py-1 text-xs font-semibold transition ${active ? "bg-brand-soft text-brand" : "text-muted hover:text-foreground"}`;

  return (
    <form onSubmit={onSubmit} onFocus={() => trackOnce(`apply_start:${trackId}`, "start_application", { jobId: trackId })} className="grid gap-3" noValidate>
      <input type="text" name="company_url" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {jobTitle ? <p className="text-sm text-muted">{t.applyTo} <strong>{jobTitle}</strong></p> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="firstName" required placeholder={t.firstName} className="field" />
        <input name="lastName" required placeholder={t.lastName} className="field" />
        <input name="email" type="email" required placeholder={t.email} className="field" />
        <input name="phone" required placeholder={t.phone} className="field" />
      </div>
      <input name="currentPosition" placeholder={t.currentPosition} className="field" />
      <label className="grid gap-1.5 text-sm font-medium">{t.cv}<input name="cv" type="file" required accept=".pdf,.docx" className={fileInput} /></label>

      <fieldset className="grid gap-1.5">
        <legend className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium">
          {t.letter}
          <span className="flex gap-1">
            <button type="button" aria-pressed={letterMode === "file"} className={tab(letterMode === "file")} onClick={() => setLetterMode("file")}>{t.letterFile}</button>
            <button type="button" aria-pressed={letterMode === "text"} className={tab(letterMode === "text")} onClick={() => setLetterMode("text")}>{t.letterText}</button>
          </span>
        </legend>
        {letterMode === "file" ? (
          <>
            <input name="coverLetter" type="file" accept=".pdf,.docx" aria-label={t.letter} className={fileInput} />
            <p className="text-xs text-muted">{t.letterFileHint}</p>
          </>
        ) : (
          <>
            <textarea name="coverLetterText" rows={7} maxLength={MAX_LETTER_CHARS} aria-label={t.letter} placeholder={t.letterPlaceholder} className="field" onChange={(e) => setLetterChars(e.target.value.length)} />
            <p className="text-right text-xs text-muted">{letterChars} / {MAX_LETTER_CHARS} {t.chars}</p>
          </>
        )}
      </fieldset>

      <label className="flex items-start gap-2 text-sm text-muted">
        <input name="consent" type="checkbox" required className="mt-1" />
        <span>{t.consent}</span>
      </label>
      <Turnstile key={captchaKey} lang={lang} action="apply" onToken={setCaptchaToken} />
      {status === "error" && <p role="alert" className="text-sm text-brand">{t.errors[error]}</p>}
      {status === "loading" && progress !== null && (
        <div className="grid gap-1" aria-live="polite">
          <div className="h-1.5 overflow-hidden rounded-full bg-surface"><div className="h-full bg-brand transition-all" style={{ width: `${progress}%` }} /></div>
          <p className="text-xs text-muted">{t.uploading} {progress} %</p>
        </div>
      )}
      <Button type="submit" disabled={status === "loading"} className="mt-1 py-3">{status === "loading" ? t.sending : t.submit}</Button>
    </form>
  );
}
