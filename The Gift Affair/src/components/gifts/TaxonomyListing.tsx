import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GiftBrowser from "@/components/gifts/GiftBrowser";
import PageIntro from "@/components/layout/PageIntro";
import { ACCENT_SOFT_BG, accentAt, occasionAccent } from "@/lib/accents";
import { activeFilterCount, parseFilters, type FilterKey } from "@/lib/filters";
import { getCategoryBySlug, getTagBySlug, getTaxonomy, listGifts } from "@/lib/queries/public";

export type ListingKind = "category" | "occasion" | "recipient" | "budget";
type SearchParams = Record<string, string | string[] | undefined>;

const META: Record<ListingKind, { base: string; crumb: string; title: (n: string) => string; intro: (n: string) => string }> = {
  category: {
    base: "/categories",
    crumb: "Categories",
    title: (n) => n,
    intro: (n) => `${n} for weddings, holuds and receptions.`,
  },
  occasion: {
    base: "/occasions",
    crumb: "Occasions",
    title: (n) => `${n} gifts`,
    intro: (n) => `Gifts chosen for the ${n.toLowerCase()}.`,
  },
  recipient: {
    base: "/recipients",
    crumb: "Recipients",
    title: (n) => `Gifts for ${n.toLowerCase()}`,
    intro: (n) => `Gifts picked with ${n.toLowerCase()} in mind.`,
  },
  budget: {
    base: "/budget",
    crumb: "Budget",
    title: (n) => `${n} wedding gifts`,
    intro: () => "Thoughtful gifts in this price range.",
  },
};

async function resolve(kind: ListingKind, slug: string) {
  if (kind === "category") {
    const c = await getCategoryBySlug(slug);
    return c ? { name: c.name, description: c.description, index: c.sortOrder } : null;
  }
  const t = await getTagBySlug(kind, slug);
  return t ? { name: t.name, description: t.description, index: t.sortOrder } : null;
}

export async function taxonomyMetadata(kind: ListingKind, slug: string, sp: SearchParams): Promise<Metadata> {
  const item = await resolve(kind, slug);
  if (!item) return { title: "Not found" };
  const m = META[kind];
  const filters = parseFilters(sp);
  const filtered = activeFilterCount({ ...filters, [kind]: "" }) > 0 || filters.page > 1 || filters.sort !== "featured";
  return {
    title: m.title(item.name),
    description: item.description ? `${m.intro(item.name)} ${item.description}` : m.intro(item.name),
    alternates: { canonical: `${m.base}/${slug}` },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function TaxonomyListing({ kind, slug, searchParams }: { kind: ListingKind; slug: string; searchParams: SearchParams }) {
  const item = await resolve(kind, slug);
  if (!item) notFound();

  const m = META[kind];
  const filters = { ...parseFilters(searchParams), [kind]: slug };
  const [taxonomy, result] = await Promise.all([getTaxonomy(), listGifts(filters)]);
  const tone = ACCENT_SOFT_BG[kind === "occasion" ? occasionAccent(slug, item.index) : accentAt(item.index + 1)];
  const description =
    kind === "budget" && item.description ? `${item.description}. ${m.intro(item.name)}` : (item.description ?? m.intro(item.name));

  return (
    <>
      <PageIntro
        title={m.title(item.name)}
        description={description}
        crumbs={[{ label: "Home", href: "/" }, { label: m.crumb, href: "/gift-ideas" }, { label: item.name }]}
        tone={tone}
      />
      <div className="container-page mt-10">
        <GiftBrowser
          taxonomy={taxonomy}
          filters={filters}
          result={result}
          basePath={`${m.base}/${slug}`}
          locked={kind as FilterKey}
        />
      </div>
    </>
  );
}
