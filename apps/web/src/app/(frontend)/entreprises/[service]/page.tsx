import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { SERVICES, getService } from "@/lib/content";
import { ServicePage } from "@/components/views/company";

type Args = { params: Promise<{ service: string }> };

export function generateStaticParams() {
  return SERVICES.map((s) => ({ service: s.slug }));
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { service } = await params;
  const s = getService(service);
  if (!s) return {};
  return { title: s.title, description: s.intro, alternates: { canonical: `/entreprises/${service}/`, languages: hreflang(`/entreprises/${service}/`, `/en/entreprises/${service}/`) } };
}

export default async function ServiceRoute({ params }: Args) {
  const { service } = await params;
  const s = getService(service);
  if (!s) notFound();
  return <ServicePage service={s} lang="fr" />;
}
