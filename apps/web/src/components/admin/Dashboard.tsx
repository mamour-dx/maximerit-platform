import Link from "next/link";
import type { AdminViewServerProps } from "payload";

// Page d'accueil de l'espace d'administration : remplace le tableau de bord technique de Payload par
// quelques gros boutons et des compteurs. Composant serveur — les compteurs respectent les droits de l'utilisateur.

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super administrateur",
  ADMIN: "Administrateur",
  RECRUITER: "Recruteur",
  CONTENT_MANAGER: "Responsable contenu",
  MARKETING: "Marketing",
  VIEWER: "Lecture seule",
};

type Perms = { collections?: Record<string, Record<string, unknown> | undefined> };

interface CardSpec {
  key: string;
  title: string;
  text: string;
  href: string;
  button: string;
  count?: number | null;
  countLabel?: string;
}

const STYLES = `
.mx-dash{max-width:1180px;padding:28px var(--gutter-h,40px) 56px}
.mx-dash h1{margin:0 0 6px;font-size:30px;line-height:1.15}
.mx-dash .mx-sub{margin:0 0 28px;color:var(--theme-elevation-600,#5f5e5a);font-size:16px}
.mx-grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(270px,1fr))}
.mx-card{display:flex;flex-direction:column;gap:6px;padding:22px;border-radius:14px;border:1px solid var(--theme-elevation-150,#e5e3dd);background:var(--theme-elevation-50,#f7f6f4)}
.mx-card h2{margin:0;font-size:18px}
.mx-card p{margin:0;color:var(--theme-elevation-600,#5f5e5a);font-size:14px;line-height:1.5}
.mx-count{font-size:38px;font-weight:700;line-height:1;color:#e2001a;margin-top:4px}
.mx-count small{display:block;margin-top:4px;font-size:13px;font-weight:500;color:var(--theme-elevation-600,#5f5e5a)}
.mx-btn{display:inline-block;margin-top:auto;padding:10px 16px;border-radius:8px;background:#e2001a;color:#fff!important;font-weight:600;font-size:14px;text-decoration:none;text-align:center}
.mx-btn:hover{background:#b30015}
.mx-spacer{flex:1;min-height:12px}
.mx-more{margin-top:32px;display:flex;flex-wrap:wrap;gap:8px 20px;font-size:14px}
.mx-more a{color:var(--theme-text);text-decoration:underline}
.mx-tip{margin-top:28px;padding:16px 18px;border-radius:12px;border:1px dashed var(--theme-elevation-200,#d9d6cf);font-size:14px;line-height:1.6;color:var(--theme-elevation-700,#444)}
`;

async function safeCount(run: () => Promise<{ totalDocs: number }>): Promise<number | null> {
  try {
    return (await run()).totalDocs;
  } catch {
    return null;
  }
}

