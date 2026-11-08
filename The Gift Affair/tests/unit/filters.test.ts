import { describe, expect, it } from "vitest";
import { demoGifts } from "@/lib/demo/data";
import {
  activeFilterCount,
  EMPTY_FILTERS,
  filterGifts,
  filtersToQuery,
  matchesSearch,
  paginate,
  parseFilters,
  relatedGifts,
  sortGifts,
} from "@/lib/filters";

describe("parseFilters", () => {
  it("reads valid values and defaults the rest", () => {
    const f = parseFilters({ q: "  kantha ", occasion: "holud", sort: "newest", page: "2" });
    expect(f).toEqual({ ...EMPTY_FILTERS, q: "kantha", occasion: "holud", sort: "newest", page: 2 });
  });

  it("ignores malformed slugs, sorts and pages", () => {
    const f = parseFilters({ category: "<script>", budget: "Mid Range", sort: "price", page: "-3" });
    expect(f.category).toBe("");
    expect(f.budget).toBe("");
    expect(f.sort).toBe("featured");
    expect(f.page).toBe(1);
  });

  it("accepts URLSearchParams and array values", () => {
    expect(parseFilters(new URLSearchParams("recipient=the-bride")).recipient).toBe("the-bride");
    expect(parseFilters({ occasion: ["reception", "holud"] }).occasion).toBe("reception");
  });

  it("caps the search length", () => {
    expect(parseFilters({ q: "x".repeat(500) }).q).toHaveLength(100);
  });
});

describe("filtersToQuery", () => {
  it("drops defaults and resets the page when a filter changes", () => {
    const f = { ...EMPTY_FILTERS, occasion: "holud", page: 3 };
    expect(filtersToQuery(f, { budget: "premium" })).toBe("?occasion=holud&budget=premium");
  });

  it("keeps an explicit page", () => {
    expect(filtersToQuery({ ...EMPTY_FILTERS, q: "mug" }, { page: 2 })).toBe("?q=mug&page=2");
  });

  it("returns an empty string with no filters", () => {
    expect(filtersToQuery(EMPTY_FILTERS)).toBe("");
  });

  it("round-trips through parseFilters", () => {
    const f = { ...EMPTY_FILTERS, q: "star map", category: "keepsakes", sort: "newest" as const, page: 2 };
    expect(parseFilters(new URLSearchParams(filtersToQuery(f, { page: 2 })))).toEqual(f);
  });
});

describe("activeFilterCount", () => {
  it("counts search and each facet", () => {
    expect(activeFilterCount({ ...EMPTY_FILTERS, q: "x", occasion: "holud", budget: "premium" })).toBe(3);
    expect(activeFilterCount({ ...EMPTY_FILTERS, sort: "newest", page: 4 })).toBe(0);
  });
});

describe("search matching", () => {
  const gift = { title: "Hand-stitched nakshi kantha throw", summary: "A layered cotton throw", keywords: "quilt, blanket" };

  it("matches words from the title, summary or keywords, case-insensitively", () => {
    expect(matchesSearch(gift, "KANTHA")).toBe(true);
    expect(matchesSearch(gift, "cotton quilt")).toBe(true);
  });

  it("requires every word to match", () => {
    expect(matchesSearch(gift, "kantha mug")).toBe(false);
  });

  it("treats an empty query as a match", () => {
    expect(matchesSearch(gift, "   ")).toBe(true);
  });
});

describe("filterGifts (budget, occasion, category, recipient)", () => {
  it("filters by budget", () => {
    const r = filterGifts(demoGifts, { ...EMPTY_FILTERS, budget: "premium" });
    expect(r.total).toBeGreaterThan(0);
    expect(r.gifts.every((g) => g.tags.some((t) => t.tagType === "budget" && t.slug === "premium"))).toBe(true);
  });

  it("combines occasion and budget", () => {
    const r = filterGifts(demoGifts, { ...EMPTY_FILTERS, occasion: "holud", budget: "mid-range" });
    expect(r.gifts.map((g) => g.slug).sort()).toEqual(
      ["groom-grooming-kit", "holud-dala-flower-tray", "holud-self-care-hamper"].sort(),
    );
  });

  it("combines search with filters", () => {
    const r = filterGifts(demoGifts, { ...EMPTY_FILTERS, q: "frame", category: "keepsakes" });
    expect(r.gifts.map((g) => g.slug)).toEqual(["photo-frame-for-first-dance"]);
  });

  it("matches categories and recipients", () => {
    const r = filterGifts(demoGifts, { ...EMPTY_FILTERS, category: "gift-hampers", recipient: "the-groom" });
    expect(r.gifts.map((g) => g.slug).sort()).toEqual(["groom-grooming-kit", "holud-dala-flower-tray", "holud-self-care-hamper"].sort());
  });

  it("returns an empty result for no matches", () => {
    const r = filterGifts(demoGifts, { ...EMPTY_FILTERS, q: "submarine" });
    expect(r.total).toBe(0);
    expect(r.gifts).toEqual([]);
    expect(r.pageCount).toBe(1);
  });

  it("never returns unpublished ideas", () => {
    const draft = { ...demoGifts[0], id: "draft", slug: "draft", status: "draft" as const };
    const r = filterGifts([draft, ...demoGifts], { ...EMPTY_FILTERS, q: demoGifts[0].title });
    expect(r.gifts.some((g) => g.id === "draft")).toBe(false);
  });
});

describe("sorting and pagination", () => {
  it("puts featured ideas first", () => {
    const sorted = sortGifts(demoGifts, "featured");
    const firstNonFeatured = sorted.findIndex((g) => !g.isFeatured);
    expect(sorted.slice(firstNonFeatured).some((g) => g.isFeatured)).toBe(false);
  });

  it("sorts newest first", () => {
    const sorted = sortGifts(demoGifts, "newest");
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].publishedAt! >= sorted[i].publishedAt!).toBe(true);
    }
  });

  it("clamps out-of-range pages", () => {
    const p = paginate([1, 2, 3, 4, 5], 9, 2);
    expect(p.page).toBe(3);
    expect(p.items).toEqual([5]);
    expect(p.pageCount).toBe(3);
  });
});

describe("relatedGifts", () => {
  it("excludes the gift itself and prefers shared categories", () => {
    const gift = demoGifts.find((g) => g.slug === "handmade-ceramic-mugs")!;
    const related = relatedGifts(gift, demoGifts, 4);
    expect(related).toHaveLength(4);
    expect(related.some((g) => g.id === gift.id)).toBe(false);
    expect(related[0].categories.some((c) => gift.categories.some((gc) => gc.id === c.id))).toBe(true);
  });
});
