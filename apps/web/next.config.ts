import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Package de domaine partagé (monorepo) transpilé par Next.
  transpilePackages: ["@maximerit/domain"],
};

export default nextConfig;
