// Données de démonstration du job board (développement / recette uniquement — jamais en production).
// Usage : pnpm --filter web seed:demo  (commande `payload seed-demo`, déclarée dans `bin` de payload.config.ts)
// Idempotent : chaque offre est créée ou mise à jour par son slug ; contenus FR + EN (champs localisés).

import { getPayload, type SanitizedConfig } from "payload";

const DAY = 864e5;
const ago = (d: number) => new Date(Date.now() - d * DAY).toISOString();
const inDays = (d: number) => new Date(Date.now() + d * DAY).toISOString();

import type { Job } from "../src/payload-types";

type Contract = NonNullable<Job["contractType"]>;
type Country = NonNullable<Job["country"]>;
type Discipline = NonNullable<Job["discipline"]>;

interface Demo {
  slug: string;
  country: Country;
  location: string;
  discipline: Discipline;
  specialty: string;
  contractType: Contract;
  experienceMin: number;
  postedDaysAgo: number;
  fr: { title: string; mission: string; responsibilities: string; requirements: string };
  en: { title: string; mission: string; responsibilities: string; requirements: string };
}

const DEMO: Demo[] = [
  {
    slug: "geologue-exploration-senior-kedougou",
    country: "SN", location: "Kédougou", discipline: "geologie-exploration", specialty: "senior-geologist",
    contractType: "cdi", experienceMin: 8, postedDaysAgo: 2,
    fr: {
      title: "Géologue d'exploration senior",
      mission: "Au sein d'un producteur aurifère de l'est du Sénégal, vous pilotez les campagnes d'exploration greenfield et brownfield et contribuez à la croissance des ressources.",
      responsibilities: "Concevoir et superviser les campagnes de forage RC et carotté\nInterpréter les données géologiques, géochimiques et géophysiques\nEncadrer une équipe de géologues juniors et de techniciens\nGarantir la qualité des données (QA/QC) et la conformité HSE",
      requirements: "Diplôme d'ingénieur ou master en géologie\n8 ans d'expérience minimum en exploration aurifère, idéalement en Afrique de l'Ouest\nMaîtrise de Leapfrog et Micromine\nFrançais courant, anglais professionnel",
    },
    en: {
      title: "Senior Exploration Geologist",
      mission: "Join a gold producer in eastern Senegal to lead greenfield and brownfield exploration campaigns and drive resource growth.",
      responsibilities: "Design and supervise RC and diamond drilling campaigns\nInterpret geological, geochemical and geophysical data\nLead a team of junior geologists and technicians\nEnsure data quality (QA/QC) and HSE compliance",
      requirements: "Engineering degree or MSc in geology\n8+ years in gold exploration, ideally in West Africa\nProficient in Leapfrog and Micromine\nFluent French, professional English",
    },
  },
  {
    slug: "resource-geologist-boke",
    country: "GN", location: "Boké", discipline: "geologie-exploration", specialty: "resource-geologist",
    contractType: "fifo-roster", experienceMin: 5, postedDaysAgo: 6,
    fr: {
      title: "Resource Geologist — bauxite",
      mission: "Pour un opérateur bauxitier majeur, vous êtes responsable de l'estimation et du reporting des ressources conformément au code JORC.",
      responsibilities: "Construire et mettre à jour les modèles de blocs\nConduire l'estimation des ressources et la classification JORC\nCollaborer avec la planification minière sur la réconciliation\nPréparer les rapports trimestriels de ressources",
      requirements: "5 ans d'expérience en estimation de ressources\nExpérience bauxite ou latérite appréciée\nMaîtrise de Datamine ou Vulcan\nDisponibilité pour un roster 4/2",
    },
    en: {
      title: "Resource Geologist — Bauxite",
      mission: "For a major bauxite operator, you own resource estimation and reporting in line with the JORC Code.",
      responsibilities: "Build and maintain block models\nRun resource estimation and JORC classification\nWork with mine planning on reconciliation\nPrepare quarterly resource reports",
      requirements: "5+ years in resource estimation\nBauxite or laterite experience a plus\nProficient in Datamine or Vulcan\nAvailable for a 4/2 roster",
    },
  },
  {
    slug: "mine-planning-engineer-sabodala",
    country: "SN", location: "Sabodala", discipline: "exploitation-operations", specialty: "mine-planning-engineer",
    contractType: "cdi", experienceMin: 5, postedDaysAgo: 1,
    fr: {
      title: "Ingénieur planification minière",
      mission: "Vous élaborez les plans miniers court et moyen terme d'une mine à ciel ouvert et optimisez la séquence d'extraction.",
      responsibilities: "Établir les plans hebdomadaires, mensuels et trimestriels\nOptimiser la conception des fosses et des haldes\nSuivre la réconciliation plan / réalisé\nCoordonner avec la géologie et la maintenance",
      requirements: "Ingénieur des mines\n5 ans d'expérience en planification à ciel ouvert\nMaîtrise de Deswik ou Whittle\nEsprit d'analyse et rigueur",
    },
    en: {
      title: "Mine Planning Engineer",
      mission: "You build short- and medium-term mine plans for an open-pit operation and optimise the extraction sequence.",
      responsibilities: "Produce weekly, monthly and quarterly plans\nOptimise pit and waste-dump design\nTrack plan-versus-actual reconciliation\nCoordinate with geology and maintenance",
      requirements: "Mining engineering degree\n5+ years in open-pit planning\nProficient in Deswik or Whittle\nAnalytical and rigorous",
    },
  },
  {
    slug: "maintenance-manager-siguiri",
    country: "GN", location: "Siguiri", discipline: "exploitation-operations", specialty: "maintenance-manager",
    contractType: "fifo-roster", experienceMin: 10, postedDaysAgo: 12,
    fr: {
      title: "Maintenance Manager — flotte minière",
      mission: "Vous dirigez la maintenance de la flotte mobile et des installations fixes d'une mine d'or en production.",
      responsibilities: "Piloter la disponibilité et la fiabilité des équipements\nManager une équipe de 80 techniciens\nGérer le budget de maintenance et les contrats fournisseurs\nDéployer la maintenance préventive et prédictive",
      requirements: "10 ans d'expérience en maintenance minière, dont 5 en management\nConnaissance des flottes CAT / Komatsu\nMaîtrise d'un GMAO (SAP PM ou équivalent)\nLeadership terrain",
    },
    en: {
      title: "Maintenance Manager — Mining Fleet",
      mission: "You lead maintenance of the mobile fleet and fixed plant at a producing gold mine.",
      responsibilities: "Drive equipment availability and reliability\nManage a team of 80 technicians\nOwn the maintenance budget and supplier contracts\nRoll out preventive and predictive maintenance",
      requirements: "10+ years in mining maintenance, including 5 in management\nKnowledge of CAT / Komatsu fleets\nCMMS proficiency (SAP PM or equivalent)\nHands-on leadership",
    },
  },
  {
    slug: "metallurgiste-usine-cil-mali",
    country: "ML", location: "Sadiola", discipline: "exploitation-operations", specialty: "metallurgist",
    contractType: "cdd", experienceMin: 4, postedDaysAgo: 18,
    fr: {
      title: "Métallurgiste procédé — usine CIL",
      mission: "Vous optimisez les performances de l'usine de traitement CIL et le taux de récupération de l'or.",
      responsibilities: "Suivre les indicateurs de l'usine et la récupération\nConduire les essais métallurgiques\nProposer des améliorations de procédé\nAssurer le reporting de production",
      requirements: "Ingénieur procédés ou métallurgiste\n4 ans d'expérience en usine CIL / CIP\nBonne maîtrise des bilans matière\nFrançais courant",
    },
    en: {
      title: "Process Metallurgist — CIL Plant",
      mission: "You optimise CIL processing plant performance and gold recovery.",
      responsibilities: "Track plant KPIs and recovery\nRun metallurgical test work\nPropose process improvements\nOwn production reporting",
      requirements: "Process or metallurgical engineer\n4+ years in a CIL / CIP plant\nStrong mass-balance skills\nFluent French",
    },
  },
  {
    slug: "controleur-de-gestion-minier-abidjan",
    country: "CI", location: "Abidjan", discipline: "finance-miniere", specialty: "cost-controller-mining",
    contractType: "cdi", experienceMin: 5, postedDaysAgo: 4,
    fr: {
      title: "Contrôleur de gestion minier",
      mission: "Rattaché au Finance Manager, vous pilotez le contrôle des coûts d'un projet minier en phase de construction.",
      responsibilities: "Construire et suivre le budget et les forecasts\nAnalyser les écarts et les coûts unitaires\nProduire le reporting mensuel au groupe\nAccompagner les opérations dans le pilotage de la performance",
      requirements: "Master en finance ou contrôle de gestion\n5 ans d'expérience, idéalement dans les mines ou l'industrie lourde\nExcellente maîtrise d'Excel et d'un ERP\nAnglais professionnel",
    },
    en: {
      title: "Mining Cost Controller",
      mission: "Reporting to the Finance Manager, you lead cost control on a mining project in its construction phase.",
      responsibilities: "Build and track budget and forecasts\nAnalyse variances and unit costs\nProduce monthly group reporting\nSupport operations in performance management",
      requirements: "MSc in finance or management control\n5+ years, ideally in mining or heavy industry\nAdvanced Excel and ERP skills\nProfessional English",
    },
  },
  {
    slug: "cfo-mining-dakar",
    country: "SN", location: "Dakar", discipline: "finance-miniere", specialty: "cfo-mining",
    contractType: "cdi", experienceMin: 15, postedDaysAgo: 9,
    fr: {
      title: "Directeur administratif et financier (CFO) — mines",
      mission: "Membre du comité de direction, vous structurez la fonction finance d'un groupe minier en forte croissance.",
      responsibilities: "Définir la stratégie financière et le financement de projets\nSuperviser la comptabilité, la fiscalité et la trésorerie\nPiloter les relations avec les banques et les investisseurs\nEncadrer une équipe de 15 personnes",
      requirements: "15 ans d'expérience dont 5 en tant que CFO ou DAF\nExpérience du financement de projets miniers\nConnaissance des normes IFRS et OHADA\nBilingue français / anglais",
    },
    en: {
      title: "Chief Financial Officer — Mining",
      mission: "As a member of the executive committee, you build the finance function of a fast-growing mining group.",
      responsibilities: "Set financial strategy and project financing\nOversee accounting, tax and treasury\nManage bank and investor relations\nLead a team of 15",
      requirements: "15+ years including 5 as CFO\nMining project-finance experience\nIFRS and OHADA knowledge\nBilingual French / English",
    },
  },
  {
    slug: "country-manager-mauritanie",
    country: "MR", location: "Nouakchott", discipline: "leadership-executive-search", specialty: "country-manager",
    contractType: "cdi", experienceMin: 12, postedDaysAgo: 3,
    fr: {
      title: "Country Manager — Mauritanie",
      mission: "Vous représentez un groupe minier international en Mauritanie et pilotez l'ensemble de ses activités dans le pays.",
      responsibilities: "Porter la relation avec les autorités et les parties prenantes\nGarantir la licence sociale d'opérer et la conformité\nPiloter le P&L local et les équipes support\nAccompagner le développement de nouveaux projets",
      requirements: "12 ans d'expérience, dont une expérience de direction pays\nConnaissance du secteur extractif et du contexte réglementaire\nSens politique et diplomatique\nArabe apprécié",
    },
    en: {
      title: "Country Manager — Mauritania",
      mission: "You represent an international mining group in Mauritania and lead all of its in-country activities.",
      responsibilities: "Own relationships with authorities and stakeholders\nSecure the social licence to operate and compliance\nManage the local P&L and support teams\nSupport the development of new projects",
      requirements: "12+ years, including country leadership\nKnowledge of the extractive sector and regulatory context\nPolitical and diplomatic acumen\nArabic a plus",
    },
  },
  {
    slug: "drill-and-blast-engineer-burkina",
    country: "BF", location: "Houndé", discipline: "exploitation-operations", specialty: "drill-and-blast",
    contractType: "mission-interim", experienceMin: 3, postedDaysAgo: 25,
    fr: {
      title: "Ingénieur forage & tir",
      mission: "Mission de 6 mois sur une mine d'or à ciel ouvert : vous optimisez les plans de tir et la fragmentation.",
      responsibilities: "Concevoir les plans de forage et de tir\nSuivre la fragmentation et la dilution\nGarantir la sécurité des opérations de tir\nFormer les équipes de boutefeux",
      requirements: "Ingénieur des mines\n3 ans d'expérience en forage & tir\nCertification boutefeu appréciée\nDisponibilité immédiate",
    },
    en: {
      title: "Drill & Blast Engineer",
      mission: "6-month assignment at an open-pit gold mine: you optimise blast design and fragmentation.",
      responsibilities: "Design drill and blast patterns\nTrack fragmentation and dilution\nEnsure blasting safety\nTrain shot-firer crews",
      requirements: "Mining engineering degree\n3+ years in drill & blast\nShot-firer certification a plus\nImmediately available",
    },
  },
];

export async function script(config: SanitizedConfig) {
  const payload = await getPayload({ config });
  let created = 0;
  let updated = 0;

  for (const d of DEMO) {
    const base = {
      slug: d.slug,
      country: d.country,
      location: d.location,
      sector: "mines-ressources-naturelles" as const,
      discipline: d.discipline,
      specialty: d.specialty,
      contractType: d.contractType,
      experienceMin: d.experienceMin,
      status: "publiee" as const,
      publishedAt: ago(d.postedDaysAgo),
      expiresAt: inDays(60 - d.postedDaysAgo),
    };
    const existing = await payload.find({ collection: "jobs", where: { slug: { equals: d.slug } }, limit: 1, depth: 0 });
    const id = existing.docs[0]?.id;
    const doc = id
      ? await payload.update({ collection: "jobs", id, data: { ...base, ...d.fr }, locale: "fr" })
      : await payload.create({ collection: "jobs", data: { ...base, ...d.fr }, locale: "fr" });
    await payload.update({ collection: "jobs", id: doc.id, data: d.en, locale: "en" });
    if (id) updated++;
    else created++;
  }

  payload.logger.info(`Offres de démo : ${created} créées, ${updated} mises à jour.`);
  await payload.destroy();
}
