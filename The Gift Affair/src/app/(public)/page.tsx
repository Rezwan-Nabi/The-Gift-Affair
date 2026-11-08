import BrandNote from "@/components/home/BrandNote";
import BudgetLinks from "@/components/home/BudgetLinks";
import CategoryCards from "@/components/home/CategoryCards";
import FeaturedGuide from "@/components/home/FeaturedGuide";
import Hero from "@/components/home/Hero";
import OccasionCollections from "@/components/home/OccasionCollections";
import SectionHeading from "@/components/home/SectionHeading";
import GiftGrid from "@/components/gifts/GiftGrid";
import { EMPTY_FILTERS } from "@/lib/filters";
import { getFeaturedGifts, getTaxonomy, listGifts, listGuides } from "@/lib/queries/public";

export const revalidate = 300;

export default async function HomePage() {
  const [taxonomy, featured, guides] = await Promise.all([getTaxonomy(), getFeaturedGifts(8), listGuides()]);
  const counts = Object.fromEntries(
    await Promise.all(
      taxonomy.occasions.map(async (o) => [o.slug, (await listGifts({ ...EMPTY_FILTERS, occasion: o.slug }, 1)).total] as const),
    ),
  );

  return (
    <>
      <Hero occasions={taxonomy.occasions} />
      <div className="garland" aria-hidden="true" />
      <CategoryCards categories={taxonomy.categories} />
      <OccasionCollections occasions={taxonomy.occasions} counts={counts} />

      {featured.length > 0 && (
        <section aria-labelledby="popular-heading" className="container-page py-16 md:py-20">
          <SectionHeading
            id="popular-heading"
            title="Popular gift inspiration"
            description="Gifts our readers keep coming back to."
            link={{ href: "/gift-ideas", label: "Browse all gifts" }}
          />
          <div className="mt-10">
            <GiftGrid gifts={featured} />
          </div>
        </section>
      )}

      <BudgetLinks budgets={taxonomy.budgets} />
      {guides[0] && <FeaturedGuide guide={guides[0]} />}
      <BrandNote />
    </>
  );
}
