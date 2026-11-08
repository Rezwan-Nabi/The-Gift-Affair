import Link from "next/link";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm text-plum-soft", className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">/</span>}
            {c.href ? (
              <Link href={c.href} className="underline-offset-4 hover:text-plum hover:underline">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-plum">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Coloured title band used at the top of listing pages. */
export default function PageIntro({
  title,
  description,
  crumbs,
  tone = "bg-coral-soft",
  children,
}: {
  title: string;
  description?: string | null;
  crumbs?: Crumb[];
  tone?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className={cn("pt-8 pb-12 md:pt-10 md:pb-16", tone)}>
      <div className="container-page">
        {crumbs && <Breadcrumbs items={crumbs} />}
        <h1 className="mt-5 max-w-3xl text-[clamp(2.4rem,5vw,4rem)]">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-lg text-plum/80">{description}</p>}
        {children}
      </div>
    </section>
  );
}
