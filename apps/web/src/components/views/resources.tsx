import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { ToolCalculator } from "@/components/tools/ToolCalculator";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ArrowLink, ChipList, CtaBand, FormCard, InfoCard, LinkCard, Page, PageHero, Prose, Section, SectionHeading } from "@/components/site/PageKit";
import { localePath, type Locale } from "@/lib/i18n";
import { TOOLS, type ToolSlug } from "@/lib/tools";

// Ressources (FR/EN) : blog, guides / études / baromètres, outils gratuits, landing pages CMS.
// Les routes chargent les données (Payload) ; ces vues ne font que la mise en page.

export interface ArticleCard {
  id: number | string;
  slug?: string;
  title?: string;
  excerpt?: string;
  category?: string;
}
export interface ArticleDoc extends ArticleCard {
  content?: string;
  related?: { slug?: string; title?: string }[];
}
export interface ResourceCard {
  id: number | string;
  slug?: string;
  title?: string;
  description?: string;
  gated?: boolean;
}
export interface ResourceDoc extends ResourceCard {
  content?: string;
}
export interface LandingDoc {
  id: number;
  title?: string;
  promise?: string;
  problem?: string;
  method?: string;
  proof?: string;
  ctaLabel?: string;
  profiles?: { label?: string }[];
}

export const RESOURCE_TYPES = {
  guides: { fr: "Guides", en: "Guides", icon: "book" },
  etudes: { fr: "Études", en: "Studies", icon: "chart" },
  barometres: { fr: "Baromètres", en: "Barometers", icon: "target" },
} as const satisfies Record<string, { fr: string; en: string; icon: IconName }>;
export type ResourceType = keyof typeof RESOURCE_TYPES;
export const isResourceType = (t: string): t is ResourceType => t in RESOURCE_TYPES;

const TOOL_ICONS: Record<ToolSlug, IconName> = {
  "cout-recrutement": "chart",
  "cout-vacance": "calculator",
  "benchmark-salaire": "target",
  "mining-team-planner": "users",
};

const C = {
  fr: {
    resources: "Ressources",
    blog: "Blog",
    blogIntro: "Recrutement, compétences et marché de l'emploi en Afrique de l'Ouest.",
    noArticles: "Aucun article publié pour le moment",
    noArticlesHint: "Nos premières analyses arrivent bientôt. En attendant, essayez nos outils gratuits.",
    read: "Lire l'article",
    related: "À lire aussi",
    backToBlog: "Tous les articles",
    noItems: (t: string) => `Aucun contenu « ${t} » publié pour le moment`,
    onRequest: "Sur demande",
    gatedTitle: "Recevoir ce contenu",
    gatedIntro: (t: string) => `Accédez à « ${t} » — nous vous l'envoyons par email.`,
    gatedCta: "Recevoir le contenu",
    freeTool: "Outil gratuit",
    toolIntro: "Résultat indicatif. Pour une analyse complète adaptée à votre contexte, échangeons.",
    toolLeadTitle: "Recevoir l'analyse complète",
    toolLeadIntro: "Un consultant Maximerit vous transmet une estimation détaillée.",
    toolLeadCta: "Recevoir l'analyse complète",
    otherTools: "Autres outils gratuits",
    tools: "Outils",
    lpProblem: "Le problème",
    lpProfiles: "Profils recherchés",
    lpMethod: "Notre méthode",
    lpProof: "Preuves",
    lpFormTitle: "Parlons de votre besoin",
    lpFormIntro: "Réponse rapide d'un consultant spécialisé.",
    lpCta: "Parlons de votre besoin",
  },
  en: {
    resources: "Resources",
    blog: "Blog",
    blogIntro: "Recruitment, skills and the job market in West Africa.",
    noArticles: "No published articles yet",
    noArticlesHint: "Our first analyses are coming soon. In the meantime, try our free tools.",
    read: "Read article",
    related: "Related reading",
    backToBlog: "All articles",
    noItems: (t: string) => `No “${t}” content published yet`,
    onRequest: "On request",
    gatedTitle: "Get this content",
    gatedIntro: (t: string) => `Access “${t}” — we'll send it to you by email.`,
    gatedCta: "Get the content",
    freeTool: "Free tool",
    toolIntro: "Indicative result. For a full analysis tailored to your context, let's talk.",
    toolLeadTitle: "Get the full analysis",
    toolLeadIntro: "A Maximerit consultant will send you a detailed estimate.",
    toolLeadCta: "Get the full analysis",
    otherTools: "Other free tools",
    tools: "Tools",
    lpProblem: "The problem",
    lpProfiles: "Profiles we recruit",
    lpMethod: "Our method",
    lpProof: "Proof",
    lpFormTitle: "Let's talk about your need",
    lpFormIntro: "A quick reply from a specialist consultant.",
    lpCta: "Let's talk about your need",
  },
} as const;

