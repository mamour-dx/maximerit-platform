import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // Package de domaine partagé (monorepo) transpilé par Next.
  transpilePackages: ["@maximerit/domain"],
  // URLs canoniques avec slash final (aligné registre de routes Phase 2 + carte de migration).
  trailingSlash: true,
  // Libs de parsing CV côté serveur, hors bundle Next.
  serverExternalPackages: ["pdf-parse", "mammoth"],
};

export default withPayload(nextConfig);
