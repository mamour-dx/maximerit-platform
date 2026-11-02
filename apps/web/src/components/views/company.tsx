import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { LocationMap } from "@/components/site/LocationMap";
import { Icon, type IconName } from "@/components/ui/Icon";
import {
  ArrowLink,
  CheckList,
  ChipList,
  CtaBand,
  FormCard,
  InfoCard,
  LinkCard,
  Page,
  PageHero,
  Photo,
  Prose,
  Section,
  SectionHeading,
} from "@/components/site/PageKit";
import { SECTORS, SERVICES, getService, type SectorContent, type ServiceContent } from "@/lib/content";
import { SERVICE_DETAILS, offerPath, offersOf, type OfferContent } from "@/lib/offers";
import { localePath, type Locale } from "@/lib/i18n";
import { MINING_COUNTRIES } from "@/lib/mining-countries";

// Pages « entreprise » (FR/EN) : expertises, secteurs, à propos, contact.

export const SERVICE_ICONS: Record<string, IconName> = {
  recrutement: "users",
  "executive-search": "target",
  interim: "clock",
  "externalisation-rh-paie": "file",
  "finance-performance": "chart",
  "qhse-esg": "shield",
  formation: "book",
};
export const SECTOR_ICONS: Record<string, IconName> = {
  energie: "sparkle",
  "petrole-gaz": "layers",
  "btp-infrastructures": "briefcase",
  industrie: "target",
  services: "users",
};

const svc = (s: ServiceContent, lang: Locale) => ({
  title: lang === "en" ? s.titleEn : s.title,
  intro: lang === "en" ? s.introEn : s.intro,
  bullets: lang === "en" ? s.bulletsEn : s.bullets,
});
const off = (o: OfferContent, lang: Locale) => ({
  title: lang === "en" ? o.titleEn : o.title,
  intro: lang === "en" ? o.introEn : o.intro,
  body: lang === "en" ? o.bodyEn : o.body,
  bullets: lang === "en" ? o.bulletsEn : o.bullets,
});
const sec = (s: SectorContent, lang: Locale) => ({ title: lang === "en" ? s.titleEn : s.title, intro: lang === "en" ? s.introEn : s.intro });

