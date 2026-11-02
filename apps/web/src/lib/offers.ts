// Prestations détaillées des pages Entreprises — reprise du contenu de l'ancien site (WordPress), réécrit et
// rattaché au pôle de service correspondant. Chaque prestation a sa page /entreprises/<service>/<offre>/ (FR/EN)
// et reprend une ancienne URL (`legacy`, redirigée en 301 — cf. master-url-migration-file.csv).

export interface OfferContent {
  service: string; // slug du pôle parent (SERVICES)
  slug: string;
  legacy: string[]; // anciennes URL couvertes
  title: string;
  intro: string;
  body: string; // paragraphes séparés par une ligne vide
  bullets: string[];
  titleEn: string;
  introEn: string;
  bodyEn: string;
  bulletsEn: string[];
}

export const OFFERS: OfferContent[] = [
  // ───────────── Externalisation RH & Paie ─────────────
  {
    service: "externalisation-rh-paie",
    slug: "gestion-paie-declarations",
    legacy: ["/gestion-paie-et-des-declarations/"],
    title: "Gestion de la paie et des déclarations",
    intro: "Externalisez votre paie : bulletins, déclarations fiscales et sociales, écritures comptables — dans les délais et en conformité.",
    body: "De plus en plus d'entreprises externalisent leur paie pour alléger leur service RH et sécuriser un processus sensible. Maximerit prend en charge l'élaboration de vos paies et vous conseille en matière sociale.\n\nVous gagnez en fiabilité : respect du calendrier de paie, déclarations déposées dans les délais, application de la législation en vigueur — y compris lors de ses évolutions — et confidentialité des données.",
    bullets: [
      "Bulletins de salaire",
      "Déclarations fiscales",
      "Déclarations aux organismes sociaux",
      "Écritures comptables de paie, prêtes à intégrer dans votre système",
      "Conseil en droit social",
    ],
    titleEn: "Payroll and statutory filings",
    introEn: "Outsource your payroll: payslips, tax and social-security filings, accounting entries — on time and compliant.",
    bodyEn: "More and more companies outsource payroll to lighten their HR team and secure a sensitive process. Maximerit prepares your payroll and advises you on employment-law matters.\n\nYou gain reliability: payroll calendar respected, filings submitted on time, current legislation applied — including when it changes — and confidential data.",
    bulletsEn: [
      "Payslips",
      "Tax filings",
      "Social-security filings",
      "Payroll accounting entries, ready to import into your system",
      "Employment-law advice",
    ],
  },
  {
    service: "externalisation-rh-paie",
    slug: "suivi-rh",
    legacy: ["/suivi-rh/"],
    title: "Suivi RH et développement des compétences",
    intro: "Un package RH piloté par des praticiens expérimentés pour développer les compétences, maintenir la motivation et soutenir votre croissance.",
    body: "Nos objectifs : développer le niveau de compétences de vos collaborateurs, maintenir la motivation au sein de l'entreprise et soutenir sa croissance.\n\nNous aidons vos équipes et votre management à s'approprier les bilans de compétences et les tableaux de bord sociaux : choix des indicateurs pertinents (climat social, formation et développement des compétences), conception d'un bilan de compétences utile et utilisable, outils d'appui.\n\nLe dispositif est conduit par des praticiens RH comptant plus de 15 ans d'expérience.",
    bullets: [
      "Définition des postes et profils de poste",
      "Référentiel métiers & compétences",
      "Bilans de compétences et tableaux de bord sociaux",
      "Plans de formation pour faire progresser les équipes",
      "Gestion des carrières et actions de motivation",
    ],
    titleEn: "HR follow-up and skills development",
    introEn: "An HR package run by seasoned practitioners to grow skills, sustain motivation and support your growth.",
    bodyEn: "Our goals: raise your people's skill levels, sustain motivation across the company and support its growth.\n\nWe help your teams and managers take ownership of skills assessments and HR dashboards: choosing the right indicators (workplace climate, training and skills development), designing a skills assessment that is genuinely usable, and the supporting tools.\n\nThe programme is led by HR practitioners with more than 15 years of experience.",
    bulletsEn: [
      "Job definitions and role profiles",
      "Job & skills framework",
      "Skills assessments and HR dashboards",
      "Training plans to develop your teams",
      "Career management and motivation initiatives",
    ],
  },
  {
    service: "externalisation-rh-paie",
    slug: "conseil-rh",
    legacy: ["/conseils/conseils-en-rh/"],
    title: "Conseil en ressources humaines",
    intro: "Audit RH, classification des emplois, GPEC, climat social : des missions de conseil conçues selon vos besoins réels.",
    body: "Maximerit mobilise un large panel de compétences RH pour faire de votre structure un lieu où les talents veulent rester, en développant une culture d'entreprise qui tient compte des réalités socio-culturelles locales.\n\nChaque mission est cadrée avec vous et orientée résultat : un diagnostic clair, des recommandations concrètes et un accompagnement dans leur mise en œuvre.",
    bullets: [
      "Audit des ressources humaines",
      "Fiches de poste et classification des emplois",
      "Analyse et suivi de la gestion des carrières",
      "Outils de motivation du personnel",
      "Définition d'une politique de recrutement",
      "Enquêtes de climat social et plans d'action",
      "Gestion prévisionnelle des emplois et des compétences (GPEC)",
    ],
    titleEn: "HR consulting",
    introEn: "HR audit, job classification, workforce planning, workplace climate: consulting assignments designed around your real needs.",
    bodyEn: "Maximerit brings a broad range of HR expertise to make your organisation a place talent wants to stay, building a company culture that reflects local socio-cultural realities.\n\nEvery assignment is scoped with you and focused on results: a clear diagnosis, concrete recommendations and support putting them in place.",
    bulletsEn: [
      "HR audit",
      "Job descriptions and job classification",
      "Career management analysis and follow-up",
      "Staff motivation tools",
      "Recruitment policy design",
      "Workplace climate surveys and action plans",
      "Strategic workforce and skills planning",
    ],
  },
  {
    service: "externalisation-rh-paie",
    slug: "accueil-integration",
    legacy: ["/accueil-et-integration/"],
    title: "Accueil, intégration et relocation",
    intro: "Une intégration réussie pour vos collaborateurs expatriés : logistique de relocation, formalités administratives, services partenaires.",
    body: "Maximerit accompagne l'arrivée de vos collaborateurs expatriés en Afrique de l'Ouest. Nous prenons en charge les aspects logistiques de la relocation, les formalités administratives et la mise en relation avec nos services partenaires.\n\nLe service est personnalisé selon vos besoins, avec un objectif : des collaborateurs opérationnels rapidement, dans le respect des obligations légales.",
    bullets: [
      "Logistique de relocation",
      "Formalités administratives",
      "Mise en relation avec des services partenaires",
      "Accompagnement personnalisé à l'arrivée",
    ],
    titleEn: "Onboarding and relocation",
    introEn: "Successful onboarding for your expatriate staff: relocation logistics, administrative formalities, partner services.",
    bodyEn: "Maximerit supports the arrival of your expatriate staff in West Africa. We handle relocation logistics, administrative formalities and introductions to our partner services.\n\nThe service is tailored to your needs, with one goal: people who are operational quickly, in line with legal obligations.",
    bulletsEn: [
      "Relocation logistics",
      "Administrative formalities",
      "Introductions to partner services",
      "Personalised arrival support",
    ],
  },

  // ───────────── QHSE & ESG ─────────────
  {
    service: "qhse-esg",
    slug: "conseil-audit-qhse",
    legacy: ["/conseil-en-qhse/", "/audit-qhse/"],
    title: "Conseil, audit et certification QHSE",
    intro: "Audit QHSE, mise en conformité et accompagnement à la certification ISO 9001, 14001, 22000 et 45001.",
    body: "Pour préserver la santé et la sécurité au travail et répondre aux exigences QHSE, nos experts vous accompagnent dans le management de ces thématiques dans leur globalité.\n\nNotre mission : vous aider à appréhender les exigences réglementaires et normatives, suivre les évolutions du monde du travail, satisfaire les attentes des marchés — notamment sur les critères ESG — et réduire vos risques administratifs et juridiques. Une démarche qui vous prépare aussi aux contrôles inopinés des autorités.",
    bullets: [
      "Audit QHSE et diagnostic de conformité",
      "Accompagnement à la certification ISO 9001, ISO 14001, ISO 22000",
      "ISO 45001 (anciennement OHSAS 18001)",
      "Mise en place du système de management QHSE",
      "Préparation aux contrôles réglementaires",
    ],
    titleEn: "QHSE consulting, audit and certification",
    introEn: "QHSE audits, compliance and support towards ISO 9001, 14001, 22000 and 45001 certification.",
    bodyEn: "To protect health and safety at work and meet QHSE requirements, our experts support you in managing these topics end to end.\n\nOur mission: help you understand regulatory and normative requirements, keep pace with changes in the world of work, meet market expectations — especially on ESG criteria — and reduce administrative and legal risk. It also prepares you for unannounced inspections by the authorities.",
    bulletsEn: [
      "QHSE audit and compliance review",
      "Support towards ISO 9001, ISO 14001, ISO 22000 certification",
      "ISO 45001 (formerly OHSAS 18001)",
      "Setting up the QHSE management system",
      "Readiness for regulatory inspections",
    ],
  },
  {
    service: "qhse-esg",
    slug: "politique-qhse",
    legacy: ["/mise-en-place-dune-politique-qhse/"],
    title: "Mise en place d'une politique QHSE",
    intro: "Sensibilisation aux normes, définition de votre politique Qualité, Hygiène, Sécurité, Environnement et comité d'hygiène-sécurité.",
    body: "Une politique QHSE solide commence par l'appropriation des normes par vos équipes. Maximerit organise des campagnes d'information et de sensibilisation, puis vous accompagne dans la définition et le déploiement de votre politique QHSE.\n\nNous aidons également à structurer votre comité d'hygiène-sécurité et à renforcer les capacités de ses membres, et réalisons les audits QHSE de suivi.",
    bullets: [
      "Campagnes d'information et de sensibilisation aux normes",
      "Définition et déploiement de la politique QHSE",
      "Mise en place du comité d'hygiène-sécurité",
      "Renforcement des capacités",
      "Audits QHSE de suivi",
    ],
    titleEn: "Setting up a QHSE policy",
    introEn: "Standards awareness, defining your Quality, Health, Safety and Environment policy, and a health & safety committee.",
    bodyEn: "A strong QHSE policy starts with your teams taking ownership of the standards. Maximerit runs information and awareness campaigns, then supports you in defining and rolling out your QHSE policy.\n\nWe also help structure your health & safety committee, build its members' capacity, and carry out follow-up QHSE audits.",
    bulletsEn: [
      "Standards information and awareness campaigns",
      "Defining and rolling out the QHSE policy",
      "Setting up the health & safety committee",
      "Capacity building",
      "Follow-up QHSE audits",
    ],
  },
  {
    service: "qhse-esg",
    slug: "equipe-qhse",
    legacy: ["/mise-a-disposition-equipe-qhse/"],
    title: "Mise à disposition d'une équipe QHSE",
    intro: "Du Responsable QHSE au médecin du travail : du personnel qualifié et expérimenté, mobilisé sur vos sites.",
    body: "Pour une meilleure maîtrise de vos opérations, Maximerit met à votre disposition du personnel qualifié aux compétences avérées en QHSE — en renfort ponctuel ou pour la durée d'un projet.\n\nLes profils sont sélectionnés dans notre vivier et peuvent être mobilisés sur site, y compris sur des projets miniers et industriels.",
    bullets: [
      "Responsable QHSE",
      "Superviseur HSE",
      "Agent HSE",
      "Médecin du travail",
      "Infirmier d'État",
    ],
    titleEn: "QHSE team secondment",
    introEn: "From QHSE Manager to occupational physician: qualified, experienced staff deployed on your sites.",
    bodyEn: "For tighter control of your operations, Maximerit provides qualified staff with proven QHSE skills — as short-term reinforcement or for the duration of a project.\n\nProfiles are selected from our talent pool and can be deployed on site, including on mining and industrial projects.",
    bulletsEn: [
      "QHSE Manager",
      "HSE Supervisor",
      "HSE Officer",
      "Occupational physician",
      "State-registered nurse",
    ],
  },
  {
    service: "qhse-esg",
    slug: "etude-impact-environnemental-social",
    legacy: ["/etude-dimpact-environnemental-et-social/"],
    title: "Étude d'impact environnemental et social",
    intro: "Une obligation légale pour vos projets de construction et d'installation : rapport complet et plan de gestion environnementale et sociale.",
    body: "L'étude d'impact environnemental et social (EIES) est une obligation légale pour de nombreux projets — travaux de construction, installations industrielles, projets miniers.\n\nNos experts conduisent l'étude et vous remettent un rapport comprenant notamment le plan de gestion environnementale et sociale (PGES), qui organise la mise en œuvre des mesures d'atténuation et d'accompagnement des impacts identifiés.",
    bullets: [
      "Analyse de l'état initial et des impacts",
      "Consultation des parties prenantes",
      "Rapport d'étude d'impact",
      "Plan de gestion environnementale et sociale (PGES)",
      "Mesures d'atténuation et d'accompagnement",
    ],
    titleEn: "Environmental and social impact assessment",
    introEn: "A legal requirement for construction and installation projects: a full report and an environmental and social management plan.",
    bodyEn: "An environmental and social impact assessment (ESIA) is a legal requirement for many projects — construction works, industrial facilities, mining projects.\n\nOur experts carry out the assessment and deliver a report including the environmental and social management plan (ESMP), which organises the mitigation and support measures for the impacts identified.",
    bulletsEn: [
      "Baseline and impact analysis",
      "Stakeholder consultation",
      "Impact assessment report",
      "Environmental and social management plan (ESMP)",
      "Mitigation and support measures",
    ],
  },
  {
    service: "qhse-esg",
    slug: "strategie-esg",
    legacy: ["/esg/"],
    title: "Stratégie et reporting ESG",
    intro: "Définir et déployer votre stratégie Environnement, Social et Gouvernance, avec un reporting fiable et une communication maîtrisée.",
    body: "Une stratégie ESG est un engagement clé pour assurer la pérennité et la responsabilité de votre entreprise. Bien mise en œuvre, associée à un reporting fiable et à une bonne communication des résultats, elle réduit les risques et favorise un développement inclusif et durable.\n\nNous définissons avec vous les canaux de communication adaptés pour que vos parties prenantes internes et externes disposent de la bonne information. Sur le terrain, nos experts accompagnent aussi les parties prenantes externes pour qu'elles assument de manière autonome leur rôle dans le développement de leurs localités.",
    bullets: [
      "Identification des parties prenantes",
      "Choix des outils de collecte des données",
      "Production des rapports ESG",
      "Analyse des données et suivi des objectifs",
      "Communication et accompagnement des communautés",
    ],
    titleEn: "ESG strategy and reporting",
    introEn: "Define and roll out your Environmental, Social and Governance strategy, with reliable reporting and well-managed communication.",
    bodyEn: "An ESG strategy is a key commitment to your company's long-term sustainability and accountability. Implemented well, combined with reliable reporting and clear communication of results, it reduces risk and supports inclusive, sustainable development.\n\nWe define with you the right communication channels so that internal and external stakeholders get the right information. In the field, our experts also support external stakeholders so they can independently play their part in the development of their communities.",
    bulletsEn: [
      "Stakeholder identification",
      "Choosing data-collection tools",
      "Producing ESG reports",
      "Data analysis and target tracking",
      "Communication and community support",
    ],
  },
];

