import Image from "next/image";
import Link from "next/link";
import { imageUrl, plural } from "@/lib/utils";
import type { Guide } from "@/types";

export default function GuideCard({ guide }: { guide: Guide }) {
  const src = imageUrl(guide.coverImagePath);
  return (
    <article className="group relative">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] bg-orange-soft">
        {src && (
          <Image
            src={src}
            alt={guide.coverImageAlt ?? ""}
            fill
            sizes="(min-width: 768px) 45vw, 92vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <h2 className="mt-5 text-3xl">
        <Link href={`/gift-guides/${guide.slug}`} className="after:absolute after:inset-0">
          {guide.title}
        </Link>
      </h2>
      <p className="mt-2 text-lg text-plum-soft">{guide.introduction}</p>
      <p className="mt-3 text-sm font-semibold">{plural(guide.gifts.length, "gift")}</p>
    </article>
  );
}
