import Link from "next/link";
import { mining, type MiningDiscipline, type MiningSpecialty } from "@maximerit/domain";
import { LeadForm } from "@/components/LeadForm";
import { TrackView } from "@/components/site/TrackView";
import { Icon, type IconName } from "@/components/ui/Icon";
import {
  ArrowLink,
  ChipList,
  CtaBand,
  FormCard,
  LinkCard,
  Page,
  PageHero,
  Section,
  SectionHeading,
  Steps,
  CheckList,
} from "@/components/site/PageKit";
import { localePath, type Locale } from "@/lib/i18n";
import { MINING_COUNTRIES, type MiningCountry } from "@/lib/mining-countries";
import { disciplineRoles } from "@/lib/mining-nav";

// Silo Mining (FR/EN) : hub, pôles, pays, métiers, page commerciale « recrutement minier ».

const DISCIPLINE_ICONS: Record<string, IconName> = {
  "geologie-exploration": "compass",
  "exploitation-operations": "pickaxe",
  "finance-miniere": "chart",
  "leadership-executive-search": "users",
};

const label = (d: { label_fr: string; label_en: string }, lang: Locale) => (lang === "en" ? d.label_en : d.label_fr);
const countryName = (c: MiningCountry, lang: Locale) => (lang === "en" ? c.labelEn : c.label);
const disciplineHref = (d: MiningDiscipline, lang: Locale) => localePath(lang, d.url);
const roleHref = (s: MiningSpecialty, lang: Locale) => localePath(lang, `/mines/metiers/${s.slug}/`);
const countryHref = (c: MiningCountry, lang: Locale) => localePath(lang, `/mines/${c.slug}/`);

