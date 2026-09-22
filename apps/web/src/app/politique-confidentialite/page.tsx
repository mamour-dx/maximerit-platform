import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité et traitement des données personnelles chez Maximerit.",
  alternates: { canonical: "/politique-confidentialite/" },
  robots: { index: false },
};

const SECTIONS = [
  ["Données collectées", "Coordonnées (nom, email, téléphone), informations professionnelles et CV que vous nous transmettez, ainsi que des données de navigation en cas de consentement à la mesure d'audience."],
  ["Finalités", "Traitement des candidatures, constitution et gestion du vivier de talents, mise en relation avec des opportunités, réponse aux demandes des entreprises, amélioration du site."],
  ["Base légale & consentement", "Votre consentement explicite est recueilli pour le dépôt de CV et pour la mesure d'audience. Aucune mesure d'audience n'est effectuée avant votre accord."],
  ["Conservation", "Les données candidats sont conservées le temps nécessaire à la relation, puis archivées ou supprimées selon notre politique de conservation."],
  ["Vos droits", "Accès, rectification, suppression et export de vos données. Contactez-nous à contact@maximerit.com pour exercer ces droits."],
  ["Sécurité", "Les CV sont stockés de façon sécurisée et ne sont jamais accessibles publiquement. Les accès sont restreints à l'équipe de recrutement."],
];

export default function Confidentialite() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-bold">Politique de confidentialité</h1>
      <div className="mt-8 space-y-6">
        {SECTIONS.map(([t, d]) => (
          <section key={t}>
            <h2 className="text-xl font-semibold">{t}</h2>
            <p className="mt-1 text-muted">{d}</p>
          </section>
        ))}
        <p className="text-xs text-muted">Document à faire valider juridiquement avant mise en production.</p>
      </div>
    </main>
  );
}
