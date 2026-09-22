import Link from "next/link";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { isLive, type JobLike } from "@/lib/job";
import { EmptyState } from "@/components/ui/states";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Offres d'emploi",
  description: "Offres d'emploi Maximerit — recrutement en Afrique de l'Ouest, verticale Mines & Ressources.",
  alternates: { canonical: "/candidats/offres-demploi/" },
};

export default async function JobsListing() {
  const payload = await getPayload({ config });
  const res = await payload.find({ collection: "jobs", where: { status: { equals: "publiee" } }, limit: 100, depth: 0, sort: "-publishedAt" });
  const jobs = (res.docs as JobLike[]).filter((j) => isLive(j));

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-bold">Offres d&apos;emploi</h1>
      <p className="mt-3 text-lg text-muted">Recrutement en Afrique de l&apos;Ouest — Mines &amp; Ressources et secteurs adjacents.</p>

      {jobs.length === 0 ? (
        <div className="mt-10"><EmptyState title="Aucune offre active pour le moment" hint="Déposez votre CV pour rejoindre notre vivier." action={<Link href="/candidats/deposer-mon-cv/" className="text-brand underline">Déposer mon CV</Link>} /></div>
      ) : (
        <ul className="mt-10 divide-y divide-border">
          {jobs.map((j) => (
            <li key={j.id} className="py-4">
              <Link href={`/jobs/${j.slug}/`} className="text-xl font-semibold hover:text-brand">{j.title}</Link>
              <p className="mt-1 text-sm text-muted">{[j.location, j.country, j.contractType].filter(Boolean).join(" · ")}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
