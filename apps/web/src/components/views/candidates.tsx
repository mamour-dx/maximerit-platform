import Link from "next/link";
import { ApplyForm } from "@/components/ApplyForm";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ArrowLink, CheckList, CtaBand, FormCard, InfoCard, Page, PageHero, Section, SectionHeading } from "@/components/site/PageKit";
import { localePath, type Locale } from "@/lib/i18n";

// Parcours candidat (FR/EN) : dépôt de CV, vivier, conseils carrière.

const C = {
  fr: {
    candidates: "Candidats",
    cvTitle: "Déposer mon CV",
    cvIntro: "Rendez-vous visible auprès des entreprises qui recrutent dans la région — même avant l'ouverture officielle d'un poste.",
    cvFormTitle: "Votre candidature",
    cvFormIntro: "CV requis (PDF/DOCX). Vos données rejoignent notre vivier avec votre consentement.",
    nextTitle: "Et ensuite ?",
    next: [
      ["Analyse de votre profil", "Votre CV est lu et structuré : métier, expérience, mobilité, langues."],
      ["Visibilité auprès des consultants", "Votre profil est consulté à chaque nouvelle mission qui correspond."],
      ["Prise de contact", "Un consultant vous contacte dès qu'une opportunité est en ligne avec vos attentes."],
    ],
    poolTitle: "Rejoindre le vivier",
    poolIntro: "Le vivier Maximerit est un actif : plus votre profil est qualifié, plus nous pouvons vous proposer les bonnes opportunités.",
    poolBenefits: [
      "Être identifié pour des postes avant leur publication",
      "Un profil qualifié et exploitable, pas un CV oublié",
      "Des opportunités ciblées sur votre métier et votre mobilité",
    ],
    poolFormTitle: "Intégrer le vivier",
    poolFormIntro: "CV requis (PDF/DOCX) + consentement au traitement de vos données.",
    adviceTitle: "Conseils carrière",
    adviceIntro: "Quelques repères pour mettre votre profil en valeur auprès des recruteurs du secteur minier et de l'industrie.",
    advice: [
      ["Un CV structuré et daté", "Faites ressortir vos expériences par projet, commodity, type de mine et pays."],
      ["Vos compétences clés", "Certifications, langues, mobilité et disponibilité : des critères décisifs pour nos clients."],
      ["Restez visible", "Déposez votre CV dans notre vivier et tenez votre profil à jour."],
    ],
    viewJobs: "Voir les offres",
    privacy: "Vos données sont protégées",
    privacyBody: "Votre CV n'est jamais public : il est réservé à l'équipe de recrutement.",
    privacyLink: "Politique de confidentialité",
    ctaTitle: "Prêt pour votre prochain poste ?",
    ctaBody: "Consultez les offres ouvertes ou déposez votre CV dès aujourd'hui.",
  },
  en: {
    candidates: "Candidates",
    cvTitle: "Submit my CV",
    cvIntro: "Become visible to companies hiring across the region — even before a role is officially opened.",
    cvFormTitle: "Your application",
    cvFormIntro: "CV required (PDF/DOCX). Your data joins our talent pool with your consent.",
    nextTitle: "What happens next?",
    next: [
      ["Profile review", "Your CV is read and structured: role, experience, mobility, languages."],
      ["Visibility with our consultants", "Your profile is reviewed for every new brief that matches."],
      ["We get in touch", "A consultant reaches out as soon as an opportunity fits your goals."],
    ],
    poolTitle: "Join the talent pool",
    poolIntro: "The Maximerit talent pool is an asset: the more qualified your profile, the better the opportunities we can offer you.",
    poolBenefits: [
      "Be identified for roles before they are published",
      "A qualified, actionable profile — not a forgotten CV",
      "Opportunities targeted to your role and mobility",
    ],
    poolFormTitle: "Join the pool",
    poolFormIntro: "CV required (PDF/DOCX) + consent to the processing of your data.",
    adviceTitle: "Career advice",
    adviceIntro: "A few pointers to make your profile stand out to recruiters in mining and industry.",
    advice: [
      ["A structured, dated CV", "Bring out your experience by project, commodity, mine type and country."],
      ["Your key skills", "Certifications, languages, mobility and availability: decisive criteria for our clients."],
      ["Stay visible", "Add your CV to our talent pool and keep your profile up to date."],
    ],
    viewJobs: "View jobs",
    privacy: "Your data is protected",
    privacyBody: "Your CV is never public: it is restricted to the recruitment team.",
    privacyLink: "Privacy policy",
    ctaTitle: "Ready for your next role?",
    ctaBody: "Browse open roles or submit your CV today.",
  },
} as const;

