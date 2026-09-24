"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { counterpartPath } from "@/lib/i18n";

// Chemins disposant d'une version dans l'autre langue (forme FR canonique, préfixe /en retiré).
// Tout le reste (blog, guides, outils, offres CMS…) retombe sur l'accueil de la langue cible.
const MIRRORED_RE =
  /^\/(qui-nous-sommes|contact|entreprises|secteurs|mines|candidats|mentions-legales|politique-confidentialite)(\/|$)/;
// Dans /ressources, seul le blog est traduit (guides, outils… restent FR).
const MIRRORED_BLOG_RE = /^\/ressources\/blog(\/|$)/;

function isMirrored(pathname: string): boolean {
  const fr = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  return fr === "/" || MIRRORED_RE.test(fr) || MIRRORED_BLOG_RE.test(fr);
}

function LangSwitch({ isEn }: { isEn: boolean }) {
  const pathname = usePathname() || "/";
  const { locale, href } = counterpartPath(pathname);
  const target = isMirrored(pathname) ? href : locale === "en" ? "/en/" : "/";
  return (
    <Link href={target} className="text-sm font-semibold text-muted transition hover:text-brand" aria-label={isEn ? "Switch to French" : "Passer en anglais"}>
      {locale === "en" ? "EN" : "FR"}
    </Link>
  );
}

const NAV_FR = [
  { href: "/#expertises", label: "Entreprises" },
  { href: "/#secteurs", label: "Secteurs" },
  { href: "/mines/", label: "Mines & Resources" },
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
    <Link href={isEn ? "/en/" : "/"} className="flex flex-col leading-none" aria-label="Maximerit — home">
      <span className="text-2xl font-extrabold tracking-tight">
        <span className="text-brand">MAXI</span>
        <span className="text-foreground">MERIT</span>
      </span>
      <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
        {isEn ? "Advisory · Training · Recruitment" : "Conseil · Formation · Recrutement"}
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "/";
  const isEn = pathname === "/en" || pathname.startsWith("/en/");
  const nav = isEn ? NAV_EN : NAV_FR;
  const ctaHref = isEn ? "/en/contact/" : "/contact/";
  const ctaLabel = isEn ? "Hire with us" : "Confier un recrutement";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
        <Wordmark isEn={isEn} />
        <nav className="hidden items-center gap-6 lg:flex" aria-label={isEn ? "Main navigation" : "Navigation principale"}>
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm font-medium text-foreground/80 transition hover:text-brand">
              {n.label}
            </Link>
          ))}
          <LangSwitch isEn={isEn} />
          <Link href={ctaHref} className="rounded-[var(--radius)] bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
            {ctaLabel}
          </Link>
        </nav>
        <button
          type="button"
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius)] border border-border"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="text-xl">{open ? "✕" : "☰"}</span>
        </button>
      </div>
      {open && (
        <nav className="border-t border-border bg-background px-6 py-4 lg:hidden" aria-label={isEn ? "Mobile navigation" : "Navigation mobile"}>
          <ul className="flex flex-col gap-3">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="block text-sm font-medium" onClick={() => setOpen(false)}>{n.label}</Link>
              </li>
            ))}
            <li className="pt-1"><LangSwitch isEn={isEn} /></li>
            <li>
              <Link href={ctaHref} className="mt-1 inline-block rounded-[var(--radius)] bg-brand px-4 py-2 text-sm font-semibold text-white" onClick={() => setOpen(false)}>
                {ctaLabel}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
