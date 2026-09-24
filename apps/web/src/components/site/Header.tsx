"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { counterpartPath } from "@/lib/i18n";

// Pages disposant d'une version dans l'autre langue (sinon repli sur l'accueil de la langue cible).
const MIRRORED = new Set(["/", "/contact/", "/en/", "/en/contact/"]);
// Tout le silo Mining est mirroré (FR /mines/** ↔ EN /en/mines/**).
const MIRRORED_RE = /^\/(en\/)?mines(\/|$)/;

function LangSwitch() {
  const pathname = usePathname() || "/";
  const { locale, href } = counterpartPath(pathname);
  const mirrored = MIRRORED.has(pathname) || MIRRORED_RE.test(pathname);
  const target = mirrored ? href : locale === "en" ? "/en/" : "/";
  return (
    <Link href={target} className="text-sm font-semibold text-muted transition hover:text-brand" aria-label={`Passer en ${locale === "en" ? "anglais" : "français"}`}>
      {locale === "en" ? "EN" : "FR"}
    </Link>
  );
}

const NAV = [
  { href: "/#expertises", label: "Entreprises" },
  { href: "/#secteurs", label: "Secteurs" },
  { href: "/mines/", label: "Mines & Resources" },
  { href: "/candidats/offres-demploi/", label: "Offres" },
  { href: "/ressources/blog/", label: "Ressources" },
  { href: "/contact/", label: "Contact" },
];

function Wordmark() {
  return (
    <Link href="/" className="flex flex-col leading-none" aria-label="Maximerit — accueil">
      <span className="text-2xl font-extrabold tracking-tight">
        <span className="text-brand">MAXI</span>
        <span className="text-foreground">MERIT</span>
      </span>
      <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
        Conseil · Formation · Recrutement
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
        <Wordmark />
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Navigation principale">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm font-medium text-foreground/80 transition hover:text-brand">
              {n.label}
            </Link>
          ))}
          <LangSwitch />
          <Link href="/contact/" className="rounded-[var(--radius)] bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
            Confier un recrutement
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
        <nav className="border-t border-border bg-background px-6 py-4 lg:hidden" aria-label="Navigation mobile">
          <ul className="flex flex-col gap-3">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="block text-sm font-medium" onClick={() => setOpen(false)}>{n.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/contact/" className="mt-1 inline-block rounded-[var(--radius)] bg-brand px-4 py-2 text-sm font-semibold text-white" onClick={() => setOpen(false)}>
                Confier un recrutement
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
