import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/layout/PageIntro";
import Prose from "@/components/layout/Prose";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: `Why ${SITE_NAME} exists and how we choose the wedding gifts we feature.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageIntro
        title="About us"
        description="We help wedding guests find gifts that feel personal, for every ceremony and every budget."
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        tone="bg-sage-soft"
      />
      {/* TODO: replace with your own story. */}
      <Prose>
        <p>
          Choosing a wedding gift means thinking about the couple, the ceremony, your relationship and your budget all at
          once. The gifts are usually spread across shops, blogs and social feeds. {SITE_NAME} brings them together in
          one place.
        </p>
        <h2>How we choose gifts</h2>
        <ul>
          <li>Each gift is picked by our editors, not generated from a product feed.</li>
          <li>We favour gifts that are personal, useful and made with care, including work by independent makers.</li>
          <li>We link to the maker or shop where we found a gift. We don&apos;t sell products ourselves.</li>
          <li>We only show a price when we&apos;ve checked it, and we say when we checked it.</li>
        </ul>
        <h2>Get in touch</h2>
        <p>
          Know a maker we should feature, or spotted something out of date? <Link href="/contact">Contact us</Link>.
        </p>
      </Prose>
    </>
  );
}
