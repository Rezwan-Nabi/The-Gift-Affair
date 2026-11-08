import PageHeader from "@/components/admin/PageHeader";
import TaxonomyManager from "@/components/admin/TaxonomyManager";
import { requireEditor } from "@/lib/auth";
import { getAdminTaxonomy, getUsageCounts } from "@/lib/queries/admin";
import type { TagType } from "@/types";

export const metadata = { title: "Occasions, recipients and budgets" };

const SECTIONS: { type: TagType; title: string }[] = [
  { type: "occasion", title: "Occasions" },
  { type: "recipient", title: "Recipients" },
  { type: "budget", title: "Budget ranges" },
];

export default async function TagsPage() {
  const editor = await requireEditor();
  const [{ tags }, usage] = await Promise.all([getAdminTaxonomy(editor.supabase), getUsageCounts(editor.supabase)]);
  return (
    <>
      <PageHeader title="Occasions, recipients and budgets" description="The filters visitors use to narrow down gifts." />
      <div className="space-y-6">
        {SECTIONS.map((s) => (
          <TaxonomyManager
            key={s.type}
            title={s.title}
            target={{ kind: "tag", tagType: s.type }}
            items={tags.filter((t) => t.tagType === s.type).map((t) => ({ ...t, usage: usage.tags[t.id] ?? 0 }))}
          />
        ))}
      </div>
    </>
  );
}
