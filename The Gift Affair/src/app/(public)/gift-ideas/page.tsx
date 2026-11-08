import type { Metadata } from "next";
import GiftBrowser from "@/components/gifts/GiftBrowser";
import PageIntro from "@/components/layout/PageIntro";
import SearchForm from "@/components/layout/SearchForm";
import { activeFilterCount, parseFilters } from "@/lib/filters";
import { getTaxonomy, listGifts } from "@/lib/queries/public";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const filters = parseFilters(await searchParams);
  const filtered = activeFilterCount(filters) > 0 || filters.page > 1 || filters.sort !== "featured";
  return {
    title: filters.q ? `Search: ${filters.q}` : "All wedding gifts",
    description: "Browse every wedding gift, filtered by category, occasion, recipient and budget.",
    alternates: { canonical: "/gift-ideas" },
    // Filtered and search views are for visitors, not search engines.
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function GiftIdeasPage({ searchParams }: Props) {
  const filters = parseFilters(await searchParams);
  const [taxonomy, result] = await Promise.all([getTaxonomy(), listGifts(filters)]);

  return (
    <>
      <PageIntro
        title={filters.q ? `Gifts for “${filters.q}”` : "All gifts"}
        description="Every gift we've collected, for every ceremony and budget."
        crumbs={[{ label: "Home", href: "/" }, { label: "Gifts" }]}
        tone="bg-lavender-soft"
      >
        <div className="mt-8 max-w-xl">
          <SearchForm id="listing-search" size="lg" defaultValue={filters.q} placeholder="Try “kantha”, “mugs” or “bride”" />
        </div>
      </PageIntro>
      <div className="container-page mt-10">
        <GiftBrowser taxonomy={taxonomy} filters={filters} result={result} basePath="/gift-ideas" />
      </div>
    </>
  );
}
