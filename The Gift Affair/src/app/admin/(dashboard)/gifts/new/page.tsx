import GiftForm from "@/components/admin/GiftForm";
import PageHeader from "@/components/admin/PageHeader";
import { requireEditor } from "@/lib/auth";
import { getAdminTaxonomy } from "@/lib/queries/admin";

export const metadata = { title: "New gift" };

export default async function NewGiftPage() {
  const editor = await requireEditor();
  const { categories, tags } = await getAdminTaxonomy(editor.supabase);
  return (
    <>
      <PageHeader title="New gift" description="New gifts start as drafts until you publish them." back={{ href: "/admin/gifts", label: "All gifts" }} />
      <GiftForm gift={null} categories={categories} tags={tags} />
    </>
  );
}
