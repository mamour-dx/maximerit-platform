import Link from "next/link";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { isLive, type JobLike } from "@/lib/job";
import { EmptyState } from "@/components/ui/states";
import { hreflang } from "@/lib/i18n";
import { SetLang } from "@/components/site/SetLang";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Job openings",
  description: "Maximerit job openings — recruitment across West Africa, Mining & Resources vertical.",
  alternates: { canonical: "/en/candidats/offres-demploi/", languages: hreflang("/candidats/offres-demploi/", "/en/candidats/offres-demploi/") },
};

export default async function JobsListingEn() {
  const payload = await getPayload({ config });
  const res = await payload.find({ collection: "jobs", where: { status: { equals: "publiee" } }, limit: 100, depth: 0, sort: "-publishedAt" });
  const jobs = (res.docs as JobLike[]).filter((j) => isLive(j));

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <SetLang lang="en" />
      <h1 className="text-4xl font-bold">Job openings</h1>
      <p className="mt-3 text-lg text-muted">Recruitment across West Africa — Mining &amp; Resources and adjacent sectors.</p>

      {jobs.length === 0 ? (
        <div className="mt-10"><EmptyState title="No active openings right now" hint="Submit your CV to join our talent pool." action={<Link href="/en/candidats/deposer-mon-cv/" className="text-brand underline">Submit my CV</Link>} /></div>
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
