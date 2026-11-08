import { notFound } from "next/navigation";
import GuideForm from "@/components/admin/GuideForm";
import PageHeader from "@/components/admin/PageHeader";
import { requireEditor } from "@/lib/auth";
import { getAdminGuide, listGiftOptions } from "@/lib/queries/admin";

export const metadata = { title: "Edit guide" };

export default async function EditGuidePage({ params }: { params: Promise<{ id: string }> }) {
  const editor = await requireEditor();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [guide, options] = await Promise.all([getAdminGuide(editor.supabase, id), listGiftOptions(editor.supabase)]);
  if (!guide) notFound();
  return (
    <>
      <PageHeader title={guide.title} back={{ href: "/admin/guides", label: "All guides" }} />
      <GuideForm key={guide.updatedAt} guide={guide} giftOptions={options} />
    </>
  );
}
