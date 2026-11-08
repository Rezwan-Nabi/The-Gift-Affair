import { X } from "lucide-react";
import Link from "next/link";
import { FILTER_KEYS, filtersToQuery, type FilterKey } from "@/lib/filters";
import { plural } from "@/lib/utils";
import type { GiftFilters, Taxonomy } from "@/types";

type Props = {
  taxonomy: Taxonomy;
  filters: GiftFilters;
  basePath: string;
  locked?: FilterKey;
  total: number;
};

/** Result count plus removable chips for each active filter (plain links, so no JS is needed). */
export default function ActiveFilters({ taxonomy, filters, basePath, locked, total }: Props) {
  const lists: Record<FilterKey, { slug: string; name: string }[]> = {
    category: taxonomy.categories,
    occasion: taxonomy.occasions,
    recipient: taxonomy.recipients,
    budget: taxonomy.budgets,
  };
  const base = locked ? { ...filters, [locked]: "" } : filters;
  const chips = [
    ...(filters.q ? [{ key: "q" as const, label: `“${filters.q}”` }] : []),
    ...FILTER_KEYS.filter((k) => k !== locked && filters[k]).map((k) => ({
      key: k,
      label: lists[k].find((o) => o.slug === filters[k])?.name ?? filters[k],
    })),
  ];
  const clearAll = `${basePath}${filtersToQuery({ ...base, q: "", category: "", occasion: "", recipient: "", budget: "" })}`;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <p className="font-semibold" aria-live="polite">
        {plural(total, "gift")}
      </p>
      {chips.length > 0 && (
        <>
          <ul className="flex flex-wrap gap-2" aria-label="Active filters">
            {chips.map((c) => (
              <li key={c.key}>
                <Link
                  href={`${basePath}${filtersToQuery(base, { [c.key]: "" })}`}
                  scroll={false}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-lavender-soft py-1 pr-2.5 pl-3.5 text-sm font-medium hover:bg-lavender"
                >
                  <span className="sr-only">Remove filter: </span>
                  {c.label}
                  <X className="size-3.5" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <Link href={clearAll} scroll={false} className="text-sm font-semibold underline underline-offset-4 hover:text-plum-soft">
            Clear all filters
          </Link>
        </>
      )}
    </div>
  );
}