const ADVICE_ICONS: IconName[] = ["file", "target", "sparkle"];

function PrivacyNote({ lang }: { lang: Locale }) {
  const t = C[lang];
  return (
    <div className="card flex gap-4 bg-surface p-5">
      <span className="icon-chip"><Icon name="lock" /></span>
      <div>
        <p className="font-semibold">{t.privacy}</p>
        <p className="mt-1 text-sm text-muted">{t.privacyBody}</p>
        <ArrowLink href={localePath(lang, "/politique-confidentialite/")} className="mt-2">{t.privacyLink}</ArrowLink>
      </div>
    </div>
  );
}

function CandidateCta({ lang }: { lang: Locale }) {
  const t = C[lang];
  return <CtaBand lang={lang} title={t.ctaTitle} body={t.ctaBody} primary={{ label: t.viewJobs, href: localePath(lang, "/candidats/offres-demploi/") }} />;
}

export function SubmitCvPage({ lang }: { lang: Locale }) {
  const t = C[lang];
  return (
    <Page lang={lang}>
      <PageHero lang={lang} eyebrow={t.candidates} title={t.cvTitle} intro={t.cvIntro} compact />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
          <FormCard title={t.cvFormTitle} intro={t.cvFormIntro}>
            <ApplyForm lang={lang} />
          </FormCard>
          <aside className="grid gap-5 lg:sticky lg:top-24">
            <div className="card p-6">
              <h2 className="text-lg font-semibold">{t.nextTitle}</h2>
              <ol className="mt-5 grid gap-5">
                {t.next.map(([title, body], i) => (
                  <li key={title} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">{i + 1}</span>
                    <div>
                      <p className="font-semibold">{title}</p>
                      <p className="mt-0.5 text-sm text-muted">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <PrivacyNote lang={lang} />
          </aside>
        </div>
      </Section>
      <CandidateCta lang={lang} />
    </Page>
  );
}

export function JoinPoolPage({ lang }: { lang: Locale }) {
  const t = C[lang];
  return (
    <Page lang={lang}>
      <PageHero lang={lang} eyebrow={t.candidates} title={t.poolTitle} intro={t.poolIntro} compact>
        <CheckList items={t.poolBenefits} className="rise-in rise-in-delay mt-8 max-w-xl" />
      </PageHero>
      <Section>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
          <FormCard icon="users" title={t.poolFormTitle} intro={t.poolFormIntro}>
            <ApplyForm lang={lang} />
          </FormCard>
          <aside className="grid gap-5 lg:sticky lg:top-24">
            <PrivacyNote lang={lang} />
            <div className="card p-6">
              <h2 className="font-semibold">{t.adviceTitle}</h2>
              <p className="mt-1 text-sm text-muted">{t.adviceIntro}</p>
              <ArrowLink href={localePath(lang, "/candidats/conseils-carriere/")} className="mt-3">{t.adviceTitle}</ArrowLink>
            </div>
          </aside>
        </div>
      </Section>
      <CandidateCta lang={lang} />
    </Page>
  );
}

export function CareerAdvicePage({ lang }: { lang: Locale }) {
  const t = C[lang];
  return (
    <Page lang={lang}>
      <PageHero
        lang={lang}
        eyebrow={t.candidates}
        title={t.adviceTitle}
        intro={t.adviceIntro}
        actions={
          <>
            <Link href={localePath(lang, "/candidats/deposer-mon-cv/")} className="btn btn-primary">{t.cvTitle} <Icon name="arrowRight" size={18} /></Link>
            <Link href={localePath(lang, "/candidats/offres-demploi/")} className="btn btn-outline">{t.viewJobs}</Link>
          </>
        }
      />
      <Section>
        <ul className="grid gap-5 md:grid-cols-3">
          {t.advice.map(([title, body], i) => (
            <li key={title}><InfoCard icon={ADVICE_ICONS[i]} title={title} body={body} /></li>
          ))}
        </ul>
      </Section>
      <Section tone="surface">
        <SectionHeading title={t.poolTitle} intro={t.poolIntro} action={<Link href={localePath(lang, "/candidats/rejoindre-le-vivier/")} className="btn btn-primary">{t.poolFormTitle}</Link>} />
      </Section>
      <CandidateCta lang={lang} />
    </Page>
  );
}
