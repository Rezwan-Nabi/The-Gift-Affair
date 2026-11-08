import Image from "next/image";
import Link from "next/link";
import { ACCENT_SOFT_BG, accentAt } from "@/lib/accents";
import { imageUrl } from "@/lib/utils";
import type { Category } from "@/types";
import SectionHeading from "./SectionHeading";

export default function CategoryCards({ categories }: { categories: Category[] }) {
  return (
    <section aria-labelledby="categories-heading" className="container-page py-16 md:py-20">
      <SectionHeading
        id="categories-heading"
        title="Explore by category"
        description="Start with the kind of gift you have in mind."
        link={{ href: "/gift-ideas", label: "See every gift" }}
      />
      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-6">
        {categories.map((c, i) => {
          const src = imageUrl(c.imagePath);
          return (
            <li key={c.id} className="group relative">
              <div className={`relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] ${ACCENT_SOFT_BG[accentAt(i)]}`}>
                {src && (
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 12rem, (min-width: 768px) 30vw, 45vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                )}
              </div>
              <h3 className="mt-3 font-display text-lg leading-snug">
                <Link href={`/categories/${c.slug}`} className="after:absolute after:inset-0">
                  {c.name}
                </Link>
              </h3>
              {c.description && <p className="mt-1 line-clamp-2 text-sm text-plum-soft">{c.description}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