const C = {
  fr: {
    home: "Accueil",
    mining: "Mines & Ressources",
    roles: "Métiers",
    rolesCount: (n: number) => `${n} métiers`,
    hire: "Confier un recrutement",
    viewJobs: "Voir les offres",
    allRoles: "Voir tous les métiers",
    hubEyebrow: "Verticale prioritaire",
    hubTitle: "Recrutement minier en Afrique de l'Ouest",
    hubIntro: "Les compétences qui font fonctionner les opérations minières, organisées en quatre pôles.",
    hubAgency: "Notre approche du recrutement minier",
    statPillars: "pôles",
    statRoles: "métiers",
    statCountries: "pays",
    pillarsAnchor: "poles",
    countriesAnchor: "pays",
    pillarsTitle: "Quatre pôles métiers",
    pillarsIntro: "De l'exploration à la direction des opérations : chaque pôle regroupe les métiers que nous recrutons.",
    byCountry: "Par pays",
    byCountryTitle: "Recrutement minier par pays",
    byCountryIntro: "Sept pays prioritaires, chacun avec ses ressources et son contexte de marché.",
    disciplineIntro: (l: string) => `Les compétences ${l.toLowerCase()} qui font fonctionner les opérations minières en Afrique de l'Ouest.`,
    disciplineRolesTitle: (n: number) => `Métiers (${n})`,
    otherPillars: "Autres pôles",
    viewPillar: "Voir le pôle",
    countryEyebrow: "Recrutement minier · pays",
    countryTitle: (c: string) => `Recrutement minier en ${c}`,
    commodities: "Ressources & commodities",
    pillarsInvolved: "Pôles concernés",
    otherCountries: "Autres pays",
    countryCtaTitle: (c: string) => `Un besoin en ${c} ?`,
    countryCtaBody: "Nous mobilisons des profils qualifiés, avec l'expérience terrain et la mobilité adaptées.",
    rolesTitle: "Métiers miniers",
    rolesIntro: "Les compétences qui font fonctionner les opérations minières, par pôle.",
    roleTitle: (r: string) => `Recrutement ${r}`,
    roleIntro: (r: string) => (
      <>
        Maximerit identifie et qualifie des profils <strong className="text-foreground">{r}</strong> pour les opérations minières en
        Afrique de l&apos;Ouest — expérience terrain, mobilité, langues et disponibilité vérifiées.
      </>
    ),
    roleChecks: ["Expérience terrain vérifiée", "Mobilité et langues qualifiées", "Disponibilité confirmée"],
    roleCtaTitle: (r: string) => `Besoin d'un ${r} ?`,
    roleCtaBody: "Recevez une short-list qualifiée depuis notre vivier.",
    roleCtaPrimary: "Confier ce recrutement",
    roleCandidate: (r: string) => `Je suis ${r}`,
    sameDiscipline: "Dans le même pôle",
    agencyEyebrow: "Cabinet de recrutement minier",
    agencyTitle: "Cabinet de recrutement minier en Afrique de l'Ouest",
    agencyIntro: "Nous mobilisons les compétences qui font fonctionner les opérations minières — de l'exploration à l'exploitation, jusqu'au leadership.",
    candidate: "Je suis candidat",
    problemTitle: "Le problème",
    problems: [
      "Des profils rares et très demandés (géologues, ingénieurs miniers, HSE, direction).",
      "Des délais de recrutement qui pèsent sur les opérations et les projets.",
      "Des enjeux de mobilité, de langues et d'expérience terrain propres à la région.",
    ],
    profilesTitle: "Profils recherchés",
    methodEyebrow: "Méthode",
    methodTitle: "Notre méthode",
    method: [
      ["Sourcing ciblé", "Vivier propriétaire + approche directe des profils rares."],
      ["Qualification", "Évaluation métier, mobilité, langues, disponibilité et commodities."],
      ["Short-list", "Une liste courte et pertinente, rapidement."],
      ["Placement & suivi", "Accompagnement jusqu'à la prise de poste."],
    ],
    trustTitle: "Ils nous font confiance",
    whereTitle: "Où nous recrutons",
    formTitle: "Confier un recrutement minier",
    formIntro: "Décrivez votre besoin — nous revenons vers vous avec une première short-list.",
  },
  en: {
    home: "Home",
    mining: "Mining & Resources",
    roles: "Roles",
    rolesCount: (n: number) => `${n} roles`,
    hire: "Hire with us",
    viewJobs: "View openings",
    allRoles: "View all roles",
    hubEyebrow: "Priority vertical",
    hubTitle: "Mining recruitment in West Africa",
    hubIntro: "The skills that keep mining operations running, organised into four pillars.",
    hubAgency: "Our mining recruitment approach",
    statPillars: "pillars",
    statRoles: "roles",
    statCountries: "countries",
    pillarsAnchor: "pillars",
    countriesAnchor: "countries",
    pillarsTitle: "Four pillars",
    pillarsIntro: "From exploration to operations leadership: each pillar groups the roles we recruit.",
    byCountry: "By country",
    byCountryTitle: "Mining recruitment by country",
    byCountryIntro: "Seven priority countries, each with its own resources and market context.",
    disciplineIntro: (l: string) => `The ${l.toLowerCase()} skills that keep mining operations running in West Africa.`,
    disciplineRolesTitle: (n: number) => `Roles (${n})`,
    otherPillars: "Other pillars",
    viewPillar: "View pillar",
    countryEyebrow: "Mining recruitment · country",
    countryTitle: (c: string) => `Mining recruitment in ${c}`,
    commodities: "Resources & commodities",
    pillarsInvolved: "Pillars involved",
    otherCountries: "Other countries",
    countryCtaTitle: (c: string) => `A need in ${c}?`,
    countryCtaBody: "We mobilise qualified profiles with the right field experience and mobility.",
    rolesTitle: "Mining roles",
    rolesIntro: "The skills that keep mining operations running, by pillar.",
    roleTitle: (r: string) => `${r} recruitment`,
    roleIntro: (r: string) => (
      <>
        Maximerit identifies and qualifies <strong className="text-foreground">{r}</strong> profiles for mining operations in West
        Africa — field experience, mobility, languages and availability all verified.
      </>
    ),
    roleChecks: ["Verified field experience", "Qualified mobility and languages", "Confirmed availability"],
    roleCtaTitle: (r: string) => `Need a ${r}?`,
    roleCtaBody: "Get a qualified short-list from our talent pool.",
    roleCtaPrimary: "Hire with us",
    roleCandidate: (r: string) => `I'm a ${r}`,
    sameDiscipline: "In the same pillar",
    agencyEyebrow: "Mining recruitment agency",
    agencyTitle: "Mining recruitment agency in West Africa",
    agencyIntro: "We mobilise the skills that keep mining operations running — from exploration to operations, up to leadership.",
    candidate: "I'm a candidate",
    problemTitle: "The challenge",
    problems: [
      "Rare, in-demand profiles (geologists, mining engineers, HSE, leadership).",
      "Hiring lead times that weigh on operations and projects.",
      "Mobility, language and field-experience requirements specific to the region.",
    ],
    profilesTitle: "Profiles we recruit",
    methodEyebrow: "Method",
    methodTitle: "Our method",
    method: [
      ["Targeted sourcing", "Proprietary talent pool + direct approach to rare profiles."],
      ["Qualification", "Assessment of role, mobility, languages, availability and commodities."],
      ["Short-list", "A short, relevant list — fast."],
      ["Placement & follow-up", "Support through to onboarding."],
    ],
    trustTitle: "They trust us",
    whereTitle: "Where we recruit",
    formTitle: "Hire with us",
    formIntro: "Describe your need — we'll come back with a first short-list.",
  },
} as const;

