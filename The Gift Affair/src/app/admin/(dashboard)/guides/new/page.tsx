import GuideForm from "@/components/admin/GuideForm";
import PageHeader from "@/components/admin/PageHeader";
import { requireEditor } from "@/lib/auth";
import { listGiftOptions } from "@/lib/queries/admin";

export const metadata = { title: "New guide" };

export default async function NewGuidePage() {
  const editor = await requireEditor();
  const options = await listGiftOptions(editor.supabase);
  return (
    <>
      <PageHeader title="New gift guide" back={{ href: "/admin/guides", label: "All guides" }} />
      <GuideForm guide={null} giftOptions={options} />
    </>
  );
}
