import PageHeader from "@/components/admin/PageHeader";
import TaxonomyManager from "@/components/admin/TaxonomyManager";
import { requireEditor } from "@/lib/auth";
import { getAdminTaxonomy, getUsageCounts } from "@/lib/queries/admin";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const editor = await requireEditor();
  const [{ categories }, usage] = await Promise.all([getAdminTaxonomy(editor.supabase), getUsageCounts(editor.supabase)]);
  return (
    <>
      <PageHeader title="Categories" description="The main ways visitors browse, shown as cards on the homepage." />
      <TaxonomyManager
        title="All categories"
        target={{ kind: "category" }}
        items={categories.map((c) => ({ ...c, usage: usage.categories[c.id] ?? 0 }))}
      />
    </>
  );
}
