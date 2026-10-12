import type { Metadata } from "next";
import { JobBoard } from "@/components/jobs/JobBoard";
import { getPublishedJobs } from "@/components/jobs/data";
import { hasActiveFilters, parseJobFilters } from "@/lib/job-board";
import { hreflang } from "@/lib/i18n";
import { SetLang } from "@/components/site/SetLang";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const filters = parseJobFilters(await searchParams);
  return {
    title: "Job openings",
    description: "Maximerit job openings — recruitment across West Africa, Mining & Resources vertical.",
    alternates: { canonical: "/en/candidats/offres-demploi/", languages: hreflang("/candidats/offres-demploi/", "/en/candidats/offres-demploi/") },
    robots: hasActiveFilters(filters) ? { index: false, follow: true } : undefined,
  };
}

export default async function JobsListingEn({ searchParams }: Props) {
  const [filters, jobs] = await Promise.all([searchParams.then(parseJobFilters), getPublishedJobs("en")]);
  return (
    <>
      <SetLang lang="en" />
      <JobBoard lang="en" jobs={jobs} filters={filters} />
    </>
  );
}
