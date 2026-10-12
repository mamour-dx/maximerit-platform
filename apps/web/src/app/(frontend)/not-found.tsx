import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

// 404 du site public : rendue dans le layout (frontend) (header/footer), pour tout notFound()
// levé par une page du site et pour les URL inconnues (captées par [...slug]).
// Le composant ne reçoit pas l'URL : message bilingue.
export default function NotFound() {
  return (
    <main className="hero-bg">
      <div className="container-page flex max-w-3xl flex-col items-center py-24 text-center sm:py-32">
        <p className="font-display text-[7rem] font-bold leading-none text-brand sm:text-[9rem]">404</p>
        <h1 className="mt-6 font-display text-3xl font-bold sm:text-4xl">Page introuvable</h1>
        <p className="mt-4 text-muted">Cette page n&apos;existe pas ou a été déplacée.</p>
        <p className="mt-1 text-sm text-muted">Page not found — it may have been moved or deleted.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            Retour à l&apos;accueil <Icon name="arrowRight" size={18} />
          </Link>
          <Link href="/candidats/offres-demploi/" className="btn btn-outline">Voir les offres</Link>
          <Link href="/en/" className="btn btn-outline">English site</Link>
        </div>
      </div>
    </main>
  );
}
