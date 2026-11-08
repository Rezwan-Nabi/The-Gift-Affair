import type { Category, ContentStatus, Gift, GiftImage, Guide, Tag } from "@/types";

/* Database rows (snake_case) → app types (camelCase). */

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_path: string | null;
  sort_order: number;
  is_active: boolean;
};

export type TagRow = {
  id: string;
  name: string;
  slug: string;
  tag_type: Tag["tagType"];
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

export type GiftRow = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  why_it_is_thoughtful: string | null;
  keywords: string | null;
  main_image_path: string | null;
  image_alt: string | null;
  price_amount: number | string | null;
  currency: string | null;
  price_checked_at: string | null;
  external_url: string | null;
  source_name: string | null;
  is_featured: boolean;
  status: ContentStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  gift_category_links?: { categories: CategoryRow | null }[] | null;
  gift_tag_links?: { tags: TagRow | null }[] | null;
  gift_images?: { id: string; path: string; alt: string; sort_order: number }[] | null;
};

export type GuideRow = {
  id: string;
  title: string;
  slug: string;
  introduction: string;
  content: string;
  cover_image_path: string | null;
  cover_image_alt: string | null;
  status: ContentStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  gift_guide_items?: { sort_order: number; gift_ideas: GiftRow | null }[] | null;
};

/** Select string that loads a gift with its categories, tags and gallery. */
export const GIFT_SELECT =
  "*, gift_category_links(categories(*)), gift_tag_links(tags(*)), gift_images(id, path, alt, sort_order)";

export const GUIDE_SELECT = `*, gift_guide_items(sort_order, gift_ideas(${GIFT_SELECT}))`;

export function toCategory(r: CategoryRow): Category {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    imagePath: r.image_path,
    sortOrder: r.sort_order,
    isActive: r.is_active,
  };
}

export function toTag(r: TagRow): Tag {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    tagType: r.tag_type,
    description: r.description,
    sortOrder: r.sort_order,
    isActive: r.is_active,
  };
}

export function toGift(r: GiftRow): Gift {
  const images: GiftImage[] = (r.gift_images ?? [])
    .map((i) => ({ id: i.id, path: i.path, alt: i.alt, sortOrder: i.sort_order }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    summary: r.summary,
    description: r.description,
    whyThoughtful: r.why_it_is_thoughtful,
    keywords: r.keywords,
    mainImagePath: r.main_image_path,
    imageAlt: r.image_alt,
    priceAmount: r.price_amount == null ? null : Number(r.price_amount),
    currency: r.currency,
    priceCheckedAt: r.price_checked_at,
    externalUrl: r.external_url,
    sourceName: r.source_name,
    isFeatured: r.is_featured,
    status: r.status,
    publishedAt: r.published_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    categories: (r.gift_category_links ?? [])
      .map((l) => l.categories)
      .filter((c): c is CategoryRow => !!c)
      .map(toCategory)
      .sort((a, b) => a.sortOrder - b.sortOrder),
    tags: (r.gift_tag_links ?? [])
      .map((l) => l.tags)
      .filter((t): t is TagRow => !!t)
      .map(toTag)
      .sort((a, b) => a.sortOrder - b.sortOrder),
    images,
  };
}

export function toGuide(r: GuideRow): Guide {
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    introduction: r.introduction,
    content: r.content,
    coverImagePath: r.cover_image_path,
    coverImageAlt: r.cover_image_alt,
    status: r.status,
    publishedAt: r.published_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    gifts: (r.gift_guide_items ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((i) => i.gift_ideas)
      .filter((g): g is GiftRow => !!g)
      .map(toGift),
  };
}
