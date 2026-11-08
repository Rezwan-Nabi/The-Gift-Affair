import { PAGE_SIZE } from "./constants";
import type { Gift, GiftFilters, GiftListResult, GiftSort, TagType } from "@/types";

export const FILTER_KEYS = ["category", "occasion", "recipient", "budget"] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];

export const EMPTY_FILTERS: GiftFilters = {
  q: "",
  category: "",
  occasion: "",
  recipient: "",
  budget: "",
  sort: "featured",
  page: 1,
};

type SearchParamsLike = Record<string, string | string[] | undefined> | URLSearchParams;

function read(params: SearchParamsLike, key: string): string {
  const v = params instanceof URLSearchParams ? params.get(key) : params[key];
  const s = Array.isArray(v) ? v[0] : v;
  return (s ?? "").trim();
}

const SLUG_RE = /^[a-z0-9-]{1,80}$/;

/** Reads filters from URL query parameters, ignoring anything malformed. */
export function parseFilters(params: SearchParamsLike): GiftFilters {
  const slug = (k: string) => {
    const v = read(params, k).toLowerCase();
    return SLUG_RE.test(v) ? v : "";
  };
  const sort = read(params, "sort");
  const page = Number.parseInt(read(params, "page"), 10);
  return {
    q: read(params, "q").slice(0, 100),
    category: slug("category"),
    occasion: slug("occasion"),
    recipient: slug("recipient"),
    budget: slug("budget"),
    sort: (sort === "newest" ? "newest" : "featured") satisfies GiftSort,
    page: Number.isFinite(page) && page > 0 ? Math.min(page, 1000) : 1,
  };
}

/** Builds a query string, dropping defaults. Changing any filter resets to page 1 unless a page is given. */
export function filtersToQuery(filters: GiftFilters, overrides: Partial<GiftFilters> = {}): string {
  const next = { ...filters, ...overrides };
  if (!("page" in overrides)) next.page = 1;
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  for (const key of FILTER_KEYS) if (next[key]) params.set(key, next[key]);
  if (next.sort !== "featured") params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function activeFilterCount(f: GiftFilters): number {
  return FILTER_KEYS.filter((k) => f[k]).length + (f.q ? 1 : 0);
}

export function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 0);
}

/** Every search word must appear in the title, summary or keywords. */
export function matchesSearch(gift: Pick<Gift, "title" | "summary" | "keywords">, q: string): boolean {
  const tokens = tokenize(q);
  if (tokens.length === 0) return true;
  const haystack = `${gift.title} ${gift.summary} ${gift.keywords ?? ""}`.toLowerCase();
  return tokens.every((t) => haystack.includes(t));
}

function hasTag(gift: Gift, type: TagType, slug: string) {
  return gift.tags.some((t) => t.tagType === type && t.slug === slug);
}

export function matchesFilters(gift: Gift, f: GiftFilters): boolean {
  if (f.category && !gift.categories.some((c) => c.slug === f.category)) return false;
  if (f.occasion && !hasTag(gift, "occasion", f.occasion)) return false;
  if (f.recipient && !hasTag(gift, "recipient", f.recipient)) return false;
  if (f.budget && !hasTag(gift, "budget", f.budget)) return false;
  return matchesSearch(gift, f.q);
}

export function sortGifts(gifts: Gift[], sort: GiftSort): Gift[] {
  const byDate = (a: Gift, b: Gift) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt);
  return [...gifts].sort((a, b) =>
    sort === "featured" ? Number(b.isFeatured) - Number(a.isFeatured) || byDate(a, b) : byDate(a, b),
  );
}

export function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  return { items: items.slice((safePage - 1) * pageSize, safePage * pageSize), page: safePage, pageCount };
}

/** In-memory search/filter/sort/paginate, used by demo mode and as the reference for the SQL function. */
export function filterGifts(all: Gift[], f: GiftFilters, pageSize = PAGE_SIZE): GiftListResult {
  const matched = sortGifts(
    all.filter((g) => g.status === "published" && matchesFilters(g, f)),
    f.sort,
  );
  const { items, page, pageCount } = paginate(matched, f.page, pageSize);
  return { gifts: items, total: matched.length, page, pageSize, pageCount };
}

/** Gifts sharing the most categories and tags with the given one. */
export function relatedGifts(gift: Gift, all: Gift[], limit = 4): Gift[] {
  const cats = new Set(gift.categories.map((c) => c.id));
  const tags = new Set(gift.tags.map((t) => t.id));
  return all
    .filter((g) => g.id !== gift.id && g.status === "published")
    .map((g) => ({
      g,
      score:
        g.categories.filter((c) => cats.has(c.id)).length * 2 + g.tags.filter((t) => tags.has(t.id)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || Number(b.g.isFeatured) - Number(a.g.isFeatured))
    .slice(0, limit)
    .map((x) => x.g);
}
