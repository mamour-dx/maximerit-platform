// @vitest-environment node
// Candidature — documents (20 Mo, signature réelle des fichiers), lettre de motivation, ticket et captcha Turnstile.
import { describe, it, expect, afterEach, vi } from "vitest";
import { MAX_CV_BYTES, sniffDocumentMime, validateDocument, validateCvFile } from "@/lib/upload";
import { ApplyError, isIncomingPathname, normalizeLetterText } from "@/lib/apply";
import { issueTicket, verifyCaptcha, verifyTicket } from "@/lib/captcha";

const PDF = "application/pdf";
const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const bytes = (s: string) => new Uint8Array(Buffer.from(s, "binary"));

afterEach(() => vi.unstubAllEnvs());

describe("documents candidats", () => {
  it("limite portée à 20 Mo", () => {
    expect(MAX_CV_BYTES).toBe(20 * 1024 * 1024);
    expect(validateCvFile({ mimetype: PDF, size: 19 * 1024 * 1024, name: "cv.pdf" }).valid).toBe(true);
    expect(validateCvFile({ mimetype: PDF, size: MAX_CV_BYTES + 1, name: "cv.pdf" })).toEqual({ valid: false, error: "fichier trop volumineux (max 20 Mo)" });
  });

  it("type réel lu dans les octets (PDF, DOCX), pas dans l'extension", () => {
    expect(sniffDocumentMime(bytes("%PDF-1.7\n…"))).toBe(PDF);
    expect(sniffDocumentMime(bytes("PK\x03\x04…"))).toBe(DOCX);
    expect(sniffDocumentMime(bytes("MZ\x90\x00"))).toBeNull(); // exécutable Windows
    expect(sniffDocumentMime(new Uint8Array(0))).toBeNull();
  });

  it("refuse un fichier renommé en .pdf", () => {
    expect(validateDocument({ mimetype: PDF, size: 10, name: "cv.pdf", bytes: bytes("<html>…") }).valid).toBe(false);
    expect(validateDocument({ mimetype: PDF, size: 10, name: "cv.pdf", bytes: bytes("PK\x03\x04") }).valid).toBe(false); // DOCX déguisé
    expect(validateDocument({ mimetype: DOCX, size: 10, name: "lettre.docx", bytes: bytes("PK\x03\x04") }).valid).toBe(true);
  });

  it("chemins d'envoi direct imposés : incoming/<uuid>.<pdf|docx> uniquement", () => {
    expect(isIncomingPathname("incoming/0f8fad5b-d9cb-469f-a165-70867728950e.pdf")).toBe(true);
    expect(isIncomingPathname("incoming/0f8fad5b-d9cb-469f-a165-70867728950e.docx")).toBe(true);
    for (const bad of ["cvs/x.pdf", "incoming/../cvs/a.pdf", "incoming/0f8fad5b-d9cb-469f-a165-70867728950e.exe", "incoming/abc.pdf", 42, null]) {
      expect(isIncomingPathname(bad)).toBe(false);
    }
  });
});

describe("lettre de motivation (texte)", () => {
  it("facultative : vide → rien", () => {
    expect(normalizeLetterText(undefined)).toBeUndefined();
    expect(normalizeLetterText("   \n\n ")).toBeUndefined();
  });
  it("nettoyée (retours à la ligne, espaces) et bornée à 8 000 caractères", () => {
    expect(normalizeLetterText("  Madame,\r\n\r\n\r\n\r\nJe   postule.  \n")).toBe("Madame,\n\nJe   postule.");
    expect(() => normalizeLetterText("x".repeat(8001))).toThrow(ApplyError);
    expect(normalizeLetterText("x".repeat(8000))).toHaveLength(8000);
  });
});

describe("ticket de candidature", () => {
  it("valide 15 minutes, infalsifiable", () => {
    const t = issueTicket(1_000_000);
    expect(verifyTicket(t, 1_000_000 + 14 * 60_000)).toBe(true);
    expect(verifyTicket(t, 1_000_000 + 16 * 60_000)).toBe(false); // expiré
    const [exp, nonce, mac] = t.split(".");
    expect(verifyTicket(`${Number(exp) + 3_600_000}.${nonce}.${mac}`, 1_000_000)).toBe(false); // prolongé à la main
    expect(verifyTicket(`${exp}.${nonce}.${mac.slice(0, -2)}xx`, 1_000_000)).toBe(false);
    for (const bad of [undefined, "", "a.b", 123]) expect(verifyTicket(bad)).toBe(false);
  });
});

describe("captcha Turnstile", () => {
  const ok = (json: unknown) => vi.fn(async () => new Response(JSON.stringify(json))) as unknown as typeof fetch;

  it("sans clé secrète : ignoré (développement)", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    const f = ok({ success: false });
    expect(await verifyCaptcha(undefined, "1.2.3.4", f)).toEqual({ ok: true });
    expect(f).not.toHaveBeenCalled();
  });

  it("avec clé : jeton exigé, vérifié auprès de Cloudflare (secret + IP)", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "secret-test");
    expect(await verifyCaptcha("", "1.2.3.4", ok({ success: true }))).toEqual({ ok: false, reason: "missing-input-response" });

    const f = ok({ success: true });
    expect(await verifyCaptcha("tok", "1.2.3.4", f)).toEqual({ ok: true });
    const [url, init] = (f as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls[0];
    expect(url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    const sent = new URLSearchParams(String(init.body));
    expect([sent.get("secret"), sent.get("response"), sent.get("remoteip")]).toEqual(["secret-test", "tok", "1.2.3.4"]);

    expect(await verifyCaptcha("tok", "local", ok({ success: false, "error-codes": ["invalid-input-response"] }))).toEqual({ ok: false, reason: "invalid-input-response" });
  });

  it("Cloudflare injoignable → refus (échec fermé)", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "secret-test");
    const down = vi.fn(async () => {
      throw new Error("ECONNREFUSED");
    }) as unknown as typeof fetch;
    expect(await verifyCaptcha("tok", undefined, down)).toEqual({ ok: false, reason: "unreachable" });
  });
});
