import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { CONTACT_EMAIL, SITE_DESCRIPTION, SITE_NAME, SOCIAL_LINKS } from "@/lib/constants";
import type { Taxonomy } from "@/types";

export default function SiteFooter({ taxonomy }: { taxonomy: Taxonomy }) {
  const year = new Date().getFullYear();
  const cols = [
    { title: "Occasions", base: "/occasions", items: taxonomy.occasions },
    { title: "Categories", base: "/categories", items: taxonomy.categories },
  ];

  return (
    <footer className="mt-24">
      <div className="garland" aria-hidden="true" />
      <div className="bg-plum text-cream/85">
        <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo className="text-cream" />
            <p className="mt-4 max-w-xs">{SITE_DESCRIPTION}</p>
            <p className="mt-4">
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline decoration-coral decoration-2 underline-offset-4 hover:text-cream">
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
          {cols.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="font-display text-lg text-cream">{col.title}</h2>
              <ul className="mt-3 space-y-1">
                {col.items.map((i) => (
                  <li key={i.slug}>
                    <Link href={`${col.base}/${i.slug}`} className="inline-flex min-h-9 items-center hover:text-cream">
                      {i.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <nav aria-label="About this site">
            <h2 className="font-display text-lg text-cream">{SITE_NAME}</h2>
            <ul className="mt-3 space-y-1">
              {[
                ["All gifts", "/gift-ideas"],
                ["Gift guides", "/gift-guides"],
                ["About", "/about"],
                ["Contact", "/contact"],
                ["Privacy", "/privacy"],
                ["Terms", "/terms"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="inline-flex min-h-9 items-center hover:text-cream">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            {SOCIAL_LINKS.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1" aria-label="Social media">
                {SOCIAL_LINKS.map((s) => (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-9 items-center font-semibold text-sunshine hover:text-cream"
                    >
                      {s.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </nav>
        </div>
        <div className="border-t border-cream/15">
          <p className="container-page py-6 text-sm text-cream/65">
            © {year} {SITE_NAME}. Gifts link to independent retailers and makers; we don&apos;t sell products directly.
          </p>
        </div>
      </div>
    </footer>
  );
}
