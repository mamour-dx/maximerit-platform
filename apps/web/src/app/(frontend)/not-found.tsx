import Link from "next/link";

// 404 du site public : rendue dans le layout (frontend) (header/footer), pour tout notFound()
// levé par une page du site et pour les URL inconnues (captées par [...slug]).
// Le composant ne reçoit pas l'URL : message bilingue.
export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-24 text-center">
      <p className="font-display text-7xl font-bold text-brand">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Page introuvable</h1>
      <span className="mx-auto mt-3 block h-1 w-16 rounded bg-brand" />
      <p className="mt-4 text-muted">Cette page n&apos;existe pas ou a été déplacée.</p>
      <p className="mt-1 text-sm text-muted">Page not found — it may have been moved or deleted.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-[var(--radius)] bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">
          Retour à l&apos;accueil
        </Link>
        <Link href="/candidats/offres-demploi/" className="rounded-[var(--radius)] border border-border px-5 py-3 text-sm font-semibold transition hover:bg-surface">
          Voir les offres
        </Link>
        <Link href="/en/" className="rounded-[var(--radius)] border border-border px-5 py-3 text-sm font-semibold transition hover:bg-surface">
          English site
        </Link>
      </div>
    </main>
  );
}
