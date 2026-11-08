import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import GiftGrid from "@/components/gifts/GiftGrid";
import { Breadcrumbs } from "@/components/layout/PageIntro";
import { getAllPublicSlugs, getGuideBySlug, listGuides } from "@/lib/queries/public";
import { formatDate, imageUrl } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };
export const revalidate = 300;

export async function generateStaticParams() {
  const { guides } = await getAllPublicSlugs();
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = await getGuideBySlug((await params).slug);
  if (!guide) return { title: "Guide not found" };
  const image = imageUrl(guide.coverImagePath);
  return {
    title: guide.title,
    description: guide.introduction,
    alternates: { canonical: `/gift-guides/${guide.slug}` },
    openGraph: { type: "article", title: guide.title, description: guide.introduction, images: image ? [image] : undefined },
  };
}

export default async function GuidePage({ params }: Props) {
  const guide = await getGuideBySlug((await params).slug);
  if (!guide) notFound();
  const others = (await listGuides()).filter((g) => g.id !== guide.id).slice(0, 2);
  const cover = imageUrl(guide.coverImagePath);
  const categories = [...new Map(guide.gifts.flatMap((g) => g.categories).map((c) => [c.id, c])).values()];

  return (
    <article>
      <header className="container-page pt-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Gift guides", href: "/gift-guides" }, { label: guide.title }]} />
        <h1 className="mt-6 max-w-4xl text-[clamp(2.5rem,5.5vw,4.5rem)]">{guide.title}</h1>
        <p className="mt-5 max-w-2xl text-xl text-plum/85">{guide.introduction}</p>
        {guide.publishedAt && <p className="mt-4 text-sm text-plum-soft">Published {formatDate(guide.publishedAt)}</p>}
      </header>

      {cover && (
        <div className="container-page mt-10">
          <div className="relative aspect-[16/8] overflow-hidden rounded-[var(--radius-card)] bg-orange-soft">
            <Image src={cover} alt={guide.coverImageAlt ?? ""} fill priority sizes="(min-width: 1280px) 76rem, 100vw" className="object-cover" />
          </div>
        </div>
      )}

      {guide.content && (
        <div className="container-page mt-12">
          <div className="max-w-[66ch] space-y-5 text-lg leading-relaxed">
            {guide.content.split(/\n{2,}/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      )}

      <section aria-labelledby="picks-heading" className="container-page mt-16">
        <h2 id="picks-heading" className="text-[clamp(1.8rem,3.4vw,2.6rem)]">
          The gifts
        </h2>
        <div className="mt-8">
          <GiftGrid gifts={guide.gifts} />
        </div>
      </section>

      {(categories.length > 0 || others.length > 0) && (
        <aside className="container-page mt-20 grid gap-10 rounded-[var(--radius-card)] md:grid-cols-2">
          {categories.length > 0 && (
            <div>
              <h2 className="text-2xl">Related categories</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link href={`/categories/${c.slug}`} className="inline-flex min-h-10 items-center rounded-full bg-lavender-soft px-4 font-medium hover:bg-lavender">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {others.length > 0 && (
            <div>
              <h2 className="text-2xl">More gift guides</h2>
              <ul className="mt-4 space-y-2">
                {others.map((g) => (
                  <li key={g.id}>
                    <Link href={`/gift-guides/${g.slug}`} className="font-semibold underline decoration-coral decoration-2 underline-offset-4">
                      {g.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      )}
    </article>
  );
}
