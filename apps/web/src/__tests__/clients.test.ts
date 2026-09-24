import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { CLIENT_LOGOS } from "@/lib/clients";

const PUBLIC_CLIENTS = path.resolve(__dirname, "../../public/clients") + path.sep;

describe("logos clients (« Ils nous font confiance »)", () => {
  it("chaque logo référencé existe dans public/clients", () => {
    for (const c of CLIENT_LOGOS) {
      expect(existsSync(`${PUBLIC_CLIENTS}${c.slug}.png`), `${c.slug}.png manquant`).toBe(true);
    }
  });

  it("slugs uniques, nom (alt) et dimensions renseignés", () => {
    expect(new Set(CLIENT_LOGOS.map((c) => c.slug)).size).toBe(CLIENT_LOGOS.length);
    for (const c of CLIENT_LOGOS) {
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.width).toBeGreaterThan(0);
      expect(c.height).toBeGreaterThan(0);
      expect(c.h).toBeGreaterThan(0);
    }
  });
});
