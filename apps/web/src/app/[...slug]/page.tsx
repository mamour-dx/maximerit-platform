import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import type { Metadata } from "next";
import { getPayload, type Where } from "payload";
import config from "@payload-config";

export const dynamic = "force-dynamic";

type Args = { params: Promise<{ slug: string[] }> };

async function getPage(slug: string, preview: boolean) {
  const payload = await getPayload({ config });
  const conditions: Where[] = [{ slug: { equals: slug } }];
  if (!preview) conditions.push({ status: { equals: "published" } });
  const res = await payload.find({ collection: "pages", where: { and: conditions }, limit: 1 });
  return res.docs[0] ?? null;
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const path = `/${slug.join("/")}/`;
  const { isEnabled } = await draftMode();
  const page = await getPage(slug.join("/"), isEnabled);
  if (!page) return {};
  return {
    title: (page.seoTitle as string) || (page.title as string),
    description: (page.seoDescription as string) || undefined,
    alternates: { canonical: path },
    robots: page.status === "published" ? undefined : { index: false, follow: false },
  };
}

export default async function CmsPage({ params }: Args) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const page = await getPage(slug.join("/"), isEnabled);
  if (!page) notFound();

  const paragraphs = String(page.content ?? "").split(/\n{2,}/).filter(Boolean);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      {isEnabled && page.status !== "published" ? (
        <p className="mb-4 inline-block rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
          Aperçu — brouillon
        </p>
      ) : null}
      <h1 className="text-4xl font-bold">{page.title as string}</h1>
      <div className="mt-6 space-y-4 text-muted">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </main>
  );
}
