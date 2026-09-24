// Pages pays Mining (SEO niveau 4). Chaque pays porte une valeur locale spécifique
// (commodities réelles + contexte marché) — pas de génération quasi-dupliquée (cahier §7).

export interface MiningCountry {
  code: string;
  slug: string;
  label: string;
  commodities: string[];
  context: string;
}

export const MINING_COUNTRIES: MiningCountry[] = [
  {
    code: "SN", slug: "senegal", label: "Sénégal",
    commodities: ["Or", "Zircon / sables minéralisés", "Phosphates"],
    context: "Marché initial de Maximerit : mines d'or de l'est, sables minéralisés et phosphates, avec un écosystème de services en structuration.",
  },
  {
    code: "GN", slug: "guinee", label: "Guinée",
    commodities: ["Bauxite", "Fer", "Or"],
    context: "Premier réservoir mondial de bauxite et grands projets de fer : de forts besoins en géologie, exploitation et encadrement expatrié/local.",
  },
  {
    code: "CI", slug: "cote-d-ivoire", label: "Côte d'Ivoire",
    commodities: ["Or", "Manganèse"],
    context: "Production aurifère en croissance et exploration active — un besoin montant de profils miniers qualifiés.",
  },
  {
    code: "ML", slug: "mali", label: "Mali",
    commodities: ["Or"],
    context: "L'un des premiers producteurs d'or d'Afrique : géologues, ingénieurs et fonctions support expérimentés recherchés.",
  },
  {
    code: "MR", slug: "mauritanie", label: "Mauritanie",
    commodities: ["Fer", "Or", "Cuivre"],
    context: "Fer historique et or : opérations en milieu désertique nécessitant expérience FIFO/roster et mobilité.",
  },
  {
    code: "BF", slug: "burkina-faso", label: "Burkina Faso",
    commodities: ["Or", "Zinc", "Manganèse"],
    context: "Bassin aurifère majeur de la sous-région, avec des enjeux d'exploitation, de sécurité et de leadership local.",
  },
  {
    code: "GH", slug: "ghana", label: "Ghana",
    commodities: ["Or", "Manganèse", "Bauxite"],
    context: "Premier producteur d'or d'Afrique : un marché mature, exigeant sur les compétences techniques et le management.",
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
