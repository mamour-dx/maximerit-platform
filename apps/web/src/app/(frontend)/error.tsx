"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

// Filet de sécurité du site public : toute erreur de rendu inattendue affiche cette page
// (dans le layout, header/footer conservés) au lieu de l'écran d'erreur brut du navigateur.
export default function FrontendError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="hero-bg">
      <div className="container-page flex max-w-3xl flex-col items-center py-24 text-center sm:py-32">
        <span className="icon-chip h-14 w-14"><Icon name="clock" size={26} /></span>
        <h1 className="mt-6 font-display text-3xl font-bold sm:text-4xl">Un problème est survenu</h1>
        <p className="mt-4 text-muted">Cette page n&apos;a pas pu se charger. Réessayez dans un instant.</p>
        <p className="mt-1 text-sm text-muted">Something went wrong loading this page. Please try again.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => reset()} className="btn btn-primary">Réessayer / Retry</button>
          <Link href="/" className="btn btn-outline">Accueil</Link>
          <Link href="/contact/" className="btn btn-outline">Contact</Link>
        </div>
      </div>
    </main>
  );
}
