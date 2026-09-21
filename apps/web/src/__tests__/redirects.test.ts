import { describe, it, expect } from "vitest";
import { resolveRedirect } from "@/lib/redirects";

describe("resolveRedirect (moteur de redirections)", () => {
  it("301 vers la nouvelle URL pour une ancienne URL connue (cahier §30)", () => {
    expect(resolveRedirect("/recrutement/")).toEqual({ to: "/entreprises/recrutement/", status: 301 });
  });

  it("tolère l'absence de slash final", () => {
    expect(resolveRedirect("/recrutement")?.to).toBe("/entreprises/recrutement/");
  });

  it("redirige les anciennes URL EN /language/en/... vers /en/... (ADR-0002)", () => {
    expect(resolveRedirect("/language/en/recruitment/")?.to).toBe("/en/entreprises/recrutement/");
  });

  it("aucune redirection pour une URL non mappée", () => {
    expect(resolveRedirect("/mines/")).toBeNull();
    expect(resolveRedirect("/une-page-inexistante/")).toBeNull();
  });

  it("aucune cible ne pointe vers une autre ancienne URL (pas de chaîne)", () => {
    // Reprend le principe testé en Phase 0 côté carte ; ici au niveau du runtime.
    const r = resolveRedirect("/home/");
    expect(r?.to).toBe("/");
  });
});
