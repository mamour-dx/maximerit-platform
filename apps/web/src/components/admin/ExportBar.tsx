"use client";
// Barre « Exporter » au-dessus des listes Candidats / Candidatures du back-office.
// Exporte la sélection si des lignes sont cochées, sinon tous les résultats des filtres et de la recherche en cours.
// Aucune logique métier ici : le fichier est construit et les droits vérifiés côté serveur (src/lib/export.ts).
import { useState } from "react";
import { Button, toast, useAuth, useConfig, useListQuery, useSelection } from "@payloadcms/ui";
import { canExport, type ExportFormat } from "@/lib/export-access";

const NOUNS: Record<string, [string, string]> = {
  candidates: ["candidat", "candidats"],
  applications: ["candidature", "candidatures"],
};

const plural = (n: number, [one, many]: [string, string]) => `${n} ${n > 1 ? many : one}`;

export function ExportBar() {
  const { user } = useAuth();
  const { config } = useConfig();
  const { collectionSlug, query, data } = useListQuery();
  const { selectAll, getSelectedIds } = useSelection();
  const [busy, setBusy] = useState<ExportFormat | null>(null);

  if (!canExport(user) || !collectionSlug || !NOUNS[collectionSlug]) return null;

  const noun = NOUNS[collectionSlug];
  const ids = selectAll === "allAvailable" ? [] : getSelectedIds();
  const total = data?.totalDocs ?? 0;
  const filtered = !!query?.search || (!!query?.where && Object.keys(query.where).length > 0);
  const scope = ids.length
    ? `${plural(ids.length, noun)} sélectionné${ids.length > 1 ? "s" : ""}`
    : filtered
      ? `${plural(total, noun)} (filtres en cours)`
      : `tous les ${noun[1]} (${total})`;
  const empty = !ids.length && total === 0;

  async function run(format: ExportFormat) {
    setBusy(format);
    try {
      const body = ids.length
        ? { format, where: { id: { in: ids } }, sort: query?.sort }
        : { format, where: query?.where, search: query?.search, sort: query?.sort };
      // « / » final : le site est en trailingSlash (évite une redirection 308 à chaque export).
      const res = await fetch(`${config.serverURL}${config.routes.api}/${collectionSlug}/export/`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const msg = await res.json().then((j: { error?: string }) => j.error).catch(() => undefined);
        throw new Error(msg || "L'export a échoué.");
      }
      const name = /filename="([^"]+)"/.exec(res.headers.get("content-disposition") ?? "")?.[1] ?? `export.${format}`;
      const url = URL.createObjectURL(await res.blob());
      const a = Object.assign(document.createElement("a"), { href: url, download: name });
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      toast.success(`Export prêt : ${plural(Number(res.headers.get("x-export-count") ?? 0), noun)}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "L'export a échoué.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "8px 12px",
        margin: "0 0 16px",
        padding: "10px 14px",
        border: "1px solid var(--theme-elevation-150)",
        borderRadius: "var(--style-radius-m, 6px)",
        background: "var(--theme-elevation-50)",
      }}
    >
      <span style={{ fontWeight: 600 }}>Exporter</span>
      <span style={{ color: "var(--theme-elevation-600)", flex: "1 1 220px" }}>
        {scope}
        {!ids.length && !empty ? " — cochez des lignes pour n'exporter qu'une sélection" : ""}
      </span>
      <Button buttonStyle="primary" size="small" margin={false} disabled={!!busy || empty} onClick={() => run("xlsx")}>
        {busy === "xlsx" ? "Préparation…" : "Excel (.xlsx)"}
      </Button>
      <Button buttonStyle="secondary" size="small" margin={false} disabled={!!busy || empty} onClick={() => run("csv")}>
        {busy === "csv" ? "Préparation…" : "CSV"}
      </Button>
    </div>
  );
}
