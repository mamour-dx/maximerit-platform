import Link from "next/link";
import Form from "next/form";
import { mining } from "@maximerit/domain";
import { Icon, type IconName } from "@/components/ui/Icon";
import { TrustedBy } from "@/components/site/TrustedBy";
import { LocationMap } from "@/components/site/LocationMap";
import { SERVICES, SECTORS } from "@/lib/content";
import { MINING_COUNTRIES } from "@/lib/mining-countries";

// Accueil partagé FR/EN : mêmes sections, textes par langue, liens préfixés /en en anglais.

type Lang = "fr" | "en";

const COPY = {
  fr: {
    eyebrow: "Afrique de l'Ouest · Mines & Ressources naturelles",
    titleA: "L'endroit où les entreprises trouvent les compétences,",
    titleB: "et où les talents se rendent visibles.",
    intro: "Cabinet de recrutement, executive search et vivier de talents qualifiés, spécialiste des opérations minières et des fonctions critiques en Afrique de l'Ouest.",
    ctaPrimary: "Confier un recrutement",
    ctaSecondary: "Recrutement minier",
    stats: ["pôles Mining", "métiers cartographiés", "pays prioritaires"],
    searchTitle: "Trouver une opportunité",
    searchHint: "Offres en Afrique de l'Ouest — Mines & secteurs adjacents.",
    searchLabel: "Poste ou compétence",
    searchPlaceholder: "Ex. géologue, maintenance…",
    countryLabel: "Pays",
    allCountries: "Tous les pays",
    searchSubmit: "Voir les offres",
    popular: "Recherches fréquentes",
    popularTerms: ["Géologue", "Planification", "Finance", "Country Manager"],
    cvLink: "Ou déposez votre CV",
    audiencesTitle: "Deux publics, une même exigence",
    employer: {
      tag: "Entreprises",
      title: "Vous recrutez des profils rares",
      body: "Opérations minières, fonctions critiques, direction : nous identifions, évaluons et présentons les bons candidats, rapidement.",
      points: ["Une première short-list qualifiée, rapidement", "Approche directe et confidentielle", "Couverture de 7 pays d'Afrique de l'Ouest"],
      cta: "Confier un recrutement",
    },
    candidate: {
      tag: "Candidats",
      title: "Vous visez votre prochain poste",
      body: "Accédez à des opportunités souvent non publiées auprès des acteurs majeurs du secteur minier et de ses partenaires.",
      points: ["Offres en Afrique de l'Ouest, en FR et EN", "Profil visible de nos consultants à chaque mission", "Accompagnement jusqu'à la prise de poste"],
      cta: "Voir les offres",
      ctaAlt: "Déposer mon CV",
    },
    expertisesEyebrow: "Expertises",
    expertisesTitle: "Nos expertises entreprises",
    expertisesIntro: "Du recrutement à l'externalisation RH, un partenaire unique pour sécuriser vos compétences.",
    expertisesCta: "Un besoin spécifique ? Parlons-en.",
    methodEyebrow: "Méthode",
    methodTitle: "Comment nous travaillons",
    method: [
      ["Cadrage du besoin", "Analyse du poste, du contexte opérationnel et des critères de réussite avec vos équipes."],
      ["Sourcing ciblé", "Vivier propriétaire, approche directe et cartographie du marché régional."],
      ["Évaluation", "Entretiens structurés, vérification des compétences techniques et des références."],
      ["Short-list & suivi", "Présentation argumentée des finalistes, puis accompagnement jusqu'à l'intégration."],
    ],
    miningEyebrow: "Verticale prioritaire",
    miningTitle: "Recrutement minier en Afrique de l'Ouest",
    miningIntro: "Les compétences qui font fonctionner les opérations minières, organisées en quatre pôles et sept pays.",
    roles: (n: number) => `${n} métiers`,
    miningCta: "Explorer la verticale Mining",
    sectorsTitle: "Secteurs couverts",
    toolsTitle: "Outils gratuits",
    toolsIntro: "Des repères concrets pour vos décisions de recrutement — résultats indicatifs, méthodologie transparente.",
    tools: [
      ["calculator", "Coût d'un poste vacant", "cout-vacance"],
      ["chart", "Coût d'un recrutement", "cout-recrutement"],
      ["target", "Benchmark salaire", "benchmark-salaire"],
      ["users", "Mining Team Planner", "mining-team-planner"],
    ],
    finalTitle: "Un besoin de recrutement ?",
    finalBody: "Recevez une première short-list qualifiée, rapidement.",
    finalCta: "Confier un recrutement",
    finalAlt: "+221 33 824 46 06",
  },
  en: {
    eyebrow: "West Africa · Mining & Natural Resources",
    titleA: "Where companies find the skills,",
    titleB: "and talent becomes visible.",
    intro: "Recruitment, executive search and a qualified talent pool — specialists in mining operations and critical functions across West Africa.",
    ctaPrimary: "Hire with us",
    ctaSecondary: "Mining recruitment",
    stats: ["Mining pillars", "roles mapped", "priority countries"],
    searchTitle: "Find an opportunity",
    searchHint: "Openings across West Africa — Mining & adjacent sectors.",
    searchLabel: "Role or skill",
    searchPlaceholder: "e.g. geologist, maintenance…",
    countryLabel: "Country",
    allCountries: "All countries",
    searchSubmit: "View openings",
    popular: "Popular searches",
    popularTerms: ["Geologist", "Planning", "Finance", "Country Manager"],
    cvLink: "Or submit your CV",
    audiencesTitle: "Two audiences, one standard",
    employer: {
      tag: "Employers",
      title: "You're hiring hard-to-find profiles",
      body: "Mining operations, critical functions, leadership: we identify, assess and present the right candidates — fast.",
      points: ["A first qualified short-list, fast", "Direct, confidential approach", "Coverage across 7 West African countries"],
      cta: "Hire with us",
    },
    candidate: {
      tag: "Candidates",
      title: "You're aiming for your next role",
      body: "Access opportunities — often unadvertised — with leading mining companies and their partners.",
      points: ["Openings across West Africa, in FR and EN", "Your profile seen by our consultants on every brief", "Support through to your start date"],
      cta: "View openings",
      ctaAlt: "Submit my CV",
    },
    expertisesEyebrow: "Expertise",
    expertisesTitle: "Services for employers",
    expertisesIntro: "From recruitment to HR outsourcing — a single partner to secure the skills you need.",
    expertisesCta: "A specific need? Let's talk.",
    methodEyebrow: "Method",
    methodTitle: "How we work",
    method: [
      ["Scoping the need", "We analyse the role, the operating context and success criteria with your teams."],
      ["Targeted sourcing", "Proprietary talent pool, direct approach and regional market mapping."],
      ["Assessment", "Structured interviews, technical skills checks and reference verification."],
      ["Short-list & follow-up", "A reasoned presentation of finalists, then support through onboarding."],
    ],
    miningEyebrow: "Priority vertical",
    miningTitle: "Mining recruitment in West Africa",
    miningIntro: "The skills that keep mining operations running, organised into four pillars across seven countries.",
    roles: (n: number) => `${n} roles`,
    miningCta: "Explore the Mining vertical",
    sectorsTitle: "Sectors we cover",
    toolsTitle: "Free tools",
    toolsIntro: "Concrete benchmarks for your hiring decisions — indicative results, transparent methodology.",
    tools: [
      ["calculator", "Cost of a vacancy", "cout-vacance"],
      ["chart", "Cost of a hire", "cout-recrutement"],
      ["target", "Salary benchmark", "benchmark-salaire"],
      ["users", "Mining Team Planner", "mining-team-planner"],
    ],
    finalTitle: "A hiring need?",
    finalBody: "Get a qualified short-list, fast.",
    finalCta: "Hire with us",
    finalAlt: "+221 33 824 46 06",
  },
} as const;

