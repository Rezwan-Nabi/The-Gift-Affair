import type { Category, Gift, Guide, Tag } from "@/types";
import seed from "./seed.json";

/**
 * Sample content used when Supabase isn't configured ("demo mode").
 * supabase/seed.sql is generated from the same seed.json, so both match.
 */

const BASE = Date.UTC(2026, 9, 20, 9, 0, 0); // fixed, so demo output is stable
const daysAgo = (d: number) => new Date(BASE - d * 86_400_000).toISOString();

export const demoCategories: Category[] = seed.categories.map((c) => ({ ...c }));

export const demoTags: Tag[] = seed.tags.map((t) => ({ ...t, tagType: t.tagType as Tag["tagType"] }));

const tagBy = (type: Tag["tagType"], slug: string) => demoTags.find((t) => t.tagType === type && t.slug === slug)!;

export const demoGifts: Gift[] = seed.gifts.map((g) => ({
  id: g.id,
  title: g.title,
  slug: g.slug,
  summary: g.summary,
  description: g.description,
  whyThoughtful: g.whyThoughtful,
  keywords: g.keywords,
  mainImagePath: g.mainImagePath,
  imageAlt: g.imageAlt,
  priceAmount: null,
  currency: null,
  priceCheckedAt: null,
  externalUrl: g.externalUrl,
  sourceName: g.sourceName,
  isFeatured: g.isFeatured,
  status: "published",
  publishedAt: daysAgo(g.daysAgo),
  createdAt: daysAgo(g.daysAgo),
  updatedAt: daysAgo(g.daysAgo),
  categories: g.categorySlugs.map((s) => demoCategories.find((c) => c.slug === s)!),
  tags: [
    ...g.occasionSlugs.map((s) => tagBy("occasion", s)),
    ...g.recipientSlugs.map((s) => tagBy("recipient", s)),
    tagBy("budget", g.budgetSlug),
  ],
  images: [],
}));

export const demoGuides: Guide[] = seed.guides.map((gd) => ({
  id: gd.id,
  title: gd.title,
  slug: gd.slug,
  introduction: gd.introduction,
  content: gd.content,
  coverImagePath: gd.coverImagePath,
  coverImageAlt: gd.coverImageAlt,
  status: "published",
  publishedAt: daysAgo(gd.daysAgo),
  createdAt: daysAgo(gd.daysAgo),
  updatedAt: daysAgo(gd.daysAgo),
  gifts: gd.giftSlugs.map((s) => demoGifts.find((g) => g.slug === s)!),
}));
