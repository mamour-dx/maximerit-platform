import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { contractLabel, countryLabel, disciplineLabel, isNew, postedLabel, type BoardJob, type Lang } from "@/lib/job-board";
import { jobsCopy } from "./copy";

/** Carte d'offre : toute la carte est cliquable (lien sur le titre étendu via ::after). */
export function JobCard({ job, lang, compact = false }: { job: BoardJob; lang: Lang; compact?: boolean }) {
  const t = jobsCopy(lang);
  const place = [job.location, countryLabel(job.country, lang)].filter(Boolean).join(", ");
  const discipline = disciplineLabel(job.discipline, lang);
  const contract = contractLabel(job.contractType, lang);

  return (
    <article className="card card-hover group relative flex gap-4 p-5 sm:p-6">
      <span className="icon-chip hidden sm:inline-flex" aria-hidden="true">
        <Icon name={job.discipline === "finance-miniere" ? "chart" : job.discipline === "leadership-executive-search" ? "users" : "pickaxe"} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {discipline ? <span className="chip">{discipline}</span> : null}
          {isNew(job.publishedAt) ? <span className="chip chip-brand">{t.newBadge}</span> : null}
        </div>
        <h3 className={`mt-2 font-semibold leading-snug ${compact ? "text-base" : "text-lg"}`}>
          <Link href={t.jobPath(job.slug ?? "")} className="after:absolute after:inset-0 after:content-[''] group-hover:text-brand">
            {job.title}
          </Link>
        </h3>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          {place ? <li className="inline-flex items-center gap-1.5"><Icon name="mapPin" size={16} />{place}</li> : null}
          {contract ? <li className="inline-flex items-center gap-1.5"><Icon name="briefcase" size={16} />{contract}</li> : null}
          {!compact && job.publishedAt ? <li className="inline-flex items-center gap-1.5"><Icon name="clock" size={16} />{postedLabel(job.publishedAt, lang)}</li> : null}
        </ul>
        {!compact && job.mission ? <p className="mt-3 line-clamp-2 text-sm text-muted">{job.mission}</p> : null}
      </div>
      <span className="hidden self-center text-muted transition group-hover:translate-x-1 group-hover:text-brand sm:block" aria-hidden="true">
        <Icon name="arrowRight" />
      </span>
    </article>
  );
}