const REFERENCES = ["Senelec", "SGS", "BMN", "Endeavour", "Teranga", "GCO"];

function DisciplineCards({ lang, preview = false }: { lang: Locale; preview?: boolean }) {
  const t = C[lang];
  return (
    <ul className={`grid gap-5 sm:grid-cols-2 ${preview ? "" : "lg:grid-cols-4"}`}>
      {mining.disciplines.map((d, i) => (
        <li key={d.slug}>
          <LinkCard href={disciplineHref(d, lang)} icon={DISCIPLINE_ICONS[d.slug] ?? "pickaxe"} index={i + 1} title={label(d, lang)} meta={t.rolesCount(disciplineRoles(d).length)}>
            {preview ? (
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {disciplineRoles(d).slice(0, 4).map((s) => (
                  <li key={s.slug} className="chip">{label(s, lang)}</li>
                ))}
              </ul>
            ) : null}
          </LinkCard>
        </li>
      ))}
    </ul>
  );
}

function CountryChips({ lang, exclude }: { lang: Locale; exclude?: string }) {
  return (
    <ChipList
      icon="mapPin"
      items={MINING_COUNTRIES.filter((c) => c.slug !== exclude).map((c) => ({ label: countryName(c, lang), href: countryHref(c, lang) }))}
    />
  );
}