export const offersOf = (service: string) => OFFERS.filter((o) => o.service === service);
export const getOffer = (service: string, slug: string) => OFFERS.find((o) => o.service === service && o.slug === slug) ?? null;
export const offerPath = (o: OfferContent) => `/entreprises/${o.service}/${o.slug}/`;

/** Contenu approfondi des pages de pôle (repris de l'ancien site), affiché sous l'en-tête du service. */
export interface ServiceDetail {
  title: string;
  body: string;
  items?: string[];
}
export const SERVICE_DETAILS: Record<string, { fr: ServiceDetail[]; en: ServiceDetail[] }> = {
  recrutement: {
    fr: [
      {
        title: "Notre méthode",
        body: "Le recrutement est une étape décisive de la gestion des ressources humaines. Recruter, c'est avant tout évaluer : avec les bons outils, au bon moment et selon les bons indicateurs.\n\nNotre méthodologie repose sur une approche pragmatique, partagée avec vous tout au long du processus. Nous croisons plusieurs regards et recueillons les informations utiles pour recruter le bon talent — celui qui grandira avec vous et contribuera à la performance de votre organisation. En résumé : la bonne personne à la bonne place.\n\nNous nous appuyons sur une base de CV qualifiée et régulièrement mise à jour, complétée si besoin par une diffusion d'annonce ciblée. Un bon recrutement est un investissement : une source d'enrichissement et de dynamisme.",
      },
    ],
    en: [
      {
        title: "Our method",
        body: "Recruitment is a decisive step in human-resources management. Recruiting is first of all assessing: with the right tools, at the right time and against the right indicators.\n\nOur methodology is pragmatic and shared with you throughout the process. We combine several perspectives and gather the information needed to hire the right talent — someone who will grow with you and contribute to your organisation's performance. In short: the right person in the right place.\n\nWe draw on a qualified, regularly updated CV database, complemented when needed by targeted job advertising. A good hire is an investment: a source of enrichment and momentum.",
      },
    ],
  },
  "finance-performance": {
    fr: [
      {
        title: "Conseil en finance",
        body: "Notre volonté : accompagner les entreprises dans leur développement et apporter à leurs décideurs les solutions les plus adaptées. Maximerit fédère un réseau d'experts en finance ayant exercé des fonctions de direction en Europe, aux États-Unis et en Afrique, dans des contextes économiques, fiscaux et juridiques variés.\n\nNous vous accompagnons d'une part dans vos obligations déclaratives, et d'autre part sur vos problématiques financières et fiscales, avec des solutions concrètes pour créer de la valeur.",
        items: ["Finance d'entreprise", "Fiscalité et obligations déclaratives", "Audit", "Cost management", "Contrôle de gestion"],
      },
    ],
    en: [
      {
        title: "Finance advisory",
        body: "Our aim: support companies as they grow and give their decision-makers the solutions best suited to their needs. Maximerit brings together a network of finance experts who have held leadership roles in Europe, the United States and Africa, across diverse economic, tax and legal contexts.\n\nWe support you both with your statutory filing obligations and with your financial and tax challenges, with concrete solutions that create value.",
        items: ["Corporate finance", "Tax and statutory filings", "Audit", "Cost management", "Management control"],
      },
    ],
  },
  formation: {
    fr: [
      {
        title: "Un plan de formation construit avec vous",
        body: "En concertation avec vous, nous organisons des séances de travail avec vos collaborateurs pour recueillir et définir les besoins de formation de l'entreprise. À l'issue de ces séances, un plan de formation est établi.\n\nGrâce à notre réseau de consultants, nous proposons des formations d'initiation ou de perfectionnement dans trois grands domaines : la gestion des ressources humaines, le QHSE, et le management & la finance.",
      },
      {
        title: "Management et finance",
        body: "Des modules concrets pour les managers et les fonctions support.",
        items: ["Intégrité dans les affaires", "Élaboration et suivi de budget", "Mise en place d'une comptabilité analytique", "Finance pour non-financiers", "Gestion de la trésorerie"],
      },
    ],
    en: [
      {
        title: "A training plan built with you",
        body: "Together with you, we run working sessions with your staff to gather and define the company's training needs. A training plan is then drawn up.\n\nThrough our network of consultants, we offer introductory and advanced training in three main areas: human-resources management, QHSE, and management & finance.",
      },
      {
        title: "Management and finance",
        body: "Practical modules for managers and support functions.",
        items: ["Business integrity", "Budget preparation and monitoring", "Setting up cost accounting", "Finance for non-financial managers", "Cash management"],
      },
    ],
  },
};
