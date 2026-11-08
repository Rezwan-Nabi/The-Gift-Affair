import type { Metadata } from "next";
import PageIntro from "@/components/layout/PageIntro";
import Prose from "@/components/layout/Prose";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = { title: "Privacy policy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <>
      <PageIntro title="Privacy policy" crumbs={[{ label: "Home", href: "/" }, { label: "Privacy" }]} tone="bg-lavender-soft" />
      {/* TODO: TEMPLATE ONLY. Have this reviewed for your market before launch, and update it when analytics are added. */}
      <Prose>
        <p>
          This policy explains what information {SITE_NAME} collects and how it&apos;s used. Visitors can browse the site
          without creating an account.
        </p>
        <h2>What we collect</h2>
        <ul>
          <li>Standard server logs (such as IP address, browser type and pages visited), kept for security and reliability.</li>
          <li>If analytics are enabled, aggregated usage information about pages viewed and links clicked.</li>
          <li>If you email us, your email address and message, used only to reply.</li>
        </ul>
        <h2>Links to other sites</h2>
        <p>
          Gifts link to independent shops and makers. Their privacy practices are their own; please read their
          policies before buying.
        </p>
        <h2>Contact</h2>
        <p>
          Questions about privacy: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </Prose>
    </>
  );
}
