import type { Metadata } from "next";
import PageIntro from "@/components/layout/PageIntro";
import Prose from "@/components/layout/Prose";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = { title: "Terms of use", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <>
      <PageIntro title="Terms of use" crumbs={[{ label: "Home", href: "/" }, { label: "Terms" }]} tone="bg-coral-soft" />
      {/* TODO: TEMPLATE ONLY. Have this reviewed before launch, especially if affiliate links are introduced. */}
      <Prose>
        <p>{SITE_NAME} is an inspiration website. By using it you agree to these terms.</p>
        <h2>Our content</h2>
        <p>
          Gifts are suggestions. We work to keep them accurate, but products, prices and availability are set by
          the shops and makers we link to and can change at any time.
        </p>
        <h2>Purchases</h2>
        <p>
          We don&apos;t sell products. Any purchase you make is between you and the seller, under the seller&apos;s terms.
        </p>
        <h2>Images</h2>
        <p>Images are used with permission of their owners or under licence. Please don&apos;t reuse them without asking.</p>
        <h2>Changes</h2>
        <p>We may update these terms. The current version is always on this page.</p>
      </Prose>
    </>
  );
}
