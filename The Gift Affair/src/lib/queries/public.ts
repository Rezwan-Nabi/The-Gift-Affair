import "server-only";
import { cache } from "react";
import { PAGE_SIZE } from "@/lib/constants";
import { demoCategories, demoGifts, demoGuides, demoTags } from "@/lib/demo/data";
import { filterGifts, relatedGifts } from "@/lib/filters";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/server";
import type { Category, Gift, GiftFilters, GiftListResult, Guide, Tag, TagType, Taxonomy } from "@/types";
import {
  GIFT_SELECT,
  GUIDE_SELECT,
  toCategory,
  toGift,
  toGuide,
  toTag,
  type CategoryRow,
  type GiftRow,
  type GuideRow,
  type TagRow,
} from "./mappers";

/*
 * Public, published content only. Every function works in two modes:
 *  - Supabase configured → reads through the publishable key; RLS returns published rows only
 *  - not configured     → reads the bundled demo content (src/lib/demo)
 */

function fail(what: string, error: { message: string } | null): never {
  console.error(`[queries] ${what}:`, error?.message);
  throw new Error(`Couldn't load ${what}.`);
}

export const getTaxonomy = cache(async (): Promise<Taxonomy> => {
  let categories: Category[];
  let tags: Tag[];
  if (!isSupabaseConfigured) {
    categories = demoCategories.filter((c) => c.isActive);
    tags = demoTags.filter((t) => t.isActive);
  } else {
    const db = createPublicClient();
    const [c, t] = await Promise.all([
      db.from("categories").select("*").eq("is_active", true).order("sort_order").order("name"),
      db.from("tags").select("*").eq("is_active", true).order("sort_order").order("name"),
    ]);
    if (c.error) fail("categories", c.error);
    if (t.error) fail("tags", t.error);
    categories = (c.data as CategoryRow[]).map(toCategory);
    tags = (t.data as TagRow[]).map(toTag);
  }
  const byType = (type: TagType) => tags.filter((t) => t.tagType === type).sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    categories: categories.sort((a, b) => a.sortOrder - b.sortOrder),
    occasions: byType("occasion"),
    recipients: byType("recipient"),
    budgets: byType("budget"),
  };
});

async function giftsByIds(ids: string[]): Promise<Gift[]> {
  if (ids.length === 0) return [];
  const { data, error } = await createPublicClient().from("gift_ideas").select(GIFT_SELECT).in("id", ids);
  if (error) fail("gifts", error);
  const byId = new Map((data as GiftRow[]).map((r) => [r.id, toGift(r)]));
  return ids.map((id) => byId.get(id)).filter((g): g is Gift => !!g);
}

