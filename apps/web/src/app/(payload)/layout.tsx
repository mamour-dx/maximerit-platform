import { getPayload, type ServerFunctionClient } from "payload";
import config from "@payload-config";
import "@payloadcms/next/css";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import Link from "next/link";
import React from "react";
import { importMap } from "./admin/importMap.js";

type Args = { children: React.ReactNode };

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

// Back office indisponible (base injoignable ou mal configurée) : message clair plutôt qu'un 500 brut.
// Les détails restent dans les journaux serveur ; la page n'expose ni variable ni identifiant.
function Unavailable() {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f7f6f4", color: "#17161a" }}>
        <main style={{ maxWidth: 520, margin: "12vh auto", padding: "0 24px", textAlign: "center" }}>
          <div style={{ fontSize: 56, fontWeight: 700, color: "#e2001a", lineHeight: 1 }}>503</div>
          <h1 style={{ fontSize: 26, margin: "16px 0 8px" }}>Back office indisponible</h1>
          <p style={{ color: "#5f5e5a", lineHeight: 1.6, margin: 0 }}>
            L&apos;espace d&apos;administration n&apos;arrive pas à joindre sa base de données. Réessayez dans un instant.
          </p>
          <p style={{ color: "#5f5e5a", fontSize: 14, lineHeight: 1.6, marginTop: 8 }}>
            Back office unavailable: the database can&apos;t be reached. If you manage this site, check the
            DATABASE_URI setting and the server logs.
          </p>
          <p style={{ marginTop: 24 }}>
            <Link href="/" style={{ color: "#e2001a", fontWeight: 600 }}>Retour au site / Back to site</Link>
          </p>
        </main>
      </body>
    </html>
  );
}

const Layout = async ({ children }: Args) => {
  try {
    await getPayload({ config }); // initialise Payload (connexion DB + migrations auto en production)
  } catch (err) {
    console.error("[admin] back office indisponible :", err instanceof Error ? err.message : err);
    return <Unavailable />;
  }
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  );
};

export default Layout;
