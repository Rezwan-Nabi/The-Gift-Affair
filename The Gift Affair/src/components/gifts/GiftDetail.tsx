import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/PageIntro";
import { formatDate, formatPrice, hostnameOf } from "@/lib/utils";
import type { Gift, TagType } from "@/types";
import Gallery from "./Gallery";
import GiftGrid from "./GiftGrid";
import ShareButton from "./ShareButton";

const TAG_ROWS: { type: TagType; label: string; base: string }[] = [
  { type: "occasion", label: "Occasion", base: "/occasions" },
  { type: "recipient", label: "For", base: "/recipients" },
  { type: "budget", label: "Budget", base: "/budget" },
];

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i}>{p}</p>
        ))}
    </>
  );
}

/** The full gift page. Shared by the public route and the admin preview. */
export default function GiftDetail({ gift, related }: { gift: Gift; related: Gift[] }) {
  const primaryCategory = gift.categories[0];
  const price = formatPrice(gift.priceAmount, gift.currency);
  const images = [
    { path: gift.mainImagePath, alt: gift.imageAlt },
    ...gift.images.map((i) => ({ path: i.path, alt: i.alt })),
  ];
  const sourceLabel = gift.sourceName || (gift.externalUrl ? hostnameOf(gift.externalUrl) : "");

  return (
    <article>
      <div className="container-page pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Gifts", href: "/gift-ideas" },
            ...(primaryCategory ? [{ label: primaryCategory.name, href: `/categories/${primaryCategory.slug}` }] : []),
            { label: gift.title },
          ]}
        />
      </div>

      <div className="container-page mt-8 grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <Gallery images={images} />

        <div className="lg:pt-4">
          <h1 className="text-[clamp(2.2rem,4.4vw,3.5rem)]">{gift.title}</h1>
          <p className="mt-4 text-xl text-plum/85">{gift.summary}</p>

          <dl className="mt-8 grid grid-cols-[7rem_1fr] gap-x-4 gap-y-3 border-y border-plum-line py-6">
            {gift.categories.length > 0 && (
              <>
                <dt className="text-plum-soft">Category</dt>
                <dd className="flex flex-wrap gap-2">
                  {gift.categories.map((c) => (
                    <Link key={c.id} href={`/categories/${c.slug}`} className="rounded-full bg-lavender-soft px-3 py-0.5 font-medium hover:bg-lavender">
                      {c.name}
                    </Link>
                  ))}
                </dd>
              </>
            )}
            {TAG_ROWS.map(({ type, label, base }) => {
              const tags = gift.tags.filter((t) => t.tagType === type);
              if (tags.length === 0) return null;
              return (
                <div key={type} className="contents">
                  <dt className="text-plum-soft">{label}</dt>
                  <dd className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <Link key={t.id} href={`${base}/${t.slug}`} className="rounded-full bg-sunshine-soft px-3 py-0.5 font-medium hover:bg-sunshine">
                        {t.name}
                        {type === "budget" && t.description ? ` (${t.description})` : ""}
                      </Link>
                    ))}
                  </dd>
                </div>
              );
            })}
            {price && gift.priceCheckedAt && (
              <>
                <dt className="text-plum-soft">Price</dt>
                <dd>
                  <span className="font-semibold">{price}</span>
                  <span className="block text-sm text-plum-soft">
                    Checked {formatDate(gift.priceCheckedAt)}
                    {sourceLabel ? ` at ${sourceLabel}` : ""}. Prices change; confirm with the seller.
                  </span>
                </dd>
              </>
            )}
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {gift.externalUrl && (
              <a
                href={gift.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-plum px-6 font-semibold text-cream hover:bg-plum/90"
              >
                View at {sourceLabel}
                <ExternalLink className="size-4" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
            <ShareButton title={gift.title} path={`/gift-ideas/${gift.slug}`} />
          </div>
          {gift.externalUrl && (
            <p className="mt-3 text-sm text-plum-soft">
              You&apos;ll leave this site. We don&apos;t sell this item; check details and delivery with the seller.
            </p>
          )}
        </div>
      </div>

      <div className="container-page mt-16 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <section aria-labelledby="about-heading">
          <h2 id="about-heading" className="text-3xl">
            About this gift
          </h2>
          <div className="mt-4 max-w-[68ch] space-y-4 text-lg leading-relaxed">
            <Paragraphs text={gift.description} />
          </div>
        </section>
        {gift.whyThoughtful && (
          <aside aria-labelledby="why-heading" className="self-start rounded-[var(--radius-card)] bg-coral-soft p-7 md:p-8">
            <h2 id="why-heading" className="text-2xl">
              Why this makes a thoughtful gift
            </h2>
            <div className="mt-3 space-y-3 text-lg">
              <Paragraphs text={gift.whyThoughtful} />
            </div>
          </aside>
        )}
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="container-page mt-20">
          <h2 id="related-heading" className="text-[clamp(1.8rem,3.4vw,2.6rem)]">
            You might also like
          </h2>
          <div className="mt-8">
            <GiftGrid gifts={related} />
          </div>
        </section>
      )}
    </article>
  );
}