export const listGifts = cache(async (filters: GiftFilters, pageSize = PAGE_SIZE): Promise<GiftListResult> => {
  if (!isSupabaseConfigured) return filterGifts(demoGifts, filters, pageSize);

  const db = createPublicClient();
  const run = (page: number) =>
    db.rpc("search_gifts", {
      p_q: filters.q,
      p_category: filters.category,
      p_occasion: filters.occasion,
      p_recipient: filters.recipient,
      p_budget: filters.budget,
      p_sort: filters.sort,
      p_limit: pageSize,
      p_offset: (page - 1) * pageSize,
    });

  let page = filters.page;
  let { data, error } = await run(page);
  if (error) fail("search results", error);
  // Out-of-range page (e.g. an old link): fall back to the first page.
  if ((data ?? []).length === 0 && page > 1) {
    page = 1;
    ({ data, error } = await run(1));
    if (error) fail("search results", error);
  }
  const rows = (data ?? []) as { id: string; total_count: number }[];
  const total = rows.length ? Number(rows[0].total_count) : 0;
  return {
    gifts: await giftsByIds(rows.map((r) => r.id)),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
});

export const getFeaturedGifts = cache(async (limit = 8): Promise<Gift[]> => {
  const result = await listGifts({ q: "", category: "", occasion: "", recipient: "", budget: "", sort: "featured", page: 1 }, limit);
  return result.gifts;
});

export const getGiftBySlug = cache(async (slug: string): Promise<Gift | null> => {
  if (!isSupabaseConfigured) return demoGifts.find((g) => g.slug === slug && g.status === "published") ?? null;
  const { data, error } = await createPublicClient()
    .from("gift_ideas")
    .select(GIFT_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) fail("gift", error);
  return data ? toGift(data as GiftRow) : null;
});

export const getRelatedGifts = cache(async (gift: Gift, limit = 4): Promise<Gift[]> => {
  if (!isSupabaseConfigured) return relatedGifts(gift, demoGifts, limit);

  const db = createPublicClient();
  const catIds = gift.categories.map((c) => c.id);
  const tagIds = gift.tags.filter((t) => t.tagType !== "budget").map((t) => t.id);
  const [c, t] = await Promise.all([
    catIds.length ? db.from("gift_category_links").select("gift_id").in("category_id", catIds) : { data: [], error: null },
    tagIds.length ? db.from("gift_tag_links").select("gift_id").in("tag_id", tagIds) : { data: [], error: null },
  ]);
  if (c.error) fail("related gifts", c.error);
  if (t.error) fail("related gifts", t.error);

  const score = new Map<string, number>();
  for (const r of (c.data ?? []) as { gift_id: string }[]) score.set(r.gift_id, (score.get(r.gift_id) ?? 0) + 2);
  for (const r of (t.data ?? []) as { gift_id: string }[]) score.set(r.gift_id, (score.get(r.gift_id) ?? 0) + 1);
  score.delete(gift.id);
  const ids = [...score.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
  return giftsByIds(ids);
});

export const getCategoryBySlug = cache(async (slug: string): Promise<Category | null> => {
  const { categories } = await getTaxonomy();
  return categories.find((c) => c.slug === slug) ?? null;
});

export const getTagBySlug = cache(async (type: TagType, slug: string): Promise<Tag | null> => {
  const t = await getTaxonomy();
  const list = type === "occasion" ? t.occasions : type === "recipient" ? t.recipients : t.budgets;
  return list.find((x) => x.slug === slug) ?? null;
});

export const listGuides = cache(async (): Promise<Guide[]> => {
  if (!isSupabaseConfigured) return demoGuides.filter((g) => g.status === "published");
  const { data, error } = await createPublicClient()
    .from("gift_guides")
    .select(GUIDE_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) fail("gift guides", error);
  return (data as GuideRow[]).map(toGuide);
});

export const getGuideBySlug = cache(async (slug: string): Promise<Guide | null> => {
  if (!isSupabaseConfigured) return demoGuides.find((g) => g.slug === slug && g.status === "published") ?? null;
  const { data, error } = await createPublicClient()
    .from("gift_guides")
    .select(GUIDE_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) fail("gift guide", error);
  return data ? toGuide(data as GuideRow) : null;
});

/** For the sitemap. */
export async function getAllPublicSlugs() {
  if (!isSupabaseConfigured) {
    return {
      gifts: demoGifts.map((g) => ({ slug: g.slug, updatedAt: g.updatedAt })),
      guides: demoGuides.map((g) => ({ slug: g.slug, updatedAt: g.updatedAt })),
    };
  }
  const db = createPublicClient();
  const [g, gd] = await Promise.all([
    db.from("gift_ideas").select("slug, updated_at").eq("status", "published"),
    db.from("gift_guides").select("slug, updated_at").eq("status", "published"),
  ]);
  if (g.error) fail("sitemap gifts", g.error);
  if (gd.error) fail("sitemap guides", gd.error);
  const map = (rows: { slug: string; updated_at: string }[]) => rows.map((r) => ({ slug: r.slug, updatedAt: r.updated_at }));
  return { gifts: map(g.data ?? []), guides: map(gd.data ?? []) };
}
