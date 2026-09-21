import { describe, it, expect } from "vitest";
import { isExpired, isLive, buildJobPostingJsonLd } from "@/lib/job";

const future = new Date(Date.now() + 30 * 864e5).toISOString();
const past = new Date(Date.now() - 864e5).toISOString();

describe("expiration des offres", () => {
  it("expirée par statut", () => {
    expect(isExpired({ id: 1, status: "expiree" })).toBe(true);
    expect(isExpired({ id: 1, status: "pourvue" })).toBe(true);
  });
  it("expirée par date dépassée", () => {
    expect(isExpired({ id: 1, status: "publiee", expiresAt: past })).toBe(true);
  });
  it("live = publiée et non expirée", () => {
    expect(isLive({ id: 1, status: "publiee", expiresAt: future })).toBe(true);
    expect(isLive({ id: 1, status: "brouillon", expiresAt: future })).toBe(false);
    expect(isLive({ id: 1, status: "publiee", expiresAt: past })).toBe(false);
  });
});

describe("buildJobPostingJsonLd", () => {
  const jsonLd = buildJobPostingJsonLd(
    { id: 1, title: "Resource Geologist", contractType: "cdi", country: "SN", location: "Dakar", mission: "Estimation de ressources", publishedAt: "2026-09-01", expiresAt: future },
    "https://www.maximerit.com",
  );
  it("produit un JobPosting Schema.org valide", () => {
    expect(jsonLd["@type"]).toBe("JobPosting");
    expect(jsonLd.title).toBe("Resource Geologist");
    expect(jsonLd.employmentType).toBe("FULL_TIME");
    expect(jsonLd.validThrough).toBe(future);
    expect((jsonLd.hiringOrganization as { name: string }).name).toBe("Maximerit");
  });
  it("omet les clés vides", () => {
    const minimal = buildJobPostingJsonLd({ id: 2, title: "X" }, "https://x");
    expect("validThrough" in minimal).toBe(false);
  });
});