const C = {
  fr: {
    home: "Accueil",
    employers: "Entreprises",
    servicesEyebrow: "Entreprises",
    servicesTitle: "Nos expertises",
    servicesIntro: "Accéder plus rapidement aux compétences adaptées aux réalités de l'Afrique de l'Ouest.",
    hire: "Confier un recrutement",
    contactUs: "Nous contacter",
    whatWeBring: "Ce que nous apportons",
    otherServices: "Autres expertises",
    offersTitle: "Nos prestations",
    offersIntro: "Des missions ciblées, menées par nos experts et adaptées à votre contexte.",
    weHandle: "Ce que nous prenons en charge",
    otherOffers: "Autres prestations",
    miningCalloutTitle: "Recrutement minier",
    miningCalloutBody: "Notre verticale prioritaire : géologie, exploitation, finance et leadership pour les opérations minières.",
    miningCalloutCta: "Découvrir la verticale Mining",
    sectors: "Secteurs",
    sectorsTitle: "Secteurs couverts",
    sectorsIntro: "Une verticale prioritaire, les Mines & Ressources, et des secteurs adjacents aux compétences souvent transférables.",
    miningSector: "Mines & Ressources",
    miningSectorBody: "Verticale prioritaire — recrutement minier en Afrique de l'Ouest.",
    priority: "Prioritaire",
    transferTitle: "Des compétences transférables",
    transferBody: (
      <>
        Les compétences sont souvent transférables entre ces univers et notre verticale prioritaire{" "}
        <Link href="/mines/" className="font-semibold text-brand hover:underline">Mines &amp; Ressources</Link>.
      </>
    ),
    otherSectors: "Autres secteurs",
    aboutEyebrow: "À propos",
    aboutTitle: "Qui sommes-nous",
    approachTitle: "Notre approche",
    approachIntro:
      "Consultance, externalisation de services, recrutement et intérim : nous accompagnons multinationales, entreprises locales et organismes internationaux en alliant performance et respect des critères environnementaux, sociaux et de bonne gouvernance. Notre démarche repose sur trois piliers.",
    approach: [
      ["Le savoir", "La connaissance des secteurs et des acteurs du développement, grâce à l'expérience de nos consultants dans des domaines variés."],
      ["Le savoir-faire", "L'efficacité dans la recherche de solutions aux problèmes posés, et un souci constant d'amélioration continue."],
      ["Le savoir-être", "Engagement, confidentialité, transparence et éthique, dans une démarche de proximité et de respect de toutes les parties."],
    ],
    aboutPhotoAlt: "Deux consultants Maximerit en entretien avec une candidate dans un bureau lumineux à Dakar",
    aboutIntro:
      "Maximerit accompagne les entreprises d'Afrique de l'Ouest dans l'accès aux compétences dont elles ont besoin pour recruter, structurer et faire fonctionner leurs opérations — avec une spécialisation forte sur les Mines & Ressources naturelles.",
    pillarsTitle: "Ce qui nous distingue",
    pillars: [
      ["Spécialisation sectorielle", "Une connaissance fine des métiers miniers et des fonctions critiques."],
      ["Connaissance régionale", "Afrique de l'Ouest : Sénégal, Guinée, Côte d'Ivoire, Mali, Mauritanie, Burkina, Ghana."],
      ["Vivier propriétaire", "Une base de talents qualifiée et exploitable, pas un simple stock de CV."],
      ["Rapidité", "Capacité à produire rapidement une short-list pertinente."],
    ],
    presenceTitle: "Notre présence",
    presenceIntro: "Basés à Dakar, nous recrutons dans sept pays prioritaires d'Afrique de l'Ouest.",
    contactEyebrow: "Contact",
    contactTitle: "Parlons de votre besoin",
    contactIntro: "Un consultant spécialisé vous répond rapidement — recrutement, executive search, intérim ou mise à disposition.",
    phone: "Téléphone",
    email: "Email",
    address: "Adresse",
    addressValue: "Sacré Cœur 3 Pyrotechnie, lot 115 — en face arrêt BRT Sacré Coeur - Dakar",
    formTitle: "Confier un recrutement",
    formIntro: "Décrivez votre besoin, nous revenons vers vous sous 48 h.",
    candidateTitle: "Vous êtes candidat ?",
    candidateBody: "Consultez nos offres ou déposez votre CV pour rejoindre notre vivier.",
    candidateCta: "Déposer mon CV",
  },
  en: {
    home: "Home",
    employers: "For employers",
    servicesEyebrow: "For employers",
    servicesTitle: "Our expertise",
    servicesIntro: "Access the right skills faster — fit to the realities of West Africa.",
    hire: "Hire with us",
    contactUs: "Contact us",
    whatWeBring: "What we bring",
    otherServices: "Other services",
    offersTitle: "Our services",
    offersIntro: "Targeted assignments, led by our experts and adapted to your context.",
    weHandle: "What we take care of",
    otherOffers: "Other services in this area",
    miningCalloutTitle: "Mining recruitment",
    miningCalloutBody: "Our priority vertical: geology, operations, finance and leadership for mining operations.",
    miningCalloutCta: "Explore the Mining vertical",
    sectors: "Sectors",
    sectorsTitle: "Sectors we cover",
    sectorsIntro: "One priority vertical, Mining & Resources, plus adjacent sectors where skills often transfer.",
    miningSector: "Mining & Resources",
    miningSectorBody: "Priority vertical — mining recruitment across West Africa.",
    priority: "Priority",
    transferTitle: "Transferable skills",
    transferBody: (
      <>
        Skills are often transferable between these fields and our priority vertical,{" "}
        <Link href="/en/mines/" className="font-semibold text-brand hover:underline">Mining &amp; Resources</Link>.
      </>
    ),
    otherSectors: "Other sectors",
    aboutEyebrow: "About",
    aboutTitle: "About us",
    approachTitle: "Our approach",
    approachIntro:
      "Consulting, outsourced services, recruitment and staffing: we work with multinationals, local companies and international organisations, combining performance with respect for environmental, social and governance criteria. Our approach rests on three pillars.",
    approach: [
      ["Knowledge", "Deep understanding of sectors and development players, drawn from our consultants' experience across many fields."],
      ["Know-how", "Effective, efficient problem-solving and a constant drive for continuous improvement."],
      ["Values", "Commitment, confidentiality, transparency and ethics, with a close, respectful relationship with every party involved."],
    ],
    aboutPhotoAlt: "Two Maximerit consultants interviewing a candidate in a bright office in Dakar",
    aboutIntro:
      "Maximerit helps West African companies access the skills they need to hire, structure and run their operations — with a strong specialisation in Mining & Natural Resources.",
    pillarsTitle: "What sets us apart",
    pillars: [
      ["Sector specialisation", "A fine-grained knowledge of mining roles and critical functions."],
      ["Regional knowledge", "West Africa: Senegal, Guinea, Ivory Coast, Mali, Mauritania, Burkina Faso, Ghana."],
      ["Proprietary talent pool", "A qualified, actionable talent base — not just a stack of CVs."],
      ["Speed", "The ability to produce a relevant short-list, fast."],
    ],
    presenceTitle: "Where we work",
    presenceIntro: "Based in Dakar, we recruit across seven priority West African countries.",
    contactEyebrow: "Contact",
    contactTitle: "Let's talk about your need",
    contactIntro: "A specialist consultant will get back to you quickly — recruitment, executive search or staffing.",
    phone: "Phone",
    email: "Email",
    address: "Address",
    addressValue: "Sacré Cœur 3 Pyrotechnie, lot 115 — opposite the Sacré Cœur BRT stop, Dakar",
    formTitle: "Hire with us",
    formIntro: "Describe your need and we'll come back within 48h.",
    candidateTitle: "Looking for a job?",
    candidateBody: "Browse our openings or submit your CV to join our talent pool.",
    candidateCta: "Submit my CV",
  },
} as const;

