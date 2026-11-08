"use client";

import { SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { activeFilterCount, filtersToQuery, type FilterKey } from "@/lib/filters";
import type { GiftFilters, Taxonomy } from "@/types";

type Props = {
  taxonomy: Taxonomy;
  filters: GiftFilters;
  /** Path the filters apply to, e.g. the gifts page or /occasions/holud. */
  basePath: string;
  /** The facet fixed by the page (e.g. occasion on /occasions/holud); its control is hidden. */
  locked?: FilterKey;
};

const LABELS: Record<FilterKey, { label: string; any: string }> = {
  category: { label: "Category", any: "All categories" },
  occasion: { label: "Occasion", any: "Any occasion" },
  recipient: { label: "Recipient", any: "Anyone" },
  budget: { label: "Budget", any: "Any budget" },
};

function Fields({
  taxonomy,
  filters,
  locked,
  onChange,
  idPrefix,
  layout,
}: Omit<Props, "basePath"> & {
  onChange: (key: keyof GiftFilters, value: string) => void;
  idPrefix: string;
  layout: "row" | "stack";
}) {
  const options: Record<FilterKey, { slug: string; name: string }[]> = {
    category: taxonomy.categories,
    occasion: taxonomy.occasions,
    recipient: taxonomy.recipients,
    budget: taxonomy.budgets,
  };
  const keys = (Object.keys(LABELS) as FilterKey[]).filter((k) => k !== locked);

  return (
    <div className={layout === "row" ? "grid grid-cols-2 gap-3 lg:flex lg:flex-wrap lg:items-end" : "space-y-5"}>
      {keys.map((key) => (
        <div key={key} className={layout === "row" ? "lg:w-48" : undefined}>
          <label htmlFor={`${idPrefix}-${key}`} className="mb-1.5 block text-sm font-semibold">
            {LABELS[key].label}
          </label>
          <select
            id={`${idPrefix}-${key}`}
            name={key}
            value={filters[key]}
            onChange={(e) => onChange(key, e.target.value)}
            className="field field-select min-h-11 text-[0.95rem]"
          >
            <option value="">{LABELS[key].any}</option>
            {options[key].map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      ))}
      <div className={layout === "row" ? "lg:ml-auto lg:w-44" : undefined}>
        <label htmlFor={`${idPrefix}-sort`} className="mb-1.5 block text-sm font-semibold">
          Sort by
        </label>
        <select
          id={`${idPrefix}-sort`}
          name="sort"
          value={filters.sort}
          onChange={(e) => onChange("sort", e.target.value)}
          className="field field-select min-h-11 text-[0.95rem]"
        >
          <option value="featured">Featured first</option>
          <option value="newest">Newest</option>
        </select>
      </div>
    </div>
  );
}

/**
 * Filter selects that update the URL (so filtered views can be shared and bookmarked).
 * Without JavaScript they still work as a GET form with an Apply button.
 */
export default function FilterControls({ taxonomy, filters, basePath, locked }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const id = useId();

  useEffect(() => setHydrated(true), []);
  useEffect(() => setDraft(filters), [filters]);

  const go = (next: GiftFilters) => {
    const clean = locked ? { ...next, [locked]: "" } : next;
    startTransition(() => router.push(`${basePath}${filtersToQuery(clean, { page: 1 })}`, { scroll: false }));
  };

  const applyNow = (key: keyof GiftFilters, value: string) => go({ ...filters, [key]: value } as GiftFilters);
  const updateDraft = (key: keyof GiftFilters, value: string) => setDraft((d) => ({ ...d, [key]: value }) as GiftFilters);
  const count = activeFilterCount({ ...filters, q: "", ...(locked ? { [locked]: "" } : {}) });

  return (
    <div aria-busy={pending}>
      {/* Tablet and desktop: inline controls that apply immediately */}
      <form action={basePath} method="get" className="hidden md:block" aria-label="Filter gifts">
        {filters.q && <input type="hidden" name="q" value={filters.q} />}
        <Fields taxonomy={taxonomy} filters={filters} locked={locked} onChange={applyNow} idPrefix={`${id}-row`} layout="row" />
        {!hydrated && (
          <Button type="submit" variant="outline" size="sm" className="mt-3">
            Apply filters
          </Button>
        )}
      </form>

      {/* Mobile: a drawer, applied with one button so the page doesn't jump on every change */}
      <div className="md:hidden">
        <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <SlidersHorizontal aria-hidden="true" />
              Filter and sort{count > 0 ? ` (${count})` : ""}
            </Button>
          </DialogTrigger>
          <DialogContent side="right" closeLabel="Close filters">
            <DialogTitle className="font-display text-2xl">Filter and sort</DialogTitle>
            <DialogDescription className="mt-1 text-plum-soft">Narrow the gifts to what suits your occasion.</DialogDescription>
            <form
              action={basePath}
              method="get"
              className="mt-6"
              onSubmit={(e) => {
                e.preventDefault();
                setDrawerOpen(false);
                go(draft);
              }}
            >
              {filters.q && <input type="hidden" name="q" value={filters.q} />}
              <Fields taxonomy={taxonomy} filters={draft} locked={locked} onChange={updateDraft} idPrefix={`${id}-drawer`} layout="stack" />
              <div className="mt-8 flex gap-3">
                <Button type="submit" className="flex-1">
                  Show gifts
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setDraft({ ...draft, category: "", occasion: "", recipient: "", budget: "", sort: "featured" })}
                >
                  Reset
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {pending ? "Updating results…" : ""}
      </p>
    </div>
  );
}
