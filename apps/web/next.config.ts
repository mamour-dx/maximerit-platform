import os from "node:os";
import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import { headersConfig } from "./src/lib/security-headers";

// Dev uniquement : autorise l'accès au serveur de dev depuis les autres appareils du réseau local
// (http://<IP-LAN>:3000). Next bloque par défaut les assets de dev hors localhost. Les IP sont
// lues à chaud (pas d'IP codée en dur, le DHCP peut la changer). Sans effet en production.
const lanHosts = Object.values(os.networkInterfaces())
  .flat()
  .filter((i) => i && i.family === "IPv4" && !i.internal)
  .map((i) => i!.address);

const nextConfig: NextConfig = {
  allowedDevOrigins: lanHosts,
  // Package de domaine partagé (monorepo) transpilé par Next.
  transpilePackages: ["@maximerit/domain"],
  // URLs canoniques avec slash final (aligné registre de routes Phase 2 + carte de migration).
  trailingSlash: true,
  // Libs de parsing CV côté serveur, hors bundle Next.
  serverExternalPackages: ["pdf-parse", "mammoth"],
  // En-têtes de sécurité (Phase 9).
  async headers() {
    return headersConfig();
  },
};

export default withPayload(nextConfig);
