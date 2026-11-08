"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import SearchForm from "@/components/layout/SearchForm";
import { HERO_IMAGES } from "@/lib/hero";
import type { Tag } from "@/types";

type Props = { occasions: Tag[] };

const FRAMES = ["bg-coral", "bg-sunshine", "bg-lavender"];

export default function Hero({ occasions }: Props) {
  const reduce = useReducedMotion();
  const rise: Variants = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };
  const pop: Variants = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 40, rotate: 0 },
        show: (r: number) => ({ opacity: 1, y: 0, rotate: r, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }),
      };

  const rotations = [-4, 3, -2];

  return (
    <section className="overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24">
      <motion.div
        className="container-page grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]"
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.1 }}
      >
        <div>
          <motion.h1 variants={rise} className="text-[clamp(2.9rem,7vw,5.6rem)] leading-[1.02] tracking-[-0.015em]">
            Find a gift worth remembering.
          </motion.h1>
          <motion.p variants={rise} className="mt-6 max-w-xl text-lg text-plum/80 md:text-xl">
            Curated gifts for the holud, the wedding and the reception, sorted by who it&apos;s for and what you&apos;d like
            to spend.
          </motion.p>
          <motion.div variants={rise} className="mt-8 max-w-xl">
            <SearchForm id="hero-search" size="lg" label="Search gifts" placeholder="Try “kantha”, “mugs” or “bride”" />
          </motion.div>
          <motion.div variants={rise} className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.95rem]">
            <span className="text-plum-soft">Shopping for</span>
            {occasions.map((o) => (
              <Link
                key={o.slug}
                href={`/occasions/${o.slug}`}
                className="inline-flex min-h-10 items-center rounded-full border-[1.5px] border-plum/20 bg-surface px-4 font-medium hover:border-plum"
              >
                {o.name}
              </Link>
            ))}
          </motion.div>
        </div>

        <div className="relative mx-auto grid h-[22rem] w-full max-w-lg grid-cols-3 items-end gap-3 sm:h-[28rem] lg:h-[32rem]">
          {HERO_IMAGES.map((img, i) => (
            <motion.div
              key={img.src}
              custom={rotations[i]}
              variants={pop}
              className={`relative overflow-hidden rounded-[var(--radius-arch)] p-2 ${FRAMES[i]} ${
                i === 1 ? "h-full" : i === 0 ? "h-[78%]" : "h-[66%]"
              }`}
            >
              <div className="relative h-full overflow-hidden rounded-[var(--radius-arch)] bg-cream">
                <Image src={img.src} alt={img.alt} fill priority sizes="(min-width: 1024px) 14rem, 30vw" className="object-cover" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
