// Validation métier des leads (pure, testable sans DB). Utilisée par la route /submit-lead.

export interface LeadInput {
  company?: string;
  contactName?: string;
  jobFunction?: string;
  email?: string;
  phone?: string;
  country?: string;
  sector?: string;
  profileSought?: string;
  headcount?: number | string;
  level?: string;
  location?: string;
  desiredDate?: string;
  comment?: string;
  company_url?: string; // honeypot anti-spam (doit rester vide)
  [key: string]: unknown;
}

export interface LeadData {
  company?: string;
  contactName: string;
  jobFunction?: string;
  email: string;
  phone?: string;
  country?: string;
  sector?: string;
  profileSought?: string;
  headcount?: number;
  level?: string;
  location?: string;
  desiredDate?: string;
  comment?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STR_FIELDS = [
  "company", "contactName", "jobFunction", "email", "phone", "country",
  "sector", "profileSought", "level", "location", "desiredDate", "comment",
] as const;

/** Détection anti-spam par honeypot : un bot remplit le champ caché `company_url`. */
export function isSpam(input: LeadInput): boolean {
  return typeof input.company_url === "string" && input.company_url.trim() !== "";
}

export function validateLead(input: LeadInput): { valid: boolean; errors: string[]; data: LeadData | null } {
  const errors: string[] = [];
  if (!input || typeof input !== "object") return { valid: false, errors: ["payload invalide"], data: null };

  const contactName = String(input.contactName ?? "").trim();
  const email = String(input.email ?? "").trim();
  if (!contactName) errors.push("contactName requis");
  if (!email || !EMAIL_RE.test(email)) errors.push("email invalide");

  let headcount: number | undefined;
  if (input.headcount != null && input.headcount !== "") {
    headcount = Number(input.headcount);
    if (!Number.isFinite(headcount) || headcount < 0) errors.push("headcount doit être un nombre >= 0");
  }

  if (errors.length) return { valid: false, errors, data: null };

  // Whitelist des champs (jamais le honeypot ni des champs arbitraires).
  const data = { contactName, email } as LeadData;
  for (const f of STR_FIELDS) {
    if (f === "contactName" || f === "email") continue;
    const v = input[f];
    if (typeof v === "string" && v.trim() !== "") (data as unknown as Record<string, unknown>)[f] = v.trim();
  }
  if (headcount != null) data.headcount = headcount;
  return { valid: true, errors: [], data };
}

const UTM_KEYS = ["source", "medium", "campaign", "term", "content"] as const;
/** Ne conserve que les clés UTM connues (pas de données arbitraires). */
export function sanitizeUtm(utm: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (utm && typeof utm === "object") {
    for (const k of UTM_KEYS) {
      const v = (utm as Record<string, unknown>)[k];
      if (typeof v === "string" && v.trim() !== "") out[k] = v.trim();
    }
  }
  return out;
}
