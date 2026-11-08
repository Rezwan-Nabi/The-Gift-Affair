import Image from "next/image";
import Link from "next/link";
import { ACCENT_BG, occasionAccent } from "@/lib/accents";
import type { Tag } from "@/types";
import SectionHeading from "./SectionHeading";

/** One colour field per ceremony: yellow for the holud, coral for the wedding, lavender for the reception. */
export default function OccasionCollections({ occasions, counts }: { occasions: Tag[]; counts: Record<string, number> }) {
  return (
    <section aria-labelledby="occasions-heading" className="container-page py-16 md:py-20">
      <SectionHeading
        id="occasions-heading"
        title="Browse by occasion"
        description="Each ceremony has its own mood. Find gifts that suit the day you're celebrating."
      />
      <ul className="mt-10 grid gap-5 md:grid-cols-3">
        {occasions.map((o, i) => (
          <li
            key={o.id}
            className={`group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] ${ACCENT_BG[occasionAccent(o.slug, i)]}`}
          >
            <div className="p-6 pb-4 md:p-8 md:pb-5">
              <h3 className="text-3xl md:text-4xl">
                <Link href={`/occasions/${o.slug}`} className="after:absolute after:inset-0">
                  {o.name}
                </Link>
              </h3>
              {o.description && <p className="mt-2 max-w-xs text-plum/85">{o.description}</p>}
              <p className="mt-4 text-sm font-semibold">
                {counts[o.slug] ?? 0} gifts
              </p>
            </div>
            <div className="relative mx-4 mb-4 mt-auto aspect-[4/3] overflow-hidden rounded-[calc(var(--radius-card)-0.4rem)] md:mx-5 md:mb-5">
              <Image
                src={`/images/occasions/${o.slug}.jpg`}
                alt=""
                fill
                sizes="(min-width: 768px) 30vw, 92vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
