// Contenu structuré des pages Entreprises (services) et Secteurs — pilote les routes dynamiques.
// Contenu concis et éditable ; la version longue se gère ensuite dans le CMS (collection Pages).

export interface ServiceContent {
  slug: string;
  title: string;
  intro: string;
  bullets: string[];
  titleEn: string;
  introEn: string;
  bulletsEn: string[];
}

export const SERVICES: ServiceContent[] = [
  {
    slug: "recrutement",
    title: "Recrutement",
    intro: "Nous identifions et qualifions les profils rares dont vos opérations ont besoin, en Afrique de l'Ouest.",
    bullets: ["Sourcing ciblé et vivier propriétaire", "Qualification approfondie des candidats", "Short-list rapide et pertinente", "Suivi jusqu'au placement"],
    titleEn: "Recruitment",
    introEn: "We identify and qualify the rare profiles your operations need, across West Africa.",
    bulletsEn: ["Targeted sourcing and proprietary talent pool", "In-depth candidate qualification", "A fast, relevant short-list", "Support through to placement"],
  },
  {
    slug: "executive-search",
    title: "Executive Search",
    intro: "Recherche de cadres dirigeants et de fonctions critiques : Country Manager, General Manager, Operations Director, CFO.",
    bullets: ["Approche directe et confidentielle", "Cartographie du marché des dirigeants", "Évaluation des compétences de leadership", "Accompagnement de la prise de poste"],
    titleEn: "Executive Search",
    introEn: "Search for senior executives and critical functions: Country Manager, General Manager, Operations Director, CFO.",
    bulletsEn: ["Direct and confidential approach", "Mapping of the executive market", "Leadership assessment", "Onboarding support"],
  },
  {
    slug: "interim",
    title: "Intérim & mise à disposition",
    intro: "Renforcez rapidement une opération avec des profils qualifiés, en mise à disposition ou en mission.",
    bullets: ["Réactivité sur les besoins urgents", "Profils opérationnels immédiatement mobilisables", "Gestion administrative simplifiée", "Formats FIFO / roster possibles"],
    titleEn: "Contract staffing & secondment",
    introEn: "Strengthen an operation quickly with qualified profiles, on secondment or assignment.",
    bulletsEn: ["Responsiveness on urgent needs", "Operational profiles ready to mobilise", "Simplified administrative handling", "FIFO / roster formats available"],
  },
  {
    slug: "externalisation-rh-paie",
    title: "Externalisation RH & Paie",
    intro: "Déléguez la gestion RH et la paie pour vous concentrer sur votre cœur d'activité.",
    bullets: ["Gestion de la paie et des déclarations", "Administration du personnel", "Suivi RH et conformité", "Reporting régulier"],
    titleEn: "HR & Payroll outsourcing",
    introEn: "Delegate HR and payroll management so you can focus on your core business.",
    bulletsEn: ["Payroll and statutory filings", "Personnel administration", "HR follow-up and compliance", "Regular reporting"],
  },
  {
    slug: "finance-performance",
    title: "Finance & Performance",
    intro: "Renforcez vos fonctions finance et pilotage de la performance sur vos projets et opérations.",
    bullets: ["Contrôle de gestion et cost control", "Reporting et indicateurs de performance", "Structuration financière de projet", "Profils CFO, Finance Manager, Cost Controller"],
    titleEn: "Finance & Performance",
    introEn: "Strengthen your finance and performance-management functions across projects and operations.",
    bulletsEn: ["Management control and cost control", "Reporting and performance indicators", "Project financial structuring", "CFO, Finance Manager, Cost Controller profiles"],
  },
  {
    slug: "qhse-esg",
    title: "QHSE & ESG",
    intro: "Structurez vos démarches Qualité, Hygiène, Sécurité, Environnement et vos engagements ESG.",
    bullets: ["Mise en place de politiques QHSE", "Profils HSE Manager et experts", "Études d'impact environnemental et social", "Accompagnement ESG"],
    titleEn: "QHSE & ESG",
    introEn: "Structure your Quality, Health, Safety, Environment practices and your ESG commitments.",
    bulletsEn: ["QHSE policy implementation", "HSE Manager and expert profiles", "Environmental and social impact studies", "ESG support"],
  },
  {
    slug: "formation",
    title: "Formation",
    intro: "Développez les compétences de vos équipes avec des formations adaptées à vos métiers.",
    bullets: ["Formations métiers et fonctions support", "QHSE, finance, RH, management", "Programmes sur mesure", "Ancrage terrain Afrique de l'Ouest"],
    titleEn: "Training",
    introEn: "Grow your teams' skills with training tailored to your operations.",
    bulletsEn: ["Trade and support-function training", "QHSE, finance, HR, management", "Bespoke programmes", "Grounded in West Africa field reality"],
  },
];

export interface SectorContent {
  slug: string;
  title: string;
  intro: string;
  titleEn: string;
  introEn: string;
}

export const SECTORS: SectorContent[] = [
  { slug: "energie", title: "Énergie", intro: "Recrutement et compétences pour les projets énergétiques en Afrique de l'Ouest.", titleEn: "Energy", introEn: "Recruitment and skills for energy projects across West Africa." },
  { slug: "petrole-gaz", title: "Pétrole & Gaz", intro: "Profils techniques et de direction pour le secteur pétrole & gaz.", titleEn: "Oil & Gas", introEn: "Technical and leadership profiles for the oil & gas sector." },
  { slug: "btp-infrastructures", title: "BTP & Infrastructures", intro: "Talents pour les grands projets de construction et d'infrastructures.", titleEn: "Construction & Infrastructure", introEn: "Talent for major construction and infrastructure projects." },
  { slug: "industrie", title: "Industrie", intro: "Compétences industrielles : production, maintenance, qualité.", titleEn: "Industry", introEn: "Industrial skills: production, maintenance, quality." },
  { slug: "services", title: "Services", intro: "Fonctions support et services aux entreprises et aux grands projets.", titleEn: "Services", introEn: "Support functions and services for companies and major projects." },
];

export const getService = (slug: string) => SERVICES.find((s) => s.slug === slug) ?? null;
export const getSector = (slug: string) => SECTORS.find((s) => s.slug === slug) ?? null;