const PILLAR_ICONS: IconName[] = ["target", "mapPin", "users", "clock"];
const APPROACH_ICONS: IconName[] = ["book", "compass", "shield"];

function HireActions({ lang }: { lang: Locale }) {
  return (
    <Link href={localePath(lang, "/contact/")} className="btn btn-primary">
      {C[lang].hire} <Icon name="arrowRight" size={18} />
    </Link>
  );
}

export function ServicesHub({ lang }: { lang: Locale }) {
  const t = C[lang];
  return (
    <Page lang={lang}>
      <PageHero lang={lang} eyebrow={t.servicesEyebrow} title={t.servicesTitle} intro={t.servicesIntro} actions={<HireActions lang={lang} />} />
      <Section>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => {
            const c = svc(s, lang);
            return (
              <li key={s.slug}>
                <LinkCard href={localePath(lang, `/entreprises/${s.slug}/`)} icon={SERVICE_ICONS[s.slug] ?? "briefcase"} title={c.title} body={c.intro} />
              </li>
            );
          })}
        </ul>
      </Section>
      <CtaBand lang={lang} />
    </Page>
  );
}

export function ServicePage({ service, lang }: { service: ServiceContent; lang: Locale }) {
  const t = C[lang];
  const c = svc(service, lang);
  return (
    <Page lang={lang}>
      <PageHero
        lang={lang}
        crumbs={[{ label: t.employers, href: localePath(lang, "/entreprises/") }, { label: c.title }]}
        title={c.title}
        intro={c.intro}
        actions={<HireActions lang={lang} />}
        aside={
          <div className="card p-6 sm:p-8">
            <span className="icon-chip"><Icon name={SERVICE_ICONS[service.slug] ?? "briefcase"} /></span>
            <h2 className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">{t.whatWeBring}</h2>
            <CheckList items={c.bullets} className="mt-4" />
          </div>
        }
      />
      {service.slug === "recrutement" ? (
        <Section narrow>
          <div className="card flex flex-col gap-6 border-brand/40 p-6 sm:flex-row sm:items-center sm:p-8">
            <span className="icon-chip h-14 w-14"><Icon name="pickaxe" size={26} /></span>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{t.miningCalloutTitle}</h2>
              <p className="mt-1 text-sm text-muted">{t.miningCalloutBody}</p>
            </div>
            <Link href={localePath(lang, "/mines/")} className="btn btn-outline">{t.miningCalloutCta}</Link>
          </div>
        </Section>
      ) : null}
      {(SERVICE_DETAILS[service.slug]?.[lang] ?? []).map((d) => (
        <Section key={d.title} narrow>
          <h2 className="section-title">{d.title}</h2>
          <Prose text={d.body} className="mt-6" />
          {d.items ? <CheckList items={d.items} className="mt-6" /> : null}
        </Section>
      ))}
      {offersOf(service.slug).length ? (
        <Section tone="surface">
          <SectionHeading title={t.offersTitle} intro={t.offersIntro} />
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {offersOf(service.slug).map((o) => {
              const x = off(o, lang);
              return (
                <li key={o.slug}>
                  <LinkCard href={localePath(lang, offerPath(o))} icon={SERVICE_ICONS[service.slug] ?? "briefcase"} title={x.title} body={x.intro} />
                </li>
              );
            })}
          </ul>
        </Section>
      ) : null}
      <Section tone={offersOf(service.slug).length ? "default" : "surface"}>
        <SectionHeading title={t.otherServices} />
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.filter((s) => s.slug !== service.slug).map((s) => {
            const o = svc(s, lang);
            return (
              <li key={s.slug}>
                <LinkCard href={localePath(lang, `/entreprises/${s.slug}/`)} icon={SERVICE_ICONS[s.slug] ?? "briefcase"} title={o.title} body={o.intro} />
              </li>
            );
          })}
        </ul>
      </Section>
      <CtaBand lang={lang} />
    </Page>
  );
}

