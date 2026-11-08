import type { Metadata } from "next";
import PageIntro from "@/components/layout/PageIntro";
import Prose from "@/components/layout/Prose";
import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description: "Suggest a maker, report an out-of-date link or ask a question.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageIntro
        title="Contact"
        description="Suggest a maker, report a broken link or ask us anything."
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        tone="bg-sunshine-soft"
      />
      <Prose>
        <p>
          Email us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We read every message and usually reply
          within a few working days.
        </p>
        <p>If you&apos;re writing about a specific gift, include the link to its page so we can find it quickly.</p>
        {SOCIAL_LINKS.length > 0 && (
          <>
            <h2>Follow along</h2>
            <ul>
              {SOCIAL_LINKS.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </Prose>
    </>
  );
}
