import type { Metadata } from "next";
import GuideCard from "@/components/guides/GuideCard";
import PageIntro from "@/components/layout/PageIntro";
import { listGuides } from "@/lib/queries/public";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Gift guides",
  description: "Editorial wedding gift guides: curated collections for each ceremony, recipient and budget.",
  alternates: { canonical: "/gift-guides" },
};

export default async function GuidesPage() {
  const guides = await listGuides();
  return (
    <>
      <PageIntro
        title="Gift guides"
        description="Short, curated collections to help you decide, written for a specific moment or person."
        crumbs={[{ label: "Home", href: "/" }, { label: "Gift guides" }]}
        tone="bg-orange-soft"
      />
      <div className="container-page mt-12">
        {guides.length === 0 ? (
          <p className="text-lg text-plum-soft">New guides are on the way. Meanwhile, browse all gifts.</p>
        ) : (
          <ul className="grid gap-x-8 gap-y-14 md:grid-cols-2">
            {guides.map((g) => (
              <li key={g.id}>
                <GuideCard guide={g} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
