import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // Package de domaine partagé (monorepo) transpilé par Next.
  transpilePackages: ["@maximerit/domain"],
};

export default withPayload(nextConfig);
