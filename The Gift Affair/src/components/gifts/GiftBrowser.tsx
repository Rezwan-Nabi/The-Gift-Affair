import Link from "next/link";
import ActiveFilters from "@/components/filters/ActiveFilters";
import FilterControls from "@/components/filters/FilterControls";
import Pagination from "@/components/filters/Pagination";
import { filtersToQuery, type FilterKey } from "@/lib/filters";
import type { GiftFilters, GiftListResult, Taxonomy } from "@/types";
import GiftGrid from "./GiftGrid";

type Props = {
  taxonomy: Taxonomy;
  filters: GiftFilters;
  result: GiftListResult;
  basePath: string;
  locked?: FilterKey;
};

/** Filters, result count, grid, empty state and pagination for any gift listing. */
export default function GiftBrowser({ taxonomy, filters, result, basePath, locked }: Props) {
  const linkFilters = locked ? { ...filters, [locked]: "" } : filters;
  const hasNarrowing = Boolean(
    filters.q || (["category", "occasion", "recipient", "budget"] as const).some((k) => k !== locked && filters[k]),
  );

  return (
    <div>
      <div className="rounded-[var(--radius-card)] bg-surface p-4 ring-1 ring-plum-line md:p-5">
        <FilterControls taxonomy={taxonomy} filters={filters} basePath={basePath} locked={locked} />
      </div>
      <div className="mt-6">
        <ActiveFilters taxonomy={taxonomy} filters={filters} basePath={basePath} locked={locked} total={result.total} />
      </div>

      <div className="mt-8">
        {result.gifts.length > 0 ? (
          <GiftGrid gifts={result.gifts} priorityCount={2} />
        ) : (
          <div className="rounded-[var(--radius-card)] bg-sunshine-soft px-6 py-12 text-center md:px-12">
            <h2 className="font-display text-3xl">
              {filters.q ? `No gifts match “${filters.q}”` : "No gifts match these filters"}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-plum-soft">
              {filters.q
                ? "Try a shorter or more general word, such as “frame” or “hamper”, or remove a filter."
                : "Try removing a filter or choosing a different budget."}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {hasNarrowing && (
                <Link
                  href={`${basePath}${filtersToQuery({ ...linkFilters, q: "", category: "", occasion: "", recipient: "", budget: "" })}`}
                  className="inline-flex min-h-11 items-center rounded-full bg-plum px-5 font-semibold text-cream hover:bg-plum/90"
                >
                  Clear all filters
                </Link>
              )}
              {taxonomy.categories.slice(0, 3).map((c) => (
                <Link
                  key={c.slug}
                  href={`/categories/${c.slug}`}
                  className="inline-flex min-h-11 items-center rounded-full border-[1.5px] border-plum/70 px-5 font-semibold hover:bg-plum hover:text-cream"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Pagination filters={linkFilters} basePath={basePath} page={result.page} pageCount={result.pageCount} />
    </div>
  );
}
