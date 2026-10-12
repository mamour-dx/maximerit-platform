"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { counterpartPath } from "@/lib/i18n";
import { Icon } from "@/components/ui/Icon";

// Chemins disposant d'une version dans l'autre langue (forme FR canonique, préfixe /en retiré).
// Tout le reste (blog, guides, outils, offres CMS…) retombe sur l'accueil de la langue cible.
const MIRRORED_RE =
  /^\/(qui-nous-sommes|contact|entreprises|secteurs|mines|candidats|jobs|lp|mentions-legales|politique-confidentialite)(\/|$)/;
// Tout /ressources est traduit (blog, guides/études/baromètres, outils).
const MIRRORED_RESOURCES_RE = /^\/ressources\/(blog|guides|etudes|barometres|outils)(\/|$)/;

function isMirrored(pathname: string): boolean {
  const fr = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  return fr === "/" || MIRRORED_RE.test(fr) || MIRRORED_RESOURCES_RE.test(fr);
}

function LangSwitch({ isEn }: { isEn: boolean }) {
  const pathname = usePathname() || "/";
  const { locale, href } = counterpartPath(pathname);
  const target = isMirrored(pathname) ? href : locale === "en" ? "/en/" : "/";
  return (
    <Link
      href={target}
      className="inline-flex h-8 items-center rounded-full border border-border px-3 text-xs font-semibold tracking-wider text-muted transition hover:border-brand hover:text-brand"
      aria-label={isEn ? "Switch to French" : "Passer en anglais"}
    >
      {locale === "en" ? "EN" : "FR"}
    </Link>
  );
}

const NAV_FR = [
  { href: "/#expertises", label: "Entreprises" },
  { href: "/#secteurs", label: "Secteurs" },
  { href: "/mines/", label: "Mines & Ressources" },
  { href: "/candidats/offres-demploi/", label: "Offres" },
  { href: "/ressources/blog/", label: "Ressources" },
  { href: "/contact/", label: "Contact" },
];
const NAV_EN = [
  { href: "/en/entreprises/", label: "For employers" },
  { href: "/en/secteurs/", label: "Sectors" },
  { href: "/en/mines/", label: "Mining & Resources" },
  { href: "/en/candidats/offres-demploi/", label: "Jobs" },
  { href: "/en/ressources/blog/", label: "Resources" },
  { href: "/en/contact/", label: "Contact" },
];

function Wordmark({ isEn }: { isEn: boolean }) {
  return (
    <Link href={isEn ? "/en/" : "/"} className="inline-flex items-center" aria-label="Maximerit — Conseil, Formation, Recrutement">
      <Image
        src="/maximerit-logo.png"
        alt="Maximerit"
        width={493}
        height={93}
        loading="eager"
        fetchPriority="high"
        className="h-9 w-auto sm:h-10"
      />
    </Link>
  );
}

/** Lien actif : même section (les ancres de l'accueil ne sont jamais « actives »). */
function isActive(pathname: string, href: string): boolean {
  if (href.includes("#")) return false;
  return pathname === href || (href !== "/" && href !== "/en/" && pathname.startsWith(href));
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "/";
  const isEn = pathname === "/en" || pathname.startsWith("/en/");
  const nav = isEn ? NAV_EN : NAV_FR;
  const ctaHref = isEn ? "/en/contact/" : "/contact/";
  const ctaLabel = isEn ? "Hire with us" : "Confier un recrutement";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="container-page flex h-16 items-center justify-between gap-6 lg:h-[72px]">
        <Wordmark isEn={isEn} />
        <nav className="hidden items-center gap-1 lg:flex" aria-label={isEn ? "Main navigation" : "Navigation principale"}>
          {nav.map((n) => {
            const active = isActive(pathname, n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`relative whitespace-nowrap rounded-full px-2.5 py-2 text-sm font-medium transition hover:bg-surface hover:text-brand xl:px-3 ${active ? "text-brand" : "text-foreground/75"}`}
              >
                {n.label}
                {active ? <span className="absolute inset-x-2.5 -bottom-[17px] h-0.5 rounded-full bg-brand xl:inset-x-3" aria-hidden="true" /> : null}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <LangSwitch isEn={isEn} />
          <Link href={ctaHref} className="btn btn-primary btn-sm hidden xl:inline-flex">
            {ctaLabel}
          </Link>
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius)] border border-border transition hover:border-foreground lg:hidden"
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <Icon name="x" /> : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          )}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" className="border-t border-border bg-background lg:hidden" aria-label={isEn ? "Mobile navigation" : "Navigation mobile"}>
          <ul className="container-page grid gap-1 py-4">
            {nav.map((n) => {
              const active = isActive(pathname, n.href);
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center justify-between rounded-[var(--radius)] px-3 py-3 text-base font-medium transition hover:bg-surface ${active ? "bg-surface text-brand" : ""}`}
                    onClick={() => setOpen(false)}
                  >
                    {n.label}
                    <Icon name="arrowRight" size={16} className="text-muted" />
                  </Link>
                </li>
              );
            })}
            <li className="mt-3 flex items-center gap-3 border-t border-border pt-4">
              <LangSwitch isEn={isEn} />
              <Link href={ctaHref} className="btn btn-primary flex-1" onClick={() => setOpen(false)}>
                {ctaLabel}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
