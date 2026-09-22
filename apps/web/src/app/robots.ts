import type { MetadataRoute } from "next";
import { buildRobots, isStaging } from "@/lib/seo";

// /robots.txt — staging non indexable (ADR-0003), production indexable sauf admin/API/actions.
export default function robots(): MetadataRoute.Robots {
  return buildRobots({ staging: isStaging() });
}
