import type { Metadata } from "next";
import TaxonomyListing, { taxonomyMetadata } from "@/components/gifts/TaxonomyListing";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  return taxonomyMetadata("recipient", (await params).slug, await searchParams);
}

export default async function Page({ params, searchParams }: Props) {
  return <TaxonomyListing kind="recipient" slug={(await params).slug} searchParams={await searchParams} />;
}
