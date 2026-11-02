import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { hreflang } from "@/lib/i18n";
import { OFFERS, getOffer } from "@/lib/offers";
import { OfferPage } from "@/components/views/company";

type Args = { params: Promise<{ service: string; offer: string }> };

export function generateStaticParams() {
  return OFFERS.map((o) => ({ service: o.service, offer: o.slug }));
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { service, offer } = await params;
  const o = getOffer(service, offer);
  if (!o) return {};
  const path = `/entreprises/${service}/${offer}/`;
  return { title: o.titleEn, description: o.introEn, alternates: { canonical: `/en${path}`, languages: hreflang(path, `/en${path}`) } };
}

export default async function OfferEnRoute({ params }: Args) {
  const { service, offer } = await params;
  const o = getOffer(service, offer);
  if (!o) notFound();
  return <OfferPage offer={o} lang="en" />;
}