/** Navigation transverse des ressources (blog, guides, études, baromètres, outils). */
function ResourceNav({ lang, current }: { lang: Locale; current?: string }) {
  const items = [
    { key: "blog", label: C[lang].blog, href: localePath(lang, "/ressources/blog/") },
    ...(Object.keys(RESOURCE_TYPES) as ResourceType[]).map((k) => ({ key: k, label: RESOURCE_TYPES[k][lang], href: localePath(lang, `/ressources/${k}/`) })),
    { key: "outils", label: C[lang].tools, href: localePath(lang, "/ressources/outils/benchmark-salaire/") },
  ];
  return (
    <ul className="mt-8 flex flex-wrap gap-2">
      {items.map((it) => (
        <li key={it.key}>
          <Link
            href={it.href}
            aria-current={it.key === current ? "page" : undefined}
            className={`chip transition hover:border-brand hover:text-brand ${it.key === current ? "chip-brand" : ""}`}
          >
            {it.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function EmptyCard({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <span className="icon-chip"><Icon name="book" /></span>
      <p className="mt-4 text-lg font-semibold">{title}</p>
      {hint ? <p className="mt-2 max-w-md text-sm text-muted">{hint}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function BlogListPage({ lang, articles }: { lang: Locale; articles: ArticleCard[] }) {
  const t = C[lang];
  return (
    <Page lang={lang}>
      <PageHero lang={lang} eyebrow={t.resources} title={t.blog} intro={t.blogIntro} compact>
        <ResourceNav lang={lang} current="blog" />
      </PageHero>
      <Section>
        {articles.length === 0 ? (
          <EmptyCard title={t.noArticles} hint={t.noArticlesHint} action={<Link href={localePath(lang, "/ressources/outils/benchmark-salaire/")} className="btn btn-primary">{t.tools}</Link>} />
        ) : (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a, i) => (
              <li key={a.id} className={i === 0 && articles.length > 2 ? "md:col-span-2" : ""}>
                <LinkCard
                  href={localePath(lang, `/ressources/blog/${a.slug}/`)}
                  title={<span className={i === 0 && articles.length > 2 ? "font-display text-2xl font-bold sm:text-3xl" : ""}>{a.title}</span>}
                  body={a.excerpt}
                >
                  {a.category ? <span className="chip chip-brand order-first mb-4 self-start">{a.category}</span> : null}
                </LinkCard>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <CtaBand lang={lang} />
    </Page>
  );
}

export function ArticlePage({ lang, article: a }: { lang: Locale; article: ArticleDoc }) {
  const t = C[lang];
  const related = (a.related ?? []).filter((r) => r && typeof r === "object" && r.slug);
  return (
    <Page lang={lang}>
      <PageHero
        lang={lang}
        crumbs={[{ label: t.blog, href: localePath(lang, "/ressources/blog/") }, { label: a.title ?? "" }]}
        eyebrow={a.category}
        title={a.title}
        intro={a.excerpt}
        compact
      />
      <div className="container-page grid gap-12 py-14 sm:py-16 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="max-w-3xl">
          <Prose text={a.content} />
          <ArrowLink href={localePath(lang, "/ressources/blog/")} className="mt-12">{t.backToBlog}</ArrowLink>
        </article>
        {related.length ? (
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">{t.related}</h2>
              <ul className="mt-4 grid gap-3">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={localePath(lang, `/ressources/blog/${r.slug}/`)} className="font-medium leading-snug transition hover:text-brand">{r.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        ) : null}
      </div>
      <CtaBand lang={lang} />
    </Page>
  );
}

export function ResourceListPage({ lang, type, items }: { lang: Locale; type: ResourceType; items: ResourceCard[] }) {
  const t = C[lang];
  const label = RESOURCE_TYPES[type][lang];
  return (
    <Page lang={lang}>
      <PageHero lang={lang} eyebrow={t.resources} title={label} compact>
        <ResourceNav lang={lang} current={type} />
      </PageHero>
      <Section>
        {items.length === 0 ? (
          <EmptyCard title={t.noItems(label)} />
        ) : (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((r) => (
              <li key={r.id}>
                <LinkCard href={localePath(lang, `/ressources/${type}/${r.slug}/`)} icon={RESOURCE_TYPES[type].icon} title={r.title} body={r.description}>
                  {r.gated ? <span className="chip mt-4 self-start"><Icon name="lock" size={12} /> {t.onRequest}</span> : null}
                </LinkCard>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <CtaBand lang={lang} />
    </Page>
  );
}

export function ResourcePage({ lang, type, resource: r, slug }: { lang: Locale; type: ResourceType; resource: ResourceDoc; slug: string }) {
  const t = C[lang];
  return (
    <Page lang={lang}>
      <PageHero
        lang={lang}
        crumbs={[{ label: RESOURCE_TYPES[type][lang], href: localePath(lang, `/ressources/${type}/`) }, { label: r.title ?? "" }]}
        eyebrow={RESOURCE_TYPES[type][lang]}
        title={r.title}
        intro={r.description}
        compact
      />
      <Section narrow>
        {r.gated ? (
          <FormCard icon="lock" title={t.gatedTitle} intro={t.gatedIntro(r.title ?? "")}>
            {lang === "en" ? <LeadForm source={`resource:${slug}`} lang="en" ctaLabel={t.gatedCta} /> : <LeadForm source={`resource:${slug}`} ctaLabel={t.gatedCta} />}
          </FormCard>
        ) : (
          <Prose text={r.content} />
        )}
      </Section>
      <CtaBand lang={lang} />
    </Page>
  );
}

export function ToolPage({ lang, tool }: { lang: Locale; tool: ToolSlug }) {
  const t = C[lang];
  const title = lang === "en" ? TOOLS[tool].titleEn : TOOLS[tool].title;
  return (
    <Page lang={lang}>
      <PageHero lang={lang} eyebrow={t.freeTool} title={title} intro={t.toolIntro} compact>
        <ResourceNav lang={lang} current="outils" />
      </PageHero>
      <Section>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
          <div className="card p-6 shadow-[var(--shadow-lg)] sm:p-8">
            <span className="icon-chip"><Icon name={TOOL_ICONS[tool]} /></span>
            <h2 className="mt-4 font-display text-2xl font-bold">{title}</h2>
            <div className="mt-6">
              <ToolCalculator tool={tool} lang={lang} />
            </div>
          </div>
          <FormCard icon="mail" title={t.toolLeadTitle} intro={t.toolLeadIntro}>
            {lang === "en" ? <LeadForm source={`tool:${tool}`} lang="en" ctaLabel={t.toolLeadCta} /> : <LeadForm source={`tool:${tool}`} ctaLabel={t.toolLeadCta} />}
          </FormCard>
        </div>
      </Section>
      <Section tone="surface">
        <SectionHeading title={t.otherTools} />
        <ul className="mt-8 grid gap-5 sm:grid-cols-3">
          {(Object.keys(TOOLS) as ToolSlug[]).filter((k) => k !== tool).map((k) => (
            <li key={k}>
              <LinkCard href={localePath(lang, `/ressources/outils/${k}/`)} icon={TOOL_ICONS[k]} title={lang === "en" ? TOOLS[k].titleEn : TOOLS[k].title} />
            </li>
          ))}
        </ul>
      </Section>
    </Page>
  );
}

export function LandingPage({ lang, lp, slug }: { lang: Locale; lp: LandingDoc; slug: string }) {
  const t = C[lang];
  const profiles = (lp.profiles ?? []).filter((p) => p.label);
  const blocks = (
    [
      ["target", t.lpProblem, lp.problem],
      ["compass", t.lpMethod, lp.method],
      ["shield", t.lpProof, lp.proof],
    ] as [IconName, string, string | undefined][]
  ).filter(([, , body]) => body);
  return (
    <Page lang={lang}>
      <PageHero
        lang={lang}
        title={lp.title}
        intro={lp.promise}
        actions={
          <a href="#contact" className="btn btn-primary">
            {lp.ctaLabel || t.lpCta} <Icon name="arrowRight" size={18} />
          </a>
        }
      >
        {profiles.length ? (
          <div className="rise-in rise-in-delay mt-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t.lpProfiles}</p>
            <div className="mt-3"><ChipList items={profiles.map((p) => ({ label: p.label as string }))} /></div>
          </div>
        ) : null}
      </PageHero>
      {blocks.length ? (
        <Section>
          <ul className={`grid gap-5 ${blocks.length === 3 ? "md:grid-cols-3" : blocks.length === 2 ? "md:grid-cols-2" : ""}`}>
            {blocks.map(([icon, title, body]) => (
              <li key={title}><InfoCard icon={icon} title={title} body={body} /></li>
            ))}
          </ul>
        </Section>
      ) : null}
      <section className="border-t border-border bg-surface">
        <div className="container-page max-w-3xl py-16 sm:py-20">
          <FormCard id="contact" icon="briefcase" title={t.lpFormTitle} intro={t.lpFormIntro}>
            {lang === "en" ? (
              <LeadForm source={`lp:${slug}`} landingPageId={lp.id} lang="en" ctaLabel={lp.ctaLabel || undefined} />
            ) : (
              <LeadForm source={`lp:${slug}`} landingPageId={lp.id} ctaLabel={lp.ctaLabel || undefined} />
            )}
          </FormCard>
        </div>
      </section>
    </Page>
  );
}
