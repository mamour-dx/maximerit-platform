import { Page, PageHero } from "@/components/site/PageKit";
import type { Locale } from "@/lib/i18n";

// Pages légales (FR/EN) : mentions légales, politique de confidentialité. Non indexées.

const C = {
  fr: {
    legal: "Informations légales",
    noticeTitle: "Mentions légales",
    notice: [
      ["Éditeur", "Maximerit — Conseil, Formation, Recrutement. Sacré Cœur 3 Pyrotechnie, lot 115, Dakar, Sénégal."],
      ["Contact", "+221 33 824 46 06 — contact@maximerit.com."],
      ["Hébergement", "À compléter (fournisseur d'hébergement de production)."],
      ["Propriété intellectuelle", "L'ensemble des contenus du site est la propriété de Maximerit, sauf mention contraire."],
    ],
    privacyTitle: "Politique de confidentialité",
    privacy: [
      ["Données collectées", "Coordonnées (nom, email, téléphone), informations professionnelles, CV et lettre de motivation que vous nous transmettez, ainsi que des données de navigation en cas de consentement à la mesure d'audience."],
      ["Finalités", "Traitement des candidatures, constitution et gestion du vivier de talents, mise en relation avec des opportunités, réponse aux demandes des entreprises, amélioration du site."],
      ["Base légale & consentement", "Votre consentement explicite est recueilli pour le dépôt de CV et pour la mesure d'audience. Aucune mesure d'audience n'est effectuée avant votre accord."],
      ["Conservation", "Les données candidats sont conservées le temps nécessaire à la relation, puis archivées ou supprimées selon notre politique de conservation."],
      ["Vos droits", "Accès, rectification, suppression et export de vos données. Contactez-nous à contact@maximerit.com pour exercer ces droits."],
      ["Sécurité", "Les CV sont stockés de façon sécurisée et ne sont jamais accessibles publiquement. Les accès sont restreints à l'équipe de recrutement."],
      ["Prestataires techniques", "Le site est hébergé par Vercel ; les CV et lettres de motivation sont conservés dans un espace de stockage privé Vercel Blob, accessible uniquement à l'équipe de recrutement. Les formulaires sont protégés contre les robots par Cloudflare Turnstile, qui analyse des signaux techniques de votre navigateur sans déposer de cookie de suivi."],
    ],
    draft: "Document à faire valider juridiquement avant mise en production.",
    toc: "Sommaire",
  },
  en: {
    legal: "Legal information",
    noticeTitle: "Legal notice",
    notice: [
      ["Publisher", "Maximerit — Advisory, Training, Recruitment. Sacré Cœur 3 Pyrotechnie, lot 115, Dakar, Senegal."],
      ["Contact", "+221 33 824 46 06 — contact@maximerit.com."],
      ["Hosting", "To be completed (production hosting provider)."],
      ["Intellectual property", "All site content is the property of Maximerit unless otherwise stated."],
    ],
    privacyTitle: "Privacy policy",
    privacy: [
      ["Data collected", "Contact details (name, email, phone), professional information, the CV and cover letter you send us, plus browsing data where you consent to audience measurement."],
      ["Purposes", "Processing applications, building and managing the talent pool, matching with opportunities, responding to company requests, improving the site."],
      ["Legal basis & consent", "Your explicit consent is collected for CV submission and for audience measurement. No audience measurement is performed before your agreement."],
      ["Retention", "Candidate data is kept for as long as necessary for the relationship, then archived or deleted according to our retention policy."],
      ["Your rights", "Access, rectification, deletion and export of your data. Contact us at contact@maximerit.com to exercise these rights."],
      ["Security", "CVs are stored securely and are never publicly accessible. Access is restricted to the recruitment team."],
      ["Technical providers", "The site is hosted by Vercel; CVs and cover letters are kept in private Vercel Blob storage, accessible only to the recruitment team. Forms are protected against bots by Cloudflare Turnstile, which analyses technical signals from your browser without setting tracking cookies."],
    ],
    draft: "Document to be legally reviewed before going live.",
    toc: "Contents",
  },
} as const;

const anchor = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function LegalDoc({ lang, title, sections }: { lang: Locale; title: string; sections: readonly (readonly [string, string])[] }) {
  const t = C[lang];
  return (
    <Page lang={lang}>
      <PageHero lang={lang} eyebrow={t.legal} title={title} compact />
      <div className="container-page grid gap-12 py-14 sm:py-16 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label={t.toc} className="hidden lg:block">
          <div className="sticky top-24">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t.toc}</p>
            <ol className="mt-3 grid gap-2 border-l border-border text-sm">
              {sections.map(([h]) => (
                <li key={h}>
                  <a href={`#${anchor(h)}`} className="-ml-px block border-l border-transparent pl-4 text-muted transition hover:border-brand hover:text-brand">{h}</a>
                </li>
              ))}
            </ol>
          </div>
        </nav>
        <div className="max-w-3xl">
          <div className="grid gap-10">
            {sections.map(([h, body]) => (
              <section key={h} id={anchor(h)} className="scroll-mt-24">
                <h2 className="font-display text-2xl font-bold">{h}</h2>
                <p className="mt-3 leading-relaxed text-foreground/80">{body}</p>
              </section>
            ))}
          </div>
          <p className="mt-12 rounded-[var(--radius)] border border-dashed border-border p-4 text-xs text-muted">{t.draft}</p>
        </div>
      </div>
    </Page>
  );
}

export function LegalNoticePage({ lang }: { lang: Locale }) {
  return <LegalDoc lang={lang} title={C[lang].noticeTitle} sections={C[lang].notice} />;
}

export function PrivacyPage({ lang }: { lang: Locale }) {
  return <LegalDoc lang={lang} title={C[lang].privacyTitle} sections={C[lang].privacy} />;
}
