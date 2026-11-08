import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/constants";
import { getAllPublicSlugs, getTaxonomy } from "@/lib/queries/public";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ gifts, guides }, t] = await Promise.all([getAllPublicSlugs(), getTaxonomy()]);
  const page = (path: string, lastModified?: string, priority = 0.6): MetadataRoute.Sitemap[number] => ({
    url: `${siteUrl}${path}`,
    lastModified: lastModified ? new Date(lastModified) : undefined,
    priority,
  });
  return [
    page("/", undefined, 1),
    page("/gift-ideas", undefined, 0.9),
    page("/gift-guides", undefined, 0.8),
    page("/about", undefined, 0.3),
    page("/contact", undefined, 0.3),
    ...t.categories.map((c) => page(`/categories/${c.slug}`, undefined, 0.7)),
    ...t.occasions.map((o) => page(`/occasions/${o.slug}`, undefined, 0.7)),
    ...t.recipients.map((r) => page(`/recipients/${r.slug}`, undefined, 0.6)),
    ...t.budgets.map((b) => page(`/budget/${b.slug}`, undefined, 0.6)),
    ...gifts.map((g) => page(`/gift-ideas/${g.slug}`, g.updatedAt, 0.8)),
    ...guides.map((g) => page(`/gift-guides/${g.slug}`, g.updatedAt, 0.7)),
  ];
}
