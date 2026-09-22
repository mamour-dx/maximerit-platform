// Contenu structuré des pages Entreprises (services) et Secteurs — pilote les routes dynamiques.
// Contenu concis et éditable ; la version longue se gère ensuite dans le CMS (collection Pages).

export interface ServiceContent {
  slug: string;
  title: string;
  intro: string;
  bullets: string[];
}

export const SERVICES: ServiceContent[] = [
  {
    slug: "recrutement",
    title: "Recrutement",
    intro: "Nous identifions et qualifions les profils rares dont vos opérations ont besoin, en Afrique de l'Ouest.",
    bullets: ["Sourcing ciblé et vivier propriétaire", "Qualification approfondie des candidats", "Short-list rapide et pertinente", "Suivi jusqu'au placement"],
  },
  {
    slug: "executive-search",
    title: "Executive Search",
    intro: "Recherche de cadres dirigeants et de fonctions critiques : Country Manager, General Manager, Operations Director, CFO.",
    bullets: ["Approche directe et confidentielle", "Cartographie du marché des dirigeants", "Évaluation des compétences de leadership", "Accompagnement de la prise de poste"],
  },
  {
    slug: "interim",
    title: "Intérim & mise à disposition",
    intro: "Renforcez rapidement une opération avec des profils qualifiés, en mise à disposition ou en mission.",
    bullets: ["Réactivité sur les besoins urgents", "Profils opérationnels immédiatement mobilisables", "Gestion administrative simplifiée", "Formats FIFO / roster possibles"],
  },
  {
    slug: "externalisation-rh-paie",
    title: "Externalisation RH & Paie",
    intro: "Déléguez la gestion RH et la paie pour vous concentrer sur votre cœur d'activité.",
    bullets: ["Gestion de la paie et des déclarations", "Administration du personnel", "Suivi RH et conformité", "Reporting régulier"],
  },
  {
    slug: "finance-performance",
    title: "Finance & Performance",
    intro: "Renforcez vos fonctions finance et pilotage de la performance sur vos projets et opérations.",
    bullets: ["Contrôle de gestion et cost control", "Reporting et indicateurs de performance", "Structuration financière de projet", "Profils CFO, Finance Manager, Cost Controller"],
  },
  {
    slug: "qhse-esg",
    title: "QHSE & ESG",
    intro: "Structurez vos démarches Qualité, Hygiène, Sécurité, Environnement et vos engagements ESG.",
    bullets: ["Mise en place de politiques QHSE", "Profils HSE Manager et experts", "Études d'impact environnemental et social", "Accompagnement ESG"],
  },
  {
    slug: "formation",
    title: "Formation",
    intro: "Développez les compétences de vos équipes avec des formations adaptées à vos métiers.",
    bullets: ["Formations métiers et fonctions support", "QHSE, finance, RH, management", "Programmes sur mesure", "Ancrage terrain Afrique de l'Ouest"],
  },
];

export interface SectorContent {
  slug: string;
  title: string;
  intro: string;
}

export const SECTORS: SectorContent[] = [
  { slug: "energie", title: "Énergie", intro: "Recrutement et compétences pour les projets énergétiques en Afrique de l'Ouest." },
  { slug: "petrole-gaz", title: "Pétrole & Gaz", intro: "Profils techniques et de direction pour le secteur pétrole & gaz." },
  { slug: "btp-infrastructures", title: "BTP & Infrastructures", intro: "Talents pour les grands projets de construction et d'infrastructures." },
  { slug: "industrie", title: "Industrie", intro: "Compétences industrielles : production, maintenance, qualité." },
  { slug: "services", title: "Services", intro: "Fonctions support et services aux entreprises et aux grands projets." },
];

export const getService = (slug: string) => SERVICES.find((s) => s.slug === slug) ?? null;
export const getSector = (slug: string) => SECTORS.find((s) => s.slug === slug) ?? null;
