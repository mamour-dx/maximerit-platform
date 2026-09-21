import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { LeadForm } from "@/components/LeadForm";

export const dynamic = "force-dynamic";

type Args = { params: Promise<{ slug: string }> };

async function getLandingPage(slug: string) {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "landing-pages",
    where: { and: [{ slug: { equals: slug } }, { status: { equals: "published" } }] },
    limit: 1,
  });
  return res.docs[0] ?? null;
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const lp = await getLandingPage(slug);
  if (!lp) return {};
  return {
    title: (lp.seoTitle as string) || (lp.title as string),
    description: (lp.seoDescription as string) || (lp.promise as string) || undefined,
    robots: lp.indexable ? undefined : { index: false, follow: false },
    alternates: { canonical: `/lp/${slug}/` },
  };
}

export default async function LandingPageView({ params }: Args) {
  const { slug } = await params;
  const lp = await getLandingPage(slug);
  if (!lp) notFound();

  const profiles = (lp.profiles as { label?: string }[] | undefined) ?? [];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold leading-tight">{lp.title as string}</h1>
      {lp.promise ? <p className="mt-4 text-lg text-muted">{lp.promise as string}</p> : null}

      {lp.problem ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Le problème</h2>
          <p className="mt-2 text-muted">{lp.problem as string}</p>
        </section>
      ) : null}

      {profiles.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Profils recherchés</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {profiles.map((p, i) => (
              <li key={i} className="rounded-full border border-border bg-surface px-3 py-1 text-sm">{p.label}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {lp.method ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Notre méthode</h2>
          <p className="mt-2 text-muted">{lp.method as string}</p>
        </section>
      ) : null}

      {lp.proof ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Preuves</h2>
          <p className="mt-2 text-muted">{lp.proof as string}</p>
        </section>
      ) : null}

      <section className="mt-12 rounded-[var(--radius)] border border-border p-6">
        <h2 className="text-2xl font-bold">Parlons de votre besoin</h2>
        <p className="mt-1 mb-5 text-sm text-muted">Réponse rapide d&apos;un consultant spécialisé.</p>
        <LeadForm slug={slug} landingPageId={lp.id as number} ctaLabel={(lp.ctaLabel as string) || undefined} />
      </section>
    </main>
  );
}
