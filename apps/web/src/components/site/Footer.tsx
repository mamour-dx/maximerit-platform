import Link from "next/link";

const COLS = [
  {
    title: "Entreprises",
    links: [
      ["/entreprises/recrutement/", "Recrutement"],
      ["/entreprises/executive-search/", "Executive Search"],
      ["/entreprises/interim/", "Intérim & mise à disposition"],
      ["/mines/", "Recrutement minier"],
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

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <div className="text-xl font-extrabold tracking-tight">
            <span className="text-brand">MAXI</span><span className="text-foreground">MERIT</span>
          </div>
          <p className="mt-3 text-sm text-muted">
            Recrutement, executive search et vivier de talents en Afrique de l&apos;Ouest — spécialistes Mines &amp; Ressources.
          </p>
          <address className="mt-4 not-italic text-sm text-muted">
            <div>Sacré Cœur 3 Pyrotechnie, lot 115 — Dakar</div>
            <div className="mt-1"><a href="tel:+221338244606" className="hover:text-brand">+221 33 824 46 06</a></div>
            <div><a href="mailto:contact@maximerit.com" className="hover:text-brand">contact@maximerit.com</a></div>
          </address>
        </div>
        {COLS.map((c) => (
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
          <span>© {new Date().getFullYear()} Maximerit. Tous droits réservés.</span>
          <span className="flex gap-4">
            <Link href="/mentions-legales/" className="hover:text-brand">Mentions légales</Link>
            <Link href="/politique-confidentialite/" className="hover:text-brand">Confidentialité</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
