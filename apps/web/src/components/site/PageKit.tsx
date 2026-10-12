import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SetLang } from "@/components/site/SetLang";
import { localePath, type Locale } from "@/lib/i18n";

// Briques de mise en page partagées par toutes les pages du site public (FR/EN).
// Composants serveur, sans état : ils ne portent que la structure et le design system.

/** <main> d'une page ; aligne <html lang> en anglais. */
export function Page({ lang, children }: { lang: Locale; children: ReactNode }) {
  return (
    <main>
      {lang === "en" ? <SetLang lang="en" /> : null}
      {children}
    </main>
  );
}

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items, lang }: { items: Crumb[]; lang: Locale }) {
  return (
    <nav aria-label={lang === "en" ? "Breadcrumb" : "Fil d'Ariane"} className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-2">
            {i > 0 ? <span aria-hidden="true" className="text-border">/</span> : null}
            {c.href ? (
              <Link href={c.href} className="transition hover:text-brand">{c.label}</Link>
            ) : (
              <span aria-current="page" className="truncate text-foreground/70">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** En-tête de page : fond « hero », fil d'Ariane, sur-titre, titre, intro, actions, colonne optionnelle. */
export function PageHero({
  lang,
  crumbs,
  eyebrow,
  title,
  subtitle,
  intro,
  actions,
  aside,
  children,
  compact = false,
}: {
  lang: Locale;
  crumbs?: Crumb[];
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  intro?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="hero-bg border-b border-border">
      <div
        className={`container-page grid gap-10 ${compact ? "py-12 sm:py-14" : "py-14 sm:py-20"} ${
          aside ? "lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center lg:gap-16" : ""
        }`}
      >
        <div>
          {crumbs?.length ? <Breadcrumbs items={crumbs} lang={lang} /> : null}
          {eyebrow ? <p className={`eyebrow rise-in ${crumbs?.length ? "mt-6" : ""}`}>{eyebrow}</p> : null}
          <h1
            className={`rise-in max-w-4xl font-display font-bold leading-[1.08] tracking-tight ${
              compact ? "text-4xl sm:text-[2.75rem]" : "text-4xl sm:text-5xl lg:text-[3.25rem]"
            } ${eyebrow ? "mt-4" : crumbs?.length ? "mt-6" : ""}`}
          >
            {title}
          </h1>
          {subtitle ? <p className="rise-in mt-2 text-lg text-muted">{subtitle}</p> : null}
          {intro ? <div className="rise-in rise-in-delay mt-5 max-w-2xl text-lg leading-relaxed text-muted">{intro}</div> : null}
          {actions ? <div className="rise-in rise-in-delay mt-8 flex flex-wrap gap-3">{actions}</div> : null}
          {children}
        </div>
        {aside ? <div className="rise-in rise-in-delay">{aside}</div> : null}
      </div>
    </section>
  );
}

/** Section de contenu ; `tone="surface"` pour alterner les fonds. */
export function Section({
  children,
  tone = "default",
  id,
  narrow = false,
  className = "",
}: {
  children: ReactNode;
  tone?: "default" | "surface";
  id?: string;
  narrow?: boolean;
  className?: string;
}) {
  return (
    <section id={id} className={`${tone === "surface" ? "border-y border-border bg-surface" : ""} ${id ? "scroll-mt-20" : ""}`}>
      <div className={`container-page py-16 sm:py-20 ${narrow ? "max-w-3xl" : ""} ${className}`}>{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  action,
  center = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  action?: ReactNode;
  center?: boolean;
}) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-6 ${center ? "justify-center text-center" : ""}`}>
      <div className={`max-w-2xl ${center ? "mx-auto" : ""}`}>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className={`section-title ${eyebrow ? "mt-3" : ""}`}>{title}</h2>
        {intro ? <p className="mt-4 text-muted">{intro}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** Lien fléché discret (« Voir tous les métiers → »). */
export function ArrowLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={`group inline-flex items-center gap-1.5 text-sm font-semibold text-brand ${className}`}>
      {children}
      <Icon name="arrowRight" size={16} className="transition group-hover:translate-x-1" />
    </Link>
  );
}

/** Carte cliquable du design system (icône, titre, texte, méta, flèche). */
export function LinkCard({
  href,
  title,
  body,
  meta,
  icon,
  index,
  children,
  highlight = false,
}: {
  href: string;
  title: ReactNode;
  body?: ReactNode;
  meta?: ReactNode;
  icon?: IconName;
  index?: number;
  children?: ReactNode;
  highlight?: boolean;
}) {
  return (
    <Link href={href} className={`card card-hover group flex h-full flex-col p-6 ${highlight ? "border-brand/50" : ""}`}>
      {icon || index != null ? (
        <div className="mb-5 flex items-start justify-between gap-4">
          {icon ? <span className="icon-chip"><Icon name={icon} /></span> : <span />}
          {index != null ? (
            <span className="font-display text-3xl font-bold text-border transition group-hover:text-brand/25">
              {String(index).padStart(2, "0")}
            </span>
          ) : null}
        </div>
      ) : null}
      <span className={`text-lg font-semibold leading-snug transition group-hover:text-brand ${highlight ? "text-brand" : ""}`}>{title}</span>
      {meta ? <span className="mt-1 text-sm text-muted">{meta}</span> : null}
      {body ? <span className="mt-2 flex-1 text-sm leading-relaxed text-muted">{body}</span> : <span className="flex-1" />}
      {children}
      <span className="mt-5 text-muted transition group-hover:translate-x-1 group-hover:text-brand" aria-hidden="true">
        <Icon name="arrowRight" size={18} />
      </span>
    </Link>
  );
}

/** Carte non cliquable (piliers, conseils…). */
export function InfoCard({ title, body, icon }: { title: ReactNode; body: ReactNode; icon?: IconName }) {
  return (
    <div className="card h-full p-6">
      {icon ? <span className="icon-chip mb-5"><Icon name={icon} /></span> : null}
      <h3 className="text-lg font-semibold leading-snug">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

export function CheckList({ items, className = "" }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={`grid gap-3 ${className}`}>
      {items.map((it) => (
        <li key={it} className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
            <Icon name="check" size={14} />
          </span>
          <span className="leading-relaxed">{it}</span>
        </li>
      ))}
    </ul>
  );
}

/** Étapes numérotées (méthode). */
export function Steps({ steps }: { steps: readonly (readonly [string, string])[] }) {
  return (
    <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map(([title, body], i) => (
        <li key={title} className="relative">
          {i < steps.length - 1 ? (
            <span className="absolute left-12 right-0 top-5 hidden h-px bg-border lg:block" aria-hidden="true" />
          ) : null}
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand font-display text-lg font-bold text-white shadow-[0_6px_16px_-6px_rgba(226,0,26,0.6)]">
            {i + 1}
          </span>
          <h3 className="mt-5 text-lg font-semibold">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
        </li>
      ))}
    </ol>
  );
}

/** Pastilles (liens ou simples libellés). */
export function ChipList({ items, icon }: { items: { label: string; href?: string }[]; icon?: IconName }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((it) =>
        it.href ? (
          <li key={it.label}>
            <Link href={it.href} className="chip transition hover:border-brand hover:text-brand">
              {icon ? <Icon name={icon} size={13} /> : null}
              {it.label}
            </Link>
          </li>
        ) : (
          <li key={it.label} className="chip">
            {icon ? <Icon name={icon} size={13} /> : null}
            {it.label}
          </li>
        ),
      )}
    </ul>
  );
}

/** Carte contenant un formulaire (candidature, lead). */
export function FormCard({ title, intro, icon = "file", id, children }: { title: string; intro?: string; icon?: IconName; id?: string; children: ReactNode }) {
  return (
    <section id={id} className="card scroll-mt-24 p-6 shadow-[var(--shadow-lg)] sm:p-8">
      <span className="icon-chip"><Icon name={icon} /></span>
      <h2 className="mt-4 font-display text-2xl font-bold">{title}</h2>
      {intro ? <p className="mt-1 text-sm text-muted">{intro}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** Corps de texte long (articles, pages CMS) : paragraphes séparés par une ligne vide. */
export function Prose({ text, className = "" }: { text?: string | null; className?: string }) {
  const paragraphs = String(text ?? "").split(/\n{2,}/).filter(Boolean);
  if (!paragraphs.length) return null;
  return (
    <div className={`grid gap-5 text-[1.0625rem] leading-[1.8] text-foreground/85 ${className}`}>
      {paragraphs.map((p, i) => (
        <p key={i} className="whitespace-pre-line">{p}</p>
      ))}
    </div>
  );
}

const CTA_COPY = {
  fr: { title: "Un besoin de recrutement ?", body: "Recevez une première short-list qualifiée, rapidement.", cta: "Confier un recrutement" },
  en: { title: "A hiring need?", body: "Get a qualified short-list, fast.", cta: "Hire with us" },
} as const;

/** Bandeau rouge de fin de page. */
export function CtaBand({
  lang,
  title,
  body,
  primary,
  secondary,
}: {
  lang: Locale;
  title?: string;
  body?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  const t = CTA_COPY[lang];
  const main = primary ?? { label: t.cta, href: localePath(lang, "/contact/") };
  return (
    <section className="brand-band">
      <div className="container-page flex flex-col items-start gap-8 py-16 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">{title ?? t.title}</h2>
          <p className="mt-2 text-lg text-white/85">{body ?? t.body}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={main.href} className="btn btn-white">
            {main.label} <Icon name="arrowRight" size={18} />
          </Link>
          {secondary ? (
            <Link href={secondary.href} className="btn border border-white/40 text-white hover:bg-white/10">
              {secondary.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
