import Link from "next/link";
import type { Gift } from "@/types";
import GiftImage from "./GiftImage";

export default function GiftCard({ gift, priority = false }: { gift: Gift; priority?: boolean }) {
  const category = gift.categories[0];
  const budget = gift.tags.find((t) => t.tagType === "budget");

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-lavender-soft">
        <GiftImage
          path={gift.mainImagePath}
          alt={gift.imageAlt}
          priority={priority}
          sizes="(min-width: 1280px) 19rem, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
          className="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
        {gift.isFeatured && (
          <span className="absolute top-3 left-3 rounded-full bg-sunshine px-3 py-1 text-xs font-semibold text-plum">
            Editor&apos;s pick
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-4">
        {(category || budget) && (
          <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-plum-soft">
            {category && <span>{category.name}</span>}
            {budget && <span className="font-medium text-plum">{budget.name}</span>}
          </p>
        )}
        <h3 className="mt-1.5 font-display text-xl leading-snug">
          <Link
            href={`/gift-ideas/${gift.slug}`}
            className="after:absolute after:inset-0 after:rounded-[var(--radius-card)]"
          >
            {gift.title}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[0.95rem] text-plum-soft">{gift.summary}</p>
        <p
          aria-hidden="true"
          className="mt-auto pt-3 text-[0.95rem] font-semibold underline decoration-coral decoration-2 underline-offset-[5px] group-hover:decoration-plum"
        >
          Explore gift
        </p>
      </div>
    </article>
  );
}
