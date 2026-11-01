// Captcha Cloudflare Turnstile — formulaires publics (candidature, demande d'entreprise).
// Actif dès que TURNSTILE_SECRET_KEY est défini (et NEXT_PUBLIC_TURNSTILE_SITE_KEY côté navigateur).
// Sans clés (développement, tests), la vérification est ignorée : le honeypot et la limite de débit restent actifs.
// Turnstile ne dépose pas de cookie de suivi : pas de consentement requis (bannière inchangée).
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export const captchaEnabled = (): boolean => Boolean(process.env.TURNSTILE_SECRET_KEY);

let warned = false;
function warnIfDisabledInProduction() {
  if (!warned && !captchaEnabled() && process.env.NODE_ENV === "production") {
    warned = true;
    console.warn("[captcha] TURNSTILE_SECRET_KEY absent : captcha désactivé sur les formulaires publics.");
  }
}

export type CaptchaResult = { ok: true } | { ok: false; reason: string };

/** Vérifie un jeton Turnstile auprès de Cloudflare. Échec fermé : Cloudflare injoignable → refus. */
export async function verifyCaptcha(token: unknown, ip?: string, fetcher: typeof fetch = fetch): Promise<CaptchaResult> {
  warnIfDisabledInProduction();
  if (!captchaEnabled()) return { ok: true };
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) return { ok: false, reason: "missing-input-response" };
  const body = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY as string, response: token });
  if (ip && ip !== "local") body.set("remoteip", ip);
  try {
    const res = await fetcher(VERIFY_URL, { method: "POST", body, signal: AbortSignal.timeout(8000) });
    const json = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (json.success === true) return { ok: true };
    return { ok: false, reason: (json["error-codes"] ?? []).join(",") || "rejected" };
  } catch {
    return { ok: false, reason: "unreachable" };
  }
}

// ───────────────────────────── Ticket de candidature ─────────────────────────────
// Un jeton Turnstile n'est valable qu'une fois, or une candidature enchaîne plusieurs appels (envoi du CV,
// de la lettre, puis de la fiche). Le captcha est donc vérifié une seule fois (/apply/session) et échangé
// contre un ticket signé (HMAC, PAYLOAD_SECRET) à durée de vie courte, présenté aux appels suivants.

const TICKET_TTL_MS = 15 * 60 * 1000;
const ticketKey = () => `${process.env.PAYLOAD_SECRET || "dev_secret_change_me"}:apply-ticket`;
const sign = (body: string) => createHmac("sha256", ticketKey()).update(body).digest("base64url");

export function issueTicket(now = Date.now()): string {
  const body = `${now + TICKET_TTL_MS}.${randomBytes(12).toString("base64url")}`;
  return `${body}.${sign(body)}`;
}

export function verifyTicket(ticket: unknown, now = Date.now()): boolean {
  if (typeof ticket !== "string" || ticket.length > 200) return false;
  const parts = ticket.split(".");
  if (parts.length !== 3) return false;
  const [exp, nonce, mac] = parts;
  const expected = Buffer.from(sign(`${exp}.${nonce}`));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;
  return Number(exp) > now;
}

/** IP du client (derrière le proxy Vercel). */
export const clientIp = (req: Request): string => req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

/** Limite de débit best-effort en mémoire (par instance), même principe que les routes existantes. */
export function rateLimiter(max: number, windowMs = 60_000) {
  const hits = new Map<string, number[]>();
  return (key: string): boolean => {
    const now = Date.now();
    const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    arr.push(now);
    hits.set(key, arr);
    return arr.length > max;
  };
}