function RoleGrid({ roles, lang }: { roles: MiningSpecialty[]; lang: Locale }) {
  const other: Locale = lang === "en" ? "fr" : "en";
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {roles.map((s) => (
        <li key={s.slug}>
          <Link href={roleHref(s, lang)} className="card card-hover group flex items-center justify-between gap-4 px-5 py-4">
            <span className="min-w-0">
              <span className="block font-semibold group-hover:text-brand">{label(s, lang)}</span>
              <span className="mt-0.5 block truncate text-xs text-muted">{label(s, other)}</span>
            </span>
            <Icon name="arrowRight" size={16} className="shrink-0 text-muted transition group-hover:translate-x-1 group-hover:text-brand" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function MiningHub({ lang }: { lang: Locale }) {
  const t = C[lang];
  return (
    <Page lang={lang}>
      <TrackView event="view_mining_page" params={{ path: localePath(lang, "/mines/") }} />
      <PageHero
        lang={lang}
        crumbs={[{ label: t.home, href: localePath(lang, "/") }, { label: t.mining }]}
        eyebrow={t.hubEyebrow}
        title={t.hubTitle}
        intro={t.hubIntro}
        actions={
          <>
            <Link href={localePath(lang, "/contact/")} className="btn btn-primary">{t.hire} <Icon name="arrowRight" size={18} /></Link>
            <Link href={localePath(lang, "/mines/recrutement-minier/")} className="btn btn-outline">{t.hubAgency}</Link>
          </>
        }
        aside={
          // Chiffres cliquables : pôles et pays → sections plus bas (ancres), métiers → page de tous les métiers.
          <ul className="card grid grid-cols-3 divide-x divide-border p-6 sm:p-8">
            {[
              [String(mining.disciplines.length), t.statPillars, `#${t.pillarsAnchor}`],
              [`${mining.disciplines.reduce((n, d) => n + d.specialties.length, 0)}+`, t.statRoles, localePath(lang, "/mines/metiers/")],
              [String(MINING_COUNTRIES.length), t.statCountries, `#${t.countriesAnchor}`],
            ].map(([v, l, href]) => (
              <li key={l} className="px-2">
                <Link href={href} className="group flex flex-col items-center rounded-[var(--radius)] text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
                  <span className="font-display text-4xl font-bold text-brand sm:text-5xl">{v}</span>
                  <span className="mt-1 text-xs text-muted transition-colors group-hover:text-brand group-hover:underline sm:text-sm">{l}</span>
                </Link>
              </li>
            ))}
          </ul>
        }
      />
      <Section id={t.pillarsAnchor}>
        <SectionHeading title={t.pillarsTitle} intro={t.pillarsIntro} action={<ArrowLink href={localePath(lang, "/mines/metiers/")}>{t.allRoles}</ArrowLink>} />
        <div className="mt-10"><DisciplineCards lang={lang} preview /></div>
      </Section>
      <Section tone="surface" id={t.countriesAnchor}>
        <SectionHeading eyebrow={t.byCountry} title={t.byCountryTitle} intro={t.byCountryIntro} />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MINING_COUNTRIES.map((c) => (
            <li key={c.slug}>
              <LinkCard href={countryHref(c, lang)} icon="mapPin" title={countryName(c, lang)} meta={(lang === "en" ? c.commoditiesEn : c.commodities).join(" · ")} />
            </li>
          ))}
        </ul>
      </Section>
      <CtaBand lang={lang} secondary={{ label: t.viewJobs, href: localePath(lang, "/candidats/offres-demploi/") }} />
    </Page>
  );
}

export function MiningDisciplinePage({ discipline: d, lang }: { discipline: MiningDiscipline; lang: Locale }) {
  const t = C[lang];
  const l = label(d, lang);
  return (
    <Page lang={lang}>
      <PageHero
        lang={lang}
        crumbs={[{ label: t.mining, href: localePath(lang, "/mines/") }, { label: l }]}
        eyebrow={t.rolesCount(disciplineRoles(d).length)}
        title={l}
        intro={t.disciplineIntro(l)}
        actions={
          <>
            <Link href={localePath(lang, "/contact/")} className="btn btn-primary">{t.hire} <Icon name="arrowRight" size={18} /></Link>
            <Link href={localePath(lang, "/candidats/offres-demploi/")} className="btn btn-outline">{t.viewJobs}</Link>
          </>
        }
      />
      <Section>
        <SectionHeading title={t.disciplineRolesTitle(disciplineRoles(d).length)} />
        <div className="mt-8"><RoleGrid roles={disciplineRoles(d)} lang={lang} /></div>
      </Section>
      <Section tone="surface">
        <SectionHeading title={t.otherPillars} />
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {mining.disciplines.filter((x) => x.slug !== d.slug).map((x) => (
            <li key={x.slug}>
              <LinkCard href={disciplineHref(x, lang)} icon={DISCIPLINE_ICONS[x.slug] ?? "pickaxe"} title={label(x, lang)} meta={t.rolesCount(disciplineRoles(x).length)} />
            </li>
          ))}
        </ul>
      </Section>
      <CtaBand lang={lang} />
    </Page>
  );
}

export function MiningCountryPage({ country: c, lang }: { country: MiningCountry; lang: Locale }) {
  const t = C[lang];
  const name = countryName(c, lang);
  const commodities = lang === "en" ? c.commoditiesEn : c.commodities;
  return (
    <Page lang={lang}>
      <PageHero
        lang={lang}
        crumbs={[{ label: t.mining, href: localePath(lang, "/mines/") }, { label: name }]}
        eyebrow={t.countryEyebrow}
        title={t.countryTitle(name)}
        intro={lang === "en" ? c.contextEn : c.context}
        actions={
          <>
            <Link href={localePath(lang, "/contact/")} className="btn btn-primary">{t.hire} <Icon name="arrowRight" size={18} /></Link>
            <Link href={localePath(lang, "/mines/metiers/")} className="btn btn-outline">{t.allRoles}</Link>
          </>
        }
        aside={
          <div className="card p-6 sm:p-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">{t.commodities}</h2>
            <ul className="mt-4 grid gap-3">
              {commodities.map((m) => (
                <li key={m} className="flex items-center gap-3 font-medium">
                  <span className="icon-chip h-9 w-9 rounded-[10px]"><Icon name="layers" size={18} /></span>
                  {m}
                </li>
              ))}
            </ul>
          </div>
        }
      />
      <Section>
        <SectionHeading title={t.pillarsInvolved} />
        <div className="mt-8"><DisciplineCards lang={lang} /></div>
      </Section>
      <Section tone="surface">
        <SectionHeading title={t.otherCountries} />
        <div className="mt-6"><CountryChips lang={lang} exclude={c.slug} /></div>
      </Section>
      <CtaBand lang={lang} title={t.countryCtaTitle(name)} body={t.countryCtaBody} />
    </Page>
  );
}

export function MiningRolesPage({ lang }: { lang: Locale }) {
  const t = C[lang];
  return (
    <Page lang={lang}>
      <PageHero lang={lang} crumbs={[{ label: t.mining, href: localePath(lang, "/mines/") }, { label: t.roles }]} title={t.rolesTitle} intro={t.rolesIntro} compact>
        <ul className="mt-8 flex flex-wrap gap-2">
          {mining.disciplines.map((d) => (
            <li key={d.slug}>
              <a href={`#${d.slug}`} className="chip transition hover:border-brand hover:text-brand">
                <Icon name={DISCIPLINE_ICONS[d.slug] ?? "pickaxe"} size={13} /> {label(d, lang)}
              </a>
            </li>
          ))}
        </ul>
      </PageHero>
      {mining.disciplines.map((d, i) => (
        <Section key={d.slug} id={d.slug} tone={i % 2 ? "surface" : "default"}>
          <SectionHeading
            eyebrow={t.rolesCount(disciplineRoles(d).length)}
            title={label(d, lang)}
            action={<ArrowLink href={disciplineHref(d, lang)}>{t.viewPillar}</ArrowLink>}
          />
          <div className="mt-8"><RoleGrid roles={disciplineRoles(d)} lang={lang} /></div>
        </Section>
      ))}
      <CtaBand lang={lang} />
    </Page>
  );
}

export function MiningRolePage({ specialty: s, discipline: d, lang }: { specialty: MiningSpecialty; discipline: MiningDiscipline; lang: Locale }) {
  const t = C[lang];
  const other: Locale = lang === "en" ? "fr" : "en";
  const name = label(s, lang);
  const siblings = d.specialties.filter((x) => x.slug !== s.slug).slice(0, 6);
  return (
    <Page lang={lang}>
      <PageHero
        lang={lang}
        crumbs={[
          { label: lang === "en" ? "Mining" : "Mines", href: localePath(lang, "/mines/") },
          { label: label(d, lang), href: disciplineHref(d, lang) },
          { label: name },
        ]}
        eyebrow={label(d, lang)}
        title={t.roleTitle(name)}
        subtitle={label(s, other)}
        intro={t.roleIntro(name)}
        aside={
          <div className="card p-6 shadow-[var(--shadow-lg)] sm:p-8">
            <span className="icon-chip"><Icon name="target" /></span>
            <h2 className="mt-4 font-display text-2xl font-bold">{t.roleCtaTitle(name)}</h2>
            <p className="mt-1 text-sm text-muted">{t.roleCtaBody}</p>
            <CheckList items={t.roleChecks} className="mt-5 text-sm" />
            <div className="mt-6 grid gap-2">
              <Link href={localePath(lang, "/contact/")} className="btn btn-primary w-full">{t.roleCtaPrimary}</Link>
              <Link href={localePath(lang, "/candidats/deposer-mon-cv/")} className="btn btn-outline w-full">{t.roleCandidate(name)}</Link>
            </div>
          </div>
        }
      />
      {siblings.length ? (
        <Section>
          <SectionHeading title={t.sameDiscipline} action={<ArrowLink href={disciplineHref(d, lang)}>{label(d, lang)}</ArrowLink>} />
          <div className="mt-8"><RoleGrid roles={siblings} lang={lang} /></div>
        </Section>
      ) : null}
      <CtaBand lang={lang} secondary={{ label: t.viewJobs, href: localePath(lang, "/candidats/offres-demploi/") }} />
    </Page>
  );
}

export function MiningAgencyPage({ lang }: { lang: Locale }) {
  const t = C[lang];
  return (
    <Page lang={lang}>
      <PageHero
        lang={lang}
        crumbs={[{ label: t.mining, href: localePath(lang, "/mines/") }, { label: lang === "en" ? "Mining recruitment" : "Recrutement minier" }]}
        eyebrow={t.agencyEyebrow}
        title={t.agencyTitle}
        intro={t.agencyIntro}
        actions={
          <>
            <a href="#confier" className="btn btn-primary">{t.hire} <Icon name="arrowRight" size={18} /></a>
            <Link href={localePath(lang, "/candidats/deposer-mon-cv/")} className="btn btn-outline">{t.candidate}</Link>
          </>
        }
        aside={
          <div className="card p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold">{t.problemTitle}</h2>
            <ul className="mt-5 grid gap-4">
              {t.problems.map((p) => (
                <li key={p} className="flex gap-3 text-sm leading-relaxed text-muted">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        }
      />
      <Section>
        <SectionHeading title={t.profilesTitle} action={<ArrowLink href={localePath(lang, "/mines/metiers/")}>{t.allRoles}</ArrowLink>} />
        <div className="mt-10"><DisciplineCards lang={lang} /></div>
      </Section>
      <Section tone="surface">
        <SectionHeading eyebrow={t.methodEyebrow} title={t.methodTitle} />
        <div className="mt-12"><Steps steps={t.method} /></div>
      </Section>
      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading title={t.trustTitle} />
            <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {REFERENCES.map((r) => (
                <li key={r} className="card flex h-16 items-center justify-center px-4 text-center font-semibold text-muted">{r}</li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading title={t.whereTitle} />
            <div className="mt-8"><CountryChips lang={lang} /></div>
          </div>
        </div>
      </Section>
      <section className="border-t border-border bg-surface">
        <div className="container-page max-w-3xl py-16 sm:py-20">
          <FormCard id="confier" icon="briefcase" title={t.formTitle} intro={t.formIntro}>
            {lang === "en" ? <LeadForm source="mines-recrutement-en" lang="en" ctaLabel="Send" /> : <LeadForm source="mines-recrutement" />}
          </FormCard>
        </div>
      </section>
    </Page>
  );
}
