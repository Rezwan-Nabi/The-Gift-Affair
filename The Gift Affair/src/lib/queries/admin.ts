import "server-only";
import type { EditorSession } from "@/lib/auth";
import type { Category, ContentStatus, Gift, Guide, Tag } from "@/types";
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

/* Admin reads. They use the editor's session, so RLS returns drafts and inactive rows too. */

type Db = EditorSession["supabase"];

function check<T>(what: string, res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) {
    console.error(`[admin] ${what}:`, res.error.message);
    throw new Error(`Couldn't load ${what}.`);
  }
  return res.data as T;
}

export async function getDashboardStats(db: Db) {
  const count = (status?: ContentStatus) => {
    let q = db.from("gift_ideas").select("id", { count: "exact", head: true });
    if (status) q = q.eq("status", status);
    return q;
  };
  const [all, published, drafts, categories, recent] = await Promise.all([
    count(),
    count("published"),
    count("draft"),
    db.from("categories").select("id", { count: "exact", head: true }),
    db.from("gift_ideas").select("id, title, slug, status, updated_at").order("updated_at", { ascending: false }).limit(6),
  ]);
  for (const r of [all, published, drafts, categories, recent]) if (r.error) check("dashboard", r);
  return {
    total: all.count ?? 0,
    published: published.count ?? 0,
    drafts: drafts.count ?? 0,
    categories: categories.count ?? 0,
    recent: (recent.data ?? []) as { id: string; title: string; slug: string; status: ContentStatus; updated_at: string }[],
  };
}

export async function listAdminGifts(db: Db, opts: { status?: ContentStatus | ""; q?: string }) {
  let q = db
    .from("gift_ideas")
    .select("id, title, slug, status, is_featured, main_image_path, image_alt, updated_at")
    .order("updated_at", { ascending: false })
    .limit(200);
  if (opts.status) q = q.eq("status", opts.status);
  if (opts.q) q = q.ilike("title", `%${opts.q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`);
  return check(
    "gifts",
    await q,
  ) as {
    id: string;
    title: string;
    slug: string;
    status: ContentStatus;
    is_featured: boolean;
    main_image_path: string | null;
    image_alt: string | null;
    updated_at: string;
  }[];
}

export async function getAdminGift(db: Db, id: string): Promise<Gift | null> {
  const data = check("gift", await db.from("gift_ideas").select(GIFT_SELECT).eq("id", id).maybeSingle());
  return data ? toGift(data as GiftRow) : null;
}

export async function getAdminTaxonomy(db: Db): Promise<{ categories: Category[]; tags: Tag[] }> {
  const [c, t] = await Promise.all([
    db.from("categories").select("*").order("sort_order").order("name"),
    db.from("tags").select("*").order("tag_type").order("sort_order").order("name"),
  ]);
  return {
    categories: (check("categories", c) as CategoryRow[]).map(toCategory),
    tags: (check("tags", t) as TagRow[]).map(toTag),
  };
}

export async function getUsageCounts(db: Db) {
  const [c, t] = await Promise.all([
    db.from("gift_category_links").select("category_id"),
    db.from("gift_tag_links").select("tag_id"),
  ]);
  const tally = (rows: Record<string, string>[], key: string) =>
    rows.reduce<Record<string, number>>((acc, r) => ((acc[r[key]] = (acc[r[key]] ?? 0) + 1), acc), {});
  return {
    categories: tally((check("links", c) ?? []) as Record<string, string>[], "category_id"),
    tags: tally((check("links", t) ?? []) as Record<string, string>[], "tag_id"),
  };
}

export async function listAdminGuides(db: Db) {
  return check(
    "guides",
    await db.from("gift_guides").select("id, title, slug, status, updated_at").order("updated_at", { ascending: false }),
  ) as { id: string; title: string; slug: string; status: ContentStatus; updated_at: string }[];
}

export async function getAdminGuide(db: Db, id: string): Promise<Guide | null> {
  const data = check("guide", await db.from("gift_guides").select(GUIDE_SELECT).eq("id", id).maybeSingle());
  return data ? toGuide(data as GuideRow) : null;
}

export async function listGiftOptions(db: Db) {
  return check(
    "gift options",
    await db.from("gift_ideas").select("id, title, status").neq("status", "archived").order("title"),
  ) as { id: string; title: string; status: ContentStatus }[];
}