export async function Dashboard(props: AdminViewServerProps) {
  const { payload, user, permissions, visibleEntities } = props as AdminViewServerProps & { user?: Record<string, unknown> | null };
  const adminBase = payload.config.routes.admin;
  const visible = new Set<string>(visibleEntities?.collections ?? []);
  const perms = permissions as unknown as Perms;
  const can = (slug: string, action: string) => visible.has(slug) && Boolean(perms?.collections?.[slug]?.[action]);
  const url = (slug: string, suffix = "") => `${adminBase}/collections/${slug}${suffix}`;

  const firstName = (user?.firstName as string | undefined)?.trim();
  const email = (user?.email as string | undefined) ?? "";
  const greeting = firstName || email.split("@")[0] || "";
  const role = ROLE_LABELS[String(user?.role ?? "")] ?? "";
  const nowIso = new Date().toISOString();
  const asUser = { user: user as never, overrideAccess: false } as const;

  const [liveJobs, newApplications, newLeads] = await Promise.all([
    can("jobs", "read")
      ? safeCount(() =>
          payload.count({
            collection: "jobs",
            where: { and: [{ status: { equals: "publiee" } }, { or: [{ expiresAt: { exists: false } }, { expiresAt: { greater_than: nowIso } }] }] },
            ...asUser,
          }),
        )
      : null,
    can("applications", "read") ? safeCount(() => payload.count({ collection: "applications", where: { status: { equals: "recue" } }, ...asUser })) : null,
    can("leads", "read") ? safeCount(() => payload.count({ collection: "leads", where: { status: { equals: "nouveau" } }, ...asUser })) : null,
  ]);

  const cards: CardSpec[] = [];
  if (can("jobs", "create")) {
    cards.push({
      key: "new-job",
      title: "Publier une offre d'emploi",
      text: "Créez une offre en quelques minutes : elle apparaît sur le site dès que vous la passez en « Publiée ».",
      href: url("jobs", "/create"),
      button: "Nouvelle offre",
      count: liveJobs,
      countLabel: liveJobs === 1 ? "offre en ligne" : "offres en ligne",
    });
  }
  if (can("applications", "read")) {
    cards.push({
      key: "applications",
      title: "Candidatures à traiter",
      text: "Les personnes qui ont postulé depuis le site. Ouvrez une candidature pour lire le CV et changer son suivi.",
      href: `${url("applications")}?where[status][equals]=recue`,
      button: "Voir les candidatures reçues",
      count: newApplications,
      countLabel: newApplications === 1 ? "nouvelle candidature" : "nouvelles candidatures",
    });
  }
  if (can("leads", "read")) {
    cards.push({
      key: "leads",
      title: "Demandes d'entreprises",
      text: "Les entreprises qui ont rempli le formulaire « Confier un recrutement » ou utilisé un outil gratuit.",
      href: `${url("leads")}?where[status][equals]=nouveau`,
      button: "Voir les nouvelles demandes",
      count: newLeads,
      countLabel: newLeads === 1 ? "nouvelle demande" : "nouvelles demandes",
    });
  }
  if (can("candidates", "read")) {
    cards.push({
      key: "candidates",
      title: "Candidats",
      text: "Tous les profils reçus (candidatures et dépôts de CV). Recherchez par nom, email ou poste.",
      href: url("candidates"),
      button: "Voir les candidats",
    });
  }
  if (can("articles", "create")) {
    cards.push({
      key: "article",
      title: "Écrire un article",
      text: "Publiez une actualité ou un conseil sur le blog du site.",
      href: url("articles", "/create"),
      button: "Nouvel article",
    });
  }

  const more: { label: string; href: string }[] = [];
  if (can("resources", "read")) more.push({ label: "Guides et études", href: url("resources") });
  if (can("pages", "read")) more.push({ label: "Pages libres", href: url("pages") });
  if (can("jobs", "read")) more.push({ label: "Toutes les offres", href: url("jobs") });
  if (can("users", "read") && ["SUPER_ADMIN", "ADMIN"].includes(String(user?.role ?? ""))) more.push({ label: "Équipe et accès", href: url("users") });
  more.push({ label: "Mon compte", href: `${adminBase}/account` });

  return (
    <div className="mx-dash">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <h1>Bonjour{greeting ? ` ${greeting}` : ""} 👋</h1>
      <p className="mx-sub">
        Que souhaitez-vous faire aujourd&apos;hui ?{role ? ` (Votre rôle : ${role})` : ""}
      </p>

      <div className="mx-grid">
        {cards.map((c) => (
          <div key={c.key} className="mx-card">
            <h2>{c.title}</h2>
            {typeof c.count === "number" ? (
              <div className="mx-count">
                {c.count}
                <small>{c.countLabel}</small>
              </div>
            ) : null}
            <p>{c.text}</p>
            <div className="mx-spacer" />
            <Link href={c.href} className="mx-btn">
              {c.button}
            </Link>
          </div>
        ))}
      </div>

      <div className="mx-more">
        {more.map((m) => (
          <Link key={m.href} href={m.href}>
            {m.label}
          </Link>
        ))}
        <a href="/" target="_blank" rel="noopener noreferrer">
          Voir le site ↗
        </a>
      </div>

      <p className="mx-tip">
        <strong>Astuce :</strong> le site existe en français et en anglais. Pour modifier la version anglaise d&apos;une offre ou d&apos;un article,
        ouvrez-le puis changez de langue avec le sélecteur en haut de la fiche.
      </p>
    </div>
  );
}
