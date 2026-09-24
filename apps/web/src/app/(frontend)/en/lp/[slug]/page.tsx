import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { LeadForm } from "@/components/LeadForm";
import { hreflang } from "@/lib/i18n";
import { SetLang } from "@/components/site/SetLang";

export const dynamic = "force-dynamic";

type Args = { params: Promise<{ slug: string }> };

async function getLandingPage(slug: string) {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "landing-pages",
    where: { and: [{ slug: { equals: slug } }, { status: { equals: "published" } }] },
    limit: 1,
    locale: "en",
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
    alternates: { canonical: `/en/lp/${slug}/`, languages: hreflang(`/lp/${slug}/`, `/en/lp/${slug}/`) },
  };
}

export default async function LandingPageViewEn({ params }: Args) {
  const { slug } = await params;
  const lp = await getLandingPage(slug);
  if (!lp) notFound();

  const profiles = (lp.profiles as { label?: string }[] | undefined) ?? [];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <SetLang lang="en" />
      <h1 className="text-4xl font-bold leading-tight">{lp.title as string}</h1>
      {lp.promise ? <p className="mt-4 text-lg text-muted">{lp.promise as string}</p> : null}

      {lp.problem ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">The problem</h2>
          <p className="mt-2 text-muted">{lp.problem as string}</p>
        </section>
      ) : null}

      {profiles.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Profiles we recruit</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {profiles.map((p, i) => (
              <li key={i} className="rounded-full border border-border bg-surface px-3 py-1 text-sm">{p.label}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {lp.method ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Our method</h2>
          <p className="mt-2 text-muted">{lp.method as string}</p>
        </section>
      ) : null}

      {lp.proof ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Proof</h2>
          <p className="mt-2 text-muted">{lp.proof as string}</p>
        </section>
      ) : null}

      <section className="mt-12 rounded-[var(--radius)] border border-border p-6">
        <h2 className="text-2xl font-bold">Let&apos;s talk about your need</h2>
        <p className="mt-1 mb-5 text-sm text-muted">A quick reply from a specialist consultant.</p>
        <LeadForm source={`lp:${slug}`} landingPageId={lp.id as number} lang="en" ctaLabel={(lp.ctaLabel as string) || undefined} />
      </section>
    </main>
  );
}
