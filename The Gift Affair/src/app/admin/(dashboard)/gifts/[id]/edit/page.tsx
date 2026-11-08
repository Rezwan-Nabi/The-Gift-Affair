import { notFound } from "next/navigation";
import GiftForm from "@/components/admin/GiftForm";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { requireEditor } from "@/lib/auth";
import { getAdminGift, getAdminTaxonomy } from "@/lib/queries/admin";

export const metadata = { title: "Edit gift" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export default async function EditGiftPage({ params, searchParams }: Props) {
  const editor = await requireEditor();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [gift, { categories, tags }, sp] = await Promise.all([
    getAdminGift(editor.supabase, id),
    getAdminTaxonomy(editor.supabase),
    searchParams,
  ]);
  if (!gift) notFound();

  return (
    <>
      <PageHeader
        title={gift.title}
        back={{ href: "/admin/gifts", label: "All gifts" }}
        actions={<StatusBadge status={gift.status} className="text-sm" />}
      />
      <GiftForm key={gift.updatedAt} gift={gift} categories={categories} tags={tags} initialNotice={sp.saved ? "Gift created." : undefined} />
    </>
  );
}
