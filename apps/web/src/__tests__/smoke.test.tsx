import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { mining, matchesCandidate } from "@maximerit/domain";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/states";

describe("intégration app ↔ @maximerit/domain", () => {
  it("expose la taxonomie Mining (4 pôles)", () => {
    expect(mining.disciplines).toHaveLength(4);
  });

  it("réutilise le moteur de recherche du domaine (Phase 1)", () => {
    const c = { yearsExperience: 9, mining: { commodities: ["gold"] } };
    expect(matchesCandidate(c, { minYearsExperience: 8, commodities: ["gold"] })).toBe(true);
    expect(matchesCandidate(c, { minYearsExperience: 12 })).toBe(false);
  });
});

describe("design system Maximerit", () => {
  it("rend un bouton accessible", () => {
    render(<Button>Envoyer</Button>);
    expect(screen.getByRole("button", { name: "Envoyer" })).toBeInTheDocument();
  });

  it("rend l'état vide avec un titre", () => {
    render(<EmptyState title="Aucun résultat" />);
    expect(screen.getByText("Aucun résultat")).toBeInTheDocument();
  });
});
