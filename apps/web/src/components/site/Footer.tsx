"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const COLS_FR = [
  {
    title: "Entreprises",
    links: [
      ["/entreprises/recrutement/", "Recrutement"],
      ["/entreprises/executive-search/", "Executive Search"],
      ["/entreprises/interim/", "Intérim & mise à disposition"],
      ["/mines/recrutement-minier/", "Recrutement minier"],
    ],
  },
  {
    title: "Candidats",
    links: [
      ["/candidats/offres-demploi/", "Offres d'emploi"],
      ["/candidats/deposer-mon-cv/", "Déposer mon CV"],
      ["/candidats/rejoindre-le-vivier/", "Rejoindre le vivier"],
    ],
  },
  {
    title: "Ressources",
    links: [
      ["/ressources/blog/", "Blog"],
      ["/ressources/guides/", "Guides"],
      ["/ressources/outils/benchmark-salaire/", "Outils gratuits"],
    ],
  },
];

const COLS_EN = [
  {
    title: "For employers",
    links: [
      ["/en/entreprises/recrutement/", "Recruitment"],
      ["/en/entreprises/executive-search/", "Executive Search"],
      ["/en/entreprises/interim/", "Contract staffing"],
      ["/en/mines/recrutement-minier/", "Mining recruitment"],
    ],
  },
  {
    title: "Candidates",
    links: [
      ["/en/candidats/offres-demploi/", "Job openings"],
      ["/en/candidats/deposer-mon-cv/", "Submit my CV"],
      ["/en/candidats/rejoindre-le-vivier/", "Join the talent pool"],
    ],
  },
  {
    title: "Company",
    links: [
      ["/en/qui-nous-sommes/", "About us"],
      ["/en/ressources/blog/", "Blog"],
      ["/en/secteurs/", "Sectors"],
      ["/en/contact/", "Contact"],
    ],
  },
];

const COPY = {
  fr: {
    tagline: "Recrutement, executive search et vivier de talents en Afrique de l'Ouest — spécialistes Mines & Ressources.",
    rights: "Tous droits réservés.",
    legal: "Mentions légales", privacy: "Confidentialité",
    legalHref: "/mentions-legales/", privacyHref: "/politique-confidentialite/",
  },
  en: {
    tagline: "Recruitment, executive search and a talent pool in West Africa — Mining & Resources specialists.",
    rights: "All rights reserved.",
    legal: "Legal notice", privacy: "Privacy",
    legalHref: "/en/mentions-legales/", privacyHref: "/en/politique-confidentialite/",
  },
} as const;

export function SiteFooter() {
  const pathname = usePathname() || "/";
  const isEn = pathname === "/en" || pathname.startsWith("/en/");
  const cols = isEn ? COLS_EN : COLS_FR;
  const t = isEn ? COPY.en : COPY.fr;

  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <Image src="/maximerit-logo.png" alt="Maximerit" width={493} height={93} className="h-9 w-auto" />
          <p className="mt-3 text-sm text-muted">{t.tagline}</p>
          <address className="mt-4 not-italic text-sm text-muted">
            <div>Sacré Cœur 3 Pyrotechnie, lot 115 — Dakar</div>
            <div className="mt-1"><a href="tel:+221338244606" className="hover:text-brand">+221 33 824 46 06</a></div>
            <div><a href="mailto:contact@maximerit.com" className="hover:text-brand">contact@maximerit.com</a></div>
          </address>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h3 className="text-sm font-semibold">{c.title}</h3>
            <ul className="mt-3 space-y-2">
              {c.links.map(([href, label]) => (
                <li key={href}><Link href={href} className="text-sm text-muted hover:text-brand">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-6 py-4 text-xs text-muted sm:flex-row">
          <span>© {new Date().getFullYear()} Maximerit. {t.rights}</span>
          <span className="flex gap-4">
            <Link href={t.legalHref} className="hover:text-brand">{t.legal}</Link>
            <Link href={t.privacyHref} className="hover:text-brand">{t.privacy}</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
