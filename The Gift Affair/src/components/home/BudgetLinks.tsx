import Link from "next/link";
import type { Tag } from "@/types";
import SectionHeading from "./SectionHeading";

const TONES = ["bg-sage-soft", "bg-orange-soft", "bg-lavender-soft"];
/** Small stacks of coins, one more per tier — a visual cue that doesn't rely on colour. */
function Coins({ n }: { n: number }) {
  return (
    <span className="flex gap-1" aria-hidden="true">
      {Array.from({ length: 3 }, (_, i) => (
        <span key={i} className={`size-3.5 rounded-full border-2 border-plum ${i < n ? "bg-sunshine" : "bg-transparent opacity-30"}`} />
      ))}
    </span>
  );
}

export default function BudgetLinks({ budgets }: { budgets: Tag[] }) {
  return (
    <section aria-labelledby="budget-heading" className="container-page py-16 md:py-20">
      <SectionHeading id="budget-heading" title="Browse by budget" description="Good gifts at every price. Pick a range and explore." />
      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {budgets.map((b, i) => (
          <li key={b.id}>
            <Link
              href={`/budget/${b.slug}`}
              className={`flex min-h-36 flex-col justify-between rounded-[var(--radius-card)] p-6 transition-colors hover:bg-surface hover:ring-2 hover:ring-plum ${TONES[i % TONES.length]}`}
            >
              <Coins n={i + 1} />
              <span>
                <span className="block font-display text-2xl">{b.name}</span>
                {b.description && <span className="mt-1 block text-plum-soft">{b.description}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
