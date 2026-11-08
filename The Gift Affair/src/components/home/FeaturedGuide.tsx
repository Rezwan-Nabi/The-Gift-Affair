import Image from "next/image";
import Link from "next/link";
import { imageUrl, plural } from "@/lib/utils";
import type { Guide } from "@/types";

export default function FeaturedGuide({ guide }: { guide: Guide }) {
  const src = imageUrl(guide.coverImagePath);
  return (
    <section aria-labelledby="guide-heading" className="container-page py-16 md:py-20">
      <div className="grid overflow-hidden rounded-[var(--radius-card)] bg-orange-soft lg:grid-cols-[1.2fr_1fr]">
        <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[28rem]">
          {src && <Image src={src} alt={guide.coverImageAlt ?? ""} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />}
        </div>
        <div className="flex flex-col justify-center p-8 md:p-12">
          <p className="text-sm font-semibold text-plum-soft">Gift guide</p>
          <h2 id="guide-heading" className="mt-2 text-[clamp(2rem,3.6vw,2.8rem)]">
            {guide.title}
          </h2>
          <p className="mt-4 text-lg text-plum/85">{guide.introduction}</p>
          <p className="mt-3 text-sm text-plum-soft">{plural(guide.gifts.length, "gift")} in this guide</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/gift-guides/${guide.slug}`}
              className="inline-flex min-h-12 items-center rounded-full bg-plum px-6 font-semibold text-cream hover:bg-plum/90"
            >
              Read the guide
            </Link>
            <Link href="/gift-guides" className="inline-flex min-h-12 items-center rounded-full px-4 font-semibold underline underline-offset-4">
              All gift guides
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