/** Prestation détaillée d'un pôle (/entreprises/<service>/<offre>/) — contenu repris de l'ancien site. */
export function OfferPage({ offer, lang }: { offer: OfferContent; lang: Locale }) {
  const t = C[lang];
  const parent = getService(offer.service);
  const p = parent ? svc(parent, lang) : null;
  const x = off(offer, lang);
  const siblings = offersOf(offer.service).filter((o) => o.slug !== offer.slug);
  return (
    <Page lang={lang}>
      <PageHero
        lang={lang}
        crumbs={[
          { label: t.employers, href: localePath(lang, "/entreprises/") },
          ...(p ? [{ label: p.title, href: localePath(lang, `/entreprises/${offer.service}/`) }] : []),
          { label: x.title },
        ]}
        title={x.title}
        intro={x.intro}
        actions={<Link href={localePath(lang, "/contact/")} className="btn btn-primary">{t.contactUs} <Icon name="arrowRight" size={18} /></Link>}
        aside={
          <div className="card p-6 sm:p-8">
            <span className="icon-chip"><Icon name={SERVICE_ICONS[offer.service] ?? "briefcase"} /></span>
            <h2 className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">{t.weHandle}</h2>
            <CheckList items={x.bullets} className="mt-4" />
          </div>
        }
      />
      <Section narrow>
        <Prose text={x.body} />
      </Section>
      {siblings.length ? (
        <Section tone="surface">
          <SectionHeading
            title={t.otherOffers}
            action={p ? <ArrowLink href={localePath(lang, `/entreprises/${offer.service}/`)}>{p.title}</ArrowLink> : undefined}
          />
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {siblings.map((o) => {
              const y = off(o, lang);
              return (
                <li key={o.slug}>
                  <LinkCard href={localePath(lang, offerPath(o))} icon={SERVICE_ICONS[o.service] ?? "briefcase"} title={y.title} body={y.intro} />
                </li>
              );
            })}
          </ul>
        </Section>
      ) : null}
      <CtaBand lang={lang} />
    </Page>
  );
}

export function SectorsHub({ lang }: { lang: Locale }) {
  const t = C[lang];
  return (
    <Page lang={lang}>
      <PageHero lang={lang} eyebrow={t.sectors} title={t.sectorsTitle} intro={t.sectorsIntro} actions={<HireActions lang={lang} />} />
      <Section>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <li>
            <LinkCard href={localePath(lang, "/mines/")} icon="pickaxe" title={t.miningSector} body={t.miningSectorBody} highlight>
              <span className="chip chip-brand mt-4 self-start">★ {t.priority}</span>
            </LinkCard>
          </li>
          {SECTORS.map((s) => {
            const c = sec(s, lang);
            return (
              <li key={s.slug}>
                <LinkCard href={localePath(lang, `/secteurs/${s.slug}/`)} icon={SECTOR_ICONS[s.slug] ?? "briefcase"} title={c.title} body={c.intro} />
              </li>
            );
          })}
        </ul>
      </Section>
      <CtaBand lang={lang} />
    </Page>
  );
}

export function SectorPage({ sector, lang }: { sector: SectorContent; lang: Locale }) {
  const t = C[lang];
  const c = sec(sector, lang);
  return (
    <Page lang={lang}>
      <PageHero
        lang={lang}
        crumbs={[{ label: t.sectors, href: localePath(lang, "/secteurs/") }, { label: c.title }]}
        title={c.title}
        intro={c.intro}
        actions={<HireActions lang={lang} />}
        aside={
          <div className="card p-6 sm:p-8">
            <span className="icon-chip"><Icon name="pickaxe" /></span>
            <h2 className="mt-4 text-lg font-semibold">{t.transferTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t.transferBody}</p>
          </div>
        }
      />
      <Section>
        <SectionHeading title={t.otherSectors} />
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <li>
            <LinkCard href={localePath(lang, "/mines/")} icon="pickaxe" title={t.miningSector} body={t.miningSectorBody} highlight />
          </li>
          {SECTORS.filter((s) => s.slug !== sector.slug).map((s) => {
            const o = sec(s, lang);
            return (
              <li key={s.slug}>
                <LinkCard href={localePath(lang, `/secteurs/${s.slug}/`)} icon={SECTOR_ICONS[s.slug] ?? "briefcase"} title={o.title} body={o.intro} />
              </li>
            );
          })}
        </ul>
      </Section>
      <CtaBand lang={lang} />
    </Page>
  );
}

