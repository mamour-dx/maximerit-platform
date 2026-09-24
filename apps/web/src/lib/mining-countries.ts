// Pages pays Mining (SEO niveau 4). Chaque pays porte une valeur locale spécifique
// (commodities réelles + contexte marché) — pas de génération quasi-dupliquée (cahier §7).

export interface MiningCountry {
  code: string;
  slug: string;
  label: string;
  commodities: string[];
  context: string;
  labelEn: string;
  commoditiesEn: string[];
  contextEn: string;
}

export const MINING_COUNTRIES: MiningCountry[] = [
  {
    code: "SN", slug: "senegal", label: "Sénégal",
    commodities: ["Or", "Zircon / sables minéralisés", "Phosphates"],
    context: "Marché initial de Maximerit : mines d'or de l'est, sables minéralisés et phosphates, avec un écosystème de services en structuration.",
    labelEn: "Senegal", commoditiesEn: ["Gold", "Zircon / mineral sands", "Phosphates"],
    contextEn: "Maximerit's home market: eastern gold mines, mineral sands and phosphates, with a services ecosystem taking shape.",
  },
  {
    code: "GN", slug: "guinee", label: "Guinée",
    commodities: ["Bauxite", "Fer", "Or"],
    context: "Premier réservoir mondial de bauxite et grands projets de fer : de forts besoins en géologie, exploitation et encadrement expatrié/local.",
    labelEn: "Guinea", commoditiesEn: ["Bauxite", "Iron ore", "Gold"],
    contextEn: "World's largest bauxite reserves and major iron-ore projects: strong demand for geology, operations and expatriate/local leadership.",
  },
  {
    code: "CI", slug: "cote-d-ivoire", label: "Côte d'Ivoire",
    commodities: ["Or", "Manganèse"],
    context: "Production aurifère en croissance et exploration active — un besoin montant de profils miniers qualifiés.",
    labelEn: "Ivory Coast", commoditiesEn: ["Gold", "Manganese"],
    contextEn: "Growing gold output and active exploration — rising demand for qualified mining profiles.",
  },
  {
    code: "ML", slug: "mali", label: "Mali",
    commodities: ["Or"],
    context: "L'un des premiers producteurs d'or d'Afrique : géologues, ingénieurs et fonctions support expérimentés recherchés.",
    labelEn: "Mali", commoditiesEn: ["Gold"],
    contextEn: "One of Africa's top gold producers: experienced geologists, engineers and support functions in demand.",
  },
  {
    code: "MR", slug: "mauritanie", label: "Mauritanie",
    commodities: ["Fer", "Or", "Cuivre"],
    context: "Fer historique et or : opérations en milieu désertique nécessitant expérience FIFO/roster et mobilité.",
    labelEn: "Mauritania", commoditiesEn: ["Iron ore", "Gold", "Copper"],
    contextEn: "Long-standing iron ore and gold: desert operations requiring FIFO/roster experience and mobility.",
  },
  {
    code: "BF", slug: "burkina-faso", label: "Burkina Faso",
    commodities: ["Or", "Zinc", "Manganèse"],
    context: "Bassin aurifère majeur de la sous-région, avec des enjeux d'exploitation, de sécurité et de leadership local.",
    labelEn: "Burkina Faso", commoditiesEn: ["Gold", "Zinc", "Manganese"],
    contextEn: "A major gold basin in the sub-region, with operations, security and local-leadership challenges.",
  },
  {
    code: "GH", slug: "ghana", label: "Ghana",
    commodities: ["Or", "Manganèse", "Bauxite"],
    context: "Premier producteur d'or d'Afrique : un marché mature, exigeant sur les compétences techniques et le management.",
    labelEn: "Ghana", commoditiesEn: ["Gold", "Manganese", "Bauxite"],
    contextEn: "Africa's leading gold producer: a mature market, demanding on technical skills and management.",
  },
];

export function countryParams() {
  return MINING_COUNTRIES.map((c) => ({ slug: c.slug }));
}

export function findCountry(slug: string): MiningCountry | null {
  return MINING_COUNTRIES.find((c) => c.slug === slug) ?? null;
}

export function countryPaths(): string[] {
  return MINING_COUNTRIES.map((c) => `/mines/${c.slug}/`);
}
