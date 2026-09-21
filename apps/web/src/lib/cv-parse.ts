// Phase 5b — Parsing CV, pipeline interne (ADR-0004). Aucune donnée envoyée à un tiers.
// La proposition de fiche reste TOUJOURS éditable/validable par le recruteur (jamais appliquée en aveugle).

export interface ParsedCvProposal {
  name?: string;
  email?: string;
  phone?: string;
  currentPosition?: string;
  yearsExperience?: number;
  languages: { code: string; proficiency: string }[];
  commodities: string[];
  countries: string[];
  skills: string[];
  certifications: string[];
  education: string[];
  experiences: string[];
}

/** Extraction de texte brut depuis un buffer PDF ou DOCX (server-only). */
export async function extractText(buffer: Buffer, mime: string): Promise<string> {
  if (mime === "application/pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const res = await parser.getText();
    return res.text ?? "";
  }
  if (mime.includes("wordprocessingml")) {
    const mod = (await import("mammoth")) as unknown as {
      default?: { extractRawText: (o: { buffer: Buffer }) => Promise<{ value: string }> };
      extractRawText?: (o: { buffer: Buffer }) => Promise<{ value: string }>;
    };
    const extract = mod.extractRawText ?? mod.default?.extractRawText;
    if (!extract) return "";
    const res = await extract({ buffer });
    return res.value ?? "";
  }
  return "";
}

const LANGS: Record<string, RegExp> = {
  fr: /\b(fran[çc]ais|french)\b/i,
  en: /\b(anglais|english)\b/i,
  ar: /\b(arabe|arabic)\b/i,
  pt: /\b(portugais|portuguese)\b/i,
  es: /\b(espagnol|spanish)\b/i,
};
const COMMODITIES: Record<string, RegExp> = {
  gold: /\b(gold|\bor\b|aurif[èe]re)\b/i,
  bauxite: /\bbauxite\b/i,
  "iron-ore": /\b(iron ore|minerai de fer|\bfer\b)\b/i,
  phosphate: /\bphosphate\b/i,
  "mineral-sands": /\b(zircon|mineral sands|sables min[ée]ralis[ée]s)\b/i,
  manganese: /\b(manganese|mangan[èe]se)\b/i,
  diamond: /\b(diamond|diamant)\b/i,
  copper: /\b(copper|cuivre)\b/i,
  uranium: /\buranium\b/i,
  lithium: /\blithium\b/i,
};
const COUNTRIES: Record<string, RegExp> = {
  SN: /\bs[ée]n[ée]gal\b/i,
  GN: /\bguin[ée]e?\b|\bguinea\b/i,
  CI: /\b(c[ôo]te d['’ ]?ivoire|ivory coast)\b/i,
  ML: /\bmali\b/i,
  MR: /\b(mauritanie|mauritania)\b/i,
  BF: /\bburkina\b/i,
  GH: /\bghana\b/i,
};

function proficiencyNear(text: string, langRe: RegExp): string {
  const idx = text.search(langRe);
  if (idx < 0) return "professionnel";
  // Fenêtre en AVAL du mot-langue (le niveau suit généralement : « Anglais (courant) »),
  // pour ne pas capter le niveau d'une autre langue mentionnée avant.
  const window = text.slice(idx, idx + 35).toLowerCase();
  if (/natif|native|maternelle|mother/.test(window)) return "natif";
  if (/courant|fluent|bilingue|bilingual/.test(window)) return "courant";
  if (/interm[ée]diaire|intermediate/.test(window)) return "intermediaire";
  if (/notions|basic|d[ée]butant/.test(window)) return "notions";
  return "professionnel";
}

function sectionLines(text: string, headings: RegExp): string[] {
  const lines = text.split(/\r?\n/);
  const out: string[] = [];
  let capturing = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (headings.test(line)) { capturing = true; continue; }
    if (capturing) {
      if (line === "") { if (out.length) break; else continue; }
      // Nouvelle section (titre court en gras/majuscules) → stop
      if (/^[A-ZÀ-Ÿ][A-ZÀ-Ÿ &/]{2,}$/.test(line) && line.length < 30) break;
      out.push(...line.split(/[;,]| • |•/).map((s) => s.trim()).filter(Boolean));
    }
  }
  return out;
}

/** Structuration heuristique du texte en proposition de fiche (déterministe, testable). */
export function structureCv(text: string): ParsedCvProposal {
  const cleaned = text.replace(/ /g, " ");
  const lines = cleaned.split(/\r?\n/).map((l) => l.trim());
  const nonEmpty = lines.filter(Boolean);

  const email = cleaned.match(/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/)?.[0];
  const phone = cleaned.match(/\+?\d[\d ().-]{7,}\d/)?.[0]?.replace(/\s+/g, " ").trim();

  const languages = Object.entries(LANGS)
    .filter(([, re]) => re.test(cleaned))
    .map(([code, re]) => ({ code, proficiency: proficiencyNear(cleaned, re) }));

  const commodities = Object.entries(COMMODITIES).filter(([, re]) => re.test(cleaned)).map(([k]) => k);
  const countries = Object.entries(COUNTRIES).filter(([, re]) => re.test(cleaned)).map(([k]) => k);

  const yearsMatch = cleaned.match(/(\d{1,2})\s*\+?\s*(?:ans|years|an d'|ans d')/i);
  const yearsExperience = yearsMatch ? Number(yearsMatch[1]) : undefined;

  // Nom : première ligne "nom propre" (2-4 mots alphabétiques, sans chiffre ni @)
  const name = nonEmpty.find((l) => /^[A-ZÀ-Ÿ][\p{L}'-]+(?:\s+[A-ZÀ-Ÿ][\p{L}'-]+){1,3}$/u.test(l) && !/@|\d/.test(l));

  // Poste courant : ligne contenant un intitulé métier connu
  const JOB_RE = /(g[ée]ologue|geologist|ing[ée]nieur|engineer|manager|directeur|director|controller|cfo|hse|metallurg)/i;
  const currentPosition = nonEmpty.find((l) => JOB_RE.test(l) && l !== name);

  const skills = sectionLines(cleaned, /^(comp[ée]tences|skills)\b/i);
  const certifications = sectionLines(cleaned, /^(certifications?)\b/i);
  const education = sectionLines(cleaned, /^(formation|education|dipl[ôo]mes?)\b/i);
  const experiences = nonEmpty.filter((l) => /\b(19|20)\d{2}\b\s*[-–—à]|present|présent|actuel/i.test(l)).slice(0, 20);

  return { name, email, phone, currentPosition, yearsExperience, languages, commodities, countries, skills, certifications, education, experiences };
}

export async function parseCvBuffer(buffer: Buffer, mime: string): Promise<ParsedCvProposal> {
  return structureCv(await extractText(buffer, mime));
}