const SERVICE_ICONS: Record<string, IconName> = {
  recrutement: "users",
  "executive-search": "target",
  interim: "clock",
  "externalisation-rh-paie": "file",
  "finance-performance": "chart",
  "qhse-esg": "shield",
  formation: "compass",
};
const DISCIPLINE_ICONS: IconName[] = ["compass", "pickaxe", "chart", "users"];

export function HomePage({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const en = lang === "en";
  const p = (path: string) => (en ? `/en${path}` : path);
  const disciplines = mining.disciplines;
  const metiers = disciplines.reduce((n, d) => n + d.specialties.length, 0);
  const jobsPath = p("/candidats/offres-demploi/");
  const contactPath = p("/contact/");

  return (
    <main>
      {/* Hero */}
      <section className="hero-bg border-b border-border">
        <div className="container-page grid gap-12 py-16 sm:py-20 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-center lg:gap-16 lg:py-24">
          <div>
            <p className="eyebrow rise-in">{t.eyebrow}</p>
            <h1 className="rise-in mt-5 font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.6rem]">
              {t.titleA} <span className="text-brand">{t.titleB}</span>
            </h1>
            <p className="rise-in rise-in-delay mt-6 max-w-xl text-lg leading-relaxed text-muted">{t.intro}</p>
            <div className="rise-in rise-in-delay mt-8 flex flex-wrap gap-3">
              <Link href={contactPath} className="btn btn-primary">
                {t.ctaPrimary} <Icon name="arrowRight" size={18} />
              </Link>
              <Link href={p("/mines/")} className="btn btn-outline">{t.ctaSecondary}</Link>
            </div>
            <dl className="rise-in rise-in-delay mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-8">
              {[String(disciplines.length), `${metiers}+`, String(MINING_COUNTRIES.length)].map((v, i) => (
                <div key={t.stats[i]} className="flex flex-col">
                  <dt className="order-2 mt-1 text-sm text-muted">{t.stats[i]}</dt>
                  <dd className="order-1 font-display text-4xl font-bold text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Recherche d'offres (GET → job board, fonctionne sans JS) */}
          <div className="rise-in rise-in-delay card relative p-6 shadow-[var(--shadow-lg)] sm:p-8">
            <span className="absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-brand to-transparent" aria-hidden="true" />
            <div className="flex items-center gap-3">
              <span className="icon-chip"><Icon name="search" /></span>
              <div>
                <h2 className="text-lg font-semibold">{t.searchTitle}</h2>
                <p className="text-sm text-muted">{t.searchHint}</p>
              </div>
            </div>
            <Form action={jobsPath} className="mt-6 grid gap-4">
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">{t.searchLabel}</span>
                <input type="search" name="q" placeholder={t.searchPlaceholder} className="field" maxLength={80} />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">{t.countryLabel}</span>
                <select name="country" defaultValue="" className="field">
                  <option value="">{t.allCountries}</option>
                  {MINING_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{en ? c.labelEn : c.label}</option>
                  ))}
                </select>
              </label>
              <button type="submit" className="btn btn-primary w-full">
                <Icon name="search" size={18} /> {t.searchSubmit}
              </button>
            </Form>
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t.popular}</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {t.popularTerms.map((term) => (
                  <li key={term}>
                    <Link href={`${jobsPath}?q=${encodeURIComponent(term)}`} className="chip transition hover:border-brand hover:text-brand">{term}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <Link href={p("/candidats/deposer-mon-cv/")} className="mt-6 inline-flex items-center gap-1.5 border-t border-border pt-5 text-sm font-semibold text-brand w-full">
              {t.cvLink} <Icon name="arrowRight" size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Preuve sociale */}
      <TrustedBy lang={lang} />

      {/* Deux publics */}
      <section className="container-page py-20">
        <h2 className="sr-only">{t.audiencesTitle}</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {[
            { ...t.employer, icon: "briefcase" as const, href: contactPath, alt: null, dark: true },
            { ...t.candidate, icon: "users" as const, href: jobsPath, alt: { label: t.candidate.ctaAlt, href: p("/candidats/deposer-mon-cv/") }, dark: false },
          ].map((a) => (
            <article key={a.tag} className={`card relative overflow-hidden p-8 sm:p-10 ${a.dark ? "bg-surface" : ""}`}>
              <span className="icon-chip"><Icon name={a.icon} /></span>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-brand">{a.tag}</p>
              <h3 className="mt-2 font-display text-2xl font-bold sm:text-3xl">{a.title}</h3>
              <p className="mt-3 text-muted">{a.body}</p>
              <ul className="mt-6 grid gap-2.5">
                {a.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2.5 text-sm">
                    <Icon name="check" size={18} className="mt-0.5 shrink-0 text-accent" />
                    {pt}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={a.href} className="btn btn-primary">{a.cta} <Icon name="arrowRight" size={18} /></Link>
                {"alt" in a && a.alt ? <Link href={a.alt.href} className="btn btn-outline">{a.alt.label}</Link> : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Expertises */}
      <section id="expertises" className="scroll-mt-20 border-t border-border">
        <div className="container-page py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="eyebrow">{t.expertisesEyebrow}</p>
              <h2 className="section-title mt-3">{t.expertisesTitle}</h2>
              <p className="mt-4 text-muted">{t.expertisesIntro}</p>
            </div>
          </div>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s) => (
              <li key={s.slug} className="grid">
                <Link href={p(`/entreprises/${s.slug}/`)} className="card card-hover group flex flex-col p-6">
                  <span className="icon-chip"><Icon name={SERVICE_ICONS[s.slug] ?? "briefcase"} /></span>
                  <span className="mt-5 text-lg font-semibold group-hover:text-brand">{en ? s.titleEn : s.title}</span>
                  <span className="mt-2 flex-1 text-sm leading-relaxed text-muted">{en ? s.introEn : s.intro}</span>
                  <span className="mt-5 text-muted transition group-hover:translate-x-1 group-hover:text-brand" aria-hidden="true">
                    <Icon name="arrowRight" size={18} />
                  </span>
                </Link>
              </li>
            ))}
            <li className="grid">
              <Link href={contactPath} className="group flex flex-col justify-between rounded-[var(--radius-lg)] bg-brand p-6 text-white shadow-[0_12px_32px_-12px_rgba(226,0,26,0.6)] transition hover:bg-brand-dark">
                <span className="font-display text-2xl font-bold leading-snug">{t.expertisesCta}</span>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                  {t.ctaPrimary} <Icon name="arrowRight" size={18} className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* Méthode */}
      <section className="border-y border-border bg-surface">
        <div className="container-page py-20">
          <p className="eyebrow">{t.methodEyebrow}</p>
          <h2 className="section-title mt-3">{t.methodTitle}</h2>
          <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {t.method.map(([title, body], i) => (
              <li key={title} className="relative">
                {i < t.method.length - 1 ? (
                  <span className="absolute left-12 right-0 top-5 hidden h-px bg-border lg:block" aria-hidden="true" />
                ) : null}
                <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand font-display text-lg font-bold text-white shadow-[0_6px_16px_-6px_rgba(226,0,26,0.6)]">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Mining — verticale prioritaire */}
      <section className="container-page py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
          <div>
            <p className="eyebrow">{t.miningEyebrow}</p>
            <h2 className="section-title mt-3">{t.miningTitle}</h2>
            <p className="mt-4 text-muted">{t.miningIntro}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {MINING_COUNTRIES.map((c) => (
                <li key={c.slug}>
                  <Link href={p(`/mines/${c.slug}/`)} className="chip transition hover:border-brand hover:text-brand">
                    <Icon name="mapPin" size={13} /> {en ? c.labelEn : c.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={p("/mines/")} className="btn btn-primary mt-8">{t.miningCta} <Icon name="arrowRight" size={18} /></Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {disciplines.map((d, i) => (
              <li key={d.slug} className="grid">
                <Link href={p(d.url)} className="card card-hover group flex flex-col p-6">
                  <div className="flex items-start justify-between gap-4">
                    <span className="icon-chip"><Icon name={DISCIPLINE_ICONS[i] ?? "pickaxe"} /></span>
                    <span className="font-display text-4xl font-bold text-border transition group-hover:text-brand/25">0{i + 1}</span>
                  </div>
                  <span className="mt-5 text-lg font-semibold group-hover:text-brand">{en ? d.label_en : d.label_fr}</span>
                  <span className="mt-1 text-sm text-muted">{t.roles(d.specialties.length)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Secteurs + outils */}
      <section id="secteurs" className="scroll-mt-20 border-t border-border bg-surface">
        <div className="container-page grid gap-14 py-20 lg:grid-cols-2">
          <div>
            <h2 className="section-title">{t.sectorsTitle}</h2>
            <ul className="mt-8 grid gap-3">
              <li>
                <Link href={p("/mines/")} className="card card-hover group flex items-center justify-between border-brand/40 px-5 py-4">
                  <span className="flex items-center gap-3 font-semibold text-brand"><Icon name="pickaxe" /> {en ? "Mining & Resources" : "Mines & Ressources"}</span>
                  <Icon name="arrowRight" size={18} className="text-brand transition group-hover:translate-x-1" />
                </Link>
              </li>
              {SECTORS.map((s) => (
                <li key={s.slug}>
                  <Link href={p(`/secteurs/${s.slug}/`)} className="card card-hover group flex items-center justify-between px-5 py-4">
                    <span className="font-medium">{en ? s.titleEn : s.title}</span>
                    <Icon name="arrowRight" size={18} className="text-muted transition group-hover:translate-x-1 group-hover:text-brand" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="section-title">{t.toolsTitle}</h2>
            <p className="mt-4 text-muted">{t.toolsIntro}</p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {t.tools.map(([icon, label, slug]) => (
                <li key={slug} className="grid">
                  <Link href={p(`/ressources/outils/${slug}/`)} className="card card-hover group flex flex-col p-5">
                    <span className="icon-chip"><Icon name={icon} /></span>
                    <span className="mt-4 font-semibold group-hover:text-brand">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <LocationMap lang={lang} />

      {/* CTA final */}
      <section className="brand-band">
        <div className="container-page flex flex-col items-start gap-8 py-16 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">{t.finalTitle}</h2>
            <p className="mt-2 text-lg text-white/85">{t.finalBody}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={contactPath} className="btn btn-white">{t.finalCta} <Icon name="arrowRight" size={18} /></Link>
            <a href="tel:+221338244606" className="btn border border-white/40 text-white hover:bg-white/10">{t.finalAlt}</a>
          </div>
        </div>
      </section>
    </main>
  );
}
