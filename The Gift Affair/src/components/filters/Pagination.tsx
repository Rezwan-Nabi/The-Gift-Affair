import Link from "next/link";
import { filtersToQuery } from "@/lib/filters";
import type { GiftFilters } from "@/types";

export default function Pagination({
  filters,
  basePath,
  page,
  pageCount,
}: {
  filters: GiftFilters;
  basePath: string;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;
  const href = (p: number) => `${basePath}${filtersToQuery(filters, { page: p })}`;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1,
  );

  const item = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 font-medium";
  return (
    <nav aria-label="Pagination" className="mt-14 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link href={href(page - 1)} className={`${item} border border-plum/25 hover:bg-surface`} rel="prev">
          Previous
        </Link>
      )}
      {pages.map((p, i) => (
        <span key={p} className="contents">
          {i > 0 && p - pages[i - 1] > 1 && <span className="px-1 text-plum-soft" aria-hidden="true">…</span>}
          <Link
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${item} ${p === page ? "bg-plum text-cream" : "hover:bg-surface"}`}
          >
            <span className="sr-only">Page </span>
            {p}
          </Link>
        </span>
      ))}
      {page < pageCount && (
        <Link href={href(page + 1)} className={`${item} border border-plum/25 hover:bg-surface`} rel="next">
          Next
        </Link>
      )}
    </nav>
  );
}
