import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GiftDetail from "@/components/gifts/GiftDetail";
import { siteUrl } from "@/lib/constants";
import { getAllPublicSlugs, getGiftBySlug, getRelatedGifts } from "@/lib/queries/public";
import { imageUrl } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateStaticParams() {
  const { gifts } = await getAllPublicSlugs();
  return gifts.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const gift = await getGiftBySlug((await params).slug);
  if (!gift) return { title: "Gift not found" };
  const image = imageUrl(gift.mainImagePath);
  return {
    title: gift.title,
    description: gift.summary,
    alternates: { canonical: `/gift-ideas/${gift.slug}` },
    openGraph: {
      type: "article",
      title: gift.title,
      description: gift.summary,
      url: `/gift-ideas/${gift.slug}`,
      images: image ? [{ url: image, alt: gift.imageAlt ?? gift.title }] : undefined,
    },
  };
}

export default async function GiftPage({ params }: Props) {
  const gift = await getGiftBySlug((await params).slug);
  if (!gift) notFound();
  const related = await getRelatedGifts(gift, 4);

  const crumbs = [
    { name: "Home", url: siteUrl },
    { name: "Gifts", url: `${siteUrl}/gift-ideas` },
    { name: gift.title, url: `${siteUrl}/gift-ideas/${gift.slug}` },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.url })),
  };

  return (
    <>
      <GiftDetail gift={gift} related={related} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
