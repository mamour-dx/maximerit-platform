"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import type { FacetOption, JobFacets, JobFilters as Filters, Lang } from "@/lib/job-board";
import { jobsCopy } from "./copy";

// Formulaire GET : fonctionne sans JS (amélioration progressive). Avec JS : navigation client,
// paramètres vides retirés de l'URL, et les listes déroulantes filtrent dès le changement.

function Select({ name, label, all, options, value }: { name: keyof Filters; label: string; all: string; options: FacetOption[]; value: string }) {
  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</span>
      <select name={name} defaultValue={value} className="field">
        <option value="">{all}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label} ({o.count})
          </option>
        ))}
      </select>
    </label>
  );
}

export function JobFilters({ lang, filters, facets }: { lang: Lang; filters: Filters; facets: JobFacets }) {
  const t = jobsCopy(lang);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function go(form: HTMLFormElement) {
    const params = new URLSearchParams();
    for (const [k, v] of new FormData(form)) {
      if (typeof v === "string" && v.trim()) params.set(k, v.trim());
    }
    const qs = params.toString();
    startTransition(() => router.push(qs ? `${t.listingPath}?${qs}` : t.listingPath, { scroll: false }));
  }

  return (
    <form
      action={t.listingPath}
      method="get"
      role="search"
      aria-busy={pending}
      onSubmit={(e) => {
        e.preventDefault();
        go(e.currentTarget);
      }}
      onChange={(e) => {
        if ((e.target as HTMLElement).tagName === "SELECT") go(e.currentTarget);
      }}
      className="card grid grid-cols-2 items-end gap-3 p-4 sm:gap-4 sm:p-5 lg:grid-cols-[1.6fr_1fr_1fr_1fr_auto]"
    >
      <label className="col-span-2 grid gap-1.5 lg:col-span-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">{t.searchLabel}</span>
        <span className="relative">
          <Icon name="search" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input type="search" name="q" defaultValue={filters.q} placeholder={t.searchPlaceholder} className="field pl-10" maxLength={80} />
        </span>
      </label>
      <Select name="country" label={t.country} all={t.allCountries} options={facets.countries} value={filters.country} />
      <Select name="discipline" label={t.discipline} all={t.allDisciplines} options={facets.disciplines} value={filters.discipline} />
      <Select name="contract" label={t.contract} all={t.allContracts} options={facets.contracts} value={filters.contract} />
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
        ) : (
          <Icon name="search" size={18} />
        )}
        {t.submit}
      </button>
    </form>
  );
}
