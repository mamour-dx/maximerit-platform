import { mining, type MiningDiscipline, type MiningSpecialty } from "@maximerit/domain";

// Navigation du silo Mining depuis la taxonomie (@maximerit/domain). Pur, testable.

/** Segment d'URL d'une discipline (ex. "/mines/geologie-exploration/" → "geologie-exploration"). */
export const disciplineSeg = (url: string) => url.replace(/^\/mines\//, "").replace(/\/$/, "");

export function disciplineParams() {
  return mining.disciplines.map((d) => ({ discipline: disciplineSeg(d.url) }));
}

export function findDiscipline(segment: string): MiningDiscipline | null {
  return mining.disciplines.find((d) => disciplineSeg(d.url) === segment) ?? null;
}

export function specialtyParams() {
  return mining.disciplines.flatMap((d) => d.specialties.map((s) => ({ slug: s.slug })));
}

export function findSpecialty(slug: string): { specialty: MiningSpecialty; discipline: MiningDiscipline } | null {
  for (const d of mining.disciplines) {
    const s = d.specialties.find((x) => x.slug === slug);
    if (s) return { specialty: s, discipline: d };
  }
  return null;
}

/**
 * Métiers affichés pour un pôle : ses métiers propres + les métiers transverses rattachés par `crossRefs`
 * (ex. Directeur financier, fiche canonique en Finance, également listé en Leadership). Pas de doublon de fiche :
 * un renvoi pointe vers la fiche canonique ; les compteurs globaux restent sur `specialties` (métiers uniques).
 */
export function disciplineRoles(d: MiningDiscipline): MiningSpecialty[] {
  const refs = (d.crossRefs ?? [])
    .map((slug) => findSpecialty(slug)?.specialty)
    .filter((s): s is MiningSpecialty => !!s && !d.specialties.some((own) => own.slug === s.slug));
  return [...d.specialties, ...refs];
}

/** Tous les chemins indexables du silo Mining (disciplines + fiches métiers) — pour le sitemap. */
export function miningIndexablePaths(): string[] {
  const paths = ["/mines/metiers/"];
  for (const d of mining.disciplines) {
    paths.push(d.url);
    for (const s of d.specialties) paths.push(`/mines/metiers/${s.slug}/`);
  }
  return paths;
}
