import { describe, it, expect } from "vitest";
import { validateLead, isSpam, sanitizeUtm, type LeadInput } from "@/lib/lead";

describe("validateLead", () => {
  it("valide un lead correct et normalise headcount", () => {
    const r = validateLead({ contactName: "Awa", email: "a@b.com", headcount: "3", company: "X" });
    expect(r.valid).toBe(true);
    expect(r.data?.headcount).toBe(3);
    expect(r.data?.company).toBe("X");
  });

  it("exige nom et email valides", () => {
    expect(validateLead({ email: "a@b.com" }).valid).toBe(false);
    expect(validateLead({ contactName: "x", email: "pas-un-email" }).valid).toBe(false);
  });

  it("rejette un headcount négatif", () => {
    expect(validateLead({ contactName: "x", email: "a@b.com", headcount: -1 }).valid).toBe(false);
  });

  it("n'inclut jamais le honeypot dans les données", () => {
    const r = validateLead({ contactName: "x", email: "a@b.com", company_url: "spam" } as LeadInput);
    expect((r.data as Record<string, unknown> | null)?.company_url).toBeUndefined();
  });
});

describe("anti-spam & UTM", () => {
  it("détecte le honeypot", () => {
    expect(isSpam({ company_url: "x" })).toBe(true);
    expect(isSpam({})).toBe(false);
  });

  it("ne conserve que les clés UTM connues", () => {
    expect(sanitizeUtm({ source: "google", medium: "cpc", evil: "x" })).toEqual({ source: "google", medium: "cpc" });
  });
});