export function AboutPage({ lang }: { lang: Locale }) {
  const t = C[lang];
  return (
    <Page lang={lang}>
      <PageHero
        lang={lang}
        eyebrow={t.aboutEyebrow}
        title={t.aboutTitle}
        intro={t.aboutIntro}
        aside={<Photo src="/images/consultants-dakar.webp" alt={t.aboutPhotoAlt} priority className="aspect-[4/3]" />}
        actions={
          <>
            <Link href={localePath(lang, "/contact/")} className="btn btn-primary">{t.contactUs} <Icon name="arrowRight" size={18} /></Link>
            <Link href={localePath(lang, "/entreprises/")} className="btn btn-outline">{t.servicesTitle}</Link>
          </>
        }
      />
      <Section>
        <SectionHeading title={t.pillarsTitle} />
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.pillars.map(([title, body], i) => (
            <li key={title}><InfoCard icon={PILLAR_ICONS[i]} title={title} body={body} /></li>
          ))}
        </ul>
      </Section>
      <Section tone="surface">
        <SectionHeading title={t.approachTitle} intro={t.approachIntro} />
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {t.approach.map(([title, body], i) => (
            <li key={title}><InfoCard icon={APPROACH_ICONS[i]} title={title} body={body} /></li>
          ))}
        </ul>
      </Section>
      <Section>
        <SectionHeading title={t.presenceTitle} intro={t.presenceIntro} action={<ArrowLink href={localePath(lang, "/mines/")}>{t.miningCalloutCta}</ArrowLink>} />
        <div className="mt-8">
          <ChipList icon="mapPin" items={MINING_COUNTRIES.map((c) => ({ label: lang === "en" ? c.labelEn : c.label, href: localePath(lang, `/mines/${c.slug}/`) }))} />
        </div>
      </Section>
      <CtaBand lang={lang} primary={{ label: t.contactUs, href: localePath(lang, "/contact/") }} />
    </Page>
  );
}

export function ContactPage({ lang }: { lang: Locale }) {
  const t = C[lang];
  const cards: { icon: IconName; label: string; value: string; href?: string }[] = [
    { icon: "phone", label: t.phone, value: "+221 33 824 46 06", href: "tel:+221338244606" },
    { icon: "mail", label: t.email, value: "contact@maximerit.com", href: "mailto:contact@maximerit.com" },
    { icon: "mapPin", label: t.address, value: t.addressValue },
  ];
  return (
    <Page lang={lang}>
      <PageHero lang={lang} eyebrow={t.contactEyebrow} title={t.contactTitle} intro={t.contactIntro} compact />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
          <div className="grid gap-4">
            {cards.map((c) => (
              <div key={c.label} className="card flex items-start gap-4 p-5">
                <span className="icon-chip"><Icon name={c.icon} /></span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted">{c.label}</div>
                  {c.href ? (
                    <a href={c.href} className="mt-1 block break-words text-lg font-medium transition hover:text-brand">{c.value}</a>
                  ) : (
                    <div className="mt-1 text-lg font-medium leading-snug">{c.value}</div>
                  )}
                </div>
              </div>
            ))}
            <div className="card bg-surface p-5">
              <h2 className="font-semibold">{t.candidateTitle}</h2>
              <p className="mt-1 text-sm text-muted">{t.candidateBody}</p>
              <ArrowLink href={localePath(lang, "/candidats/deposer-mon-cv/")} className="mt-3">{t.candidateCta}</ArrowLink>
            </div>
          </div>
          <FormCard icon="briefcase" title={t.formTitle} intro={t.formIntro}>
            {lang === "en" ? <LeadForm source="contact-en" lang="en" ctaLabel="Send" /> : <LeadForm source="contact" />}
          </FormCard>
        </div>
      </Section>
      <LocationMap lang={lang} />
    </Page>
  );
}
