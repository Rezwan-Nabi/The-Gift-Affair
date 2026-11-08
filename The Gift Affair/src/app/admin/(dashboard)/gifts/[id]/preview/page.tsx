import Link from "next/link";
import { notFound } from "next/navigation";
import GiftDetail from "@/components/gifts/GiftDetail";
import StatusBadge from "@/components/admin/StatusBadge";
import { requireEditor } from "@/lib/auth";
import { getAdminGift } from "@/lib/queries/admin";

export const metadata = { title: "Preview" };

/** Shows a draft exactly as visitors will see it (PRD FR-045). */
export default async function PreviewGiftPage({ params }: { params: Promise<{ id: string }> }) {
  const editor = await requireEditor();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const gift = await getAdminGift(editor.supabase, id);
  if (!gift) notFound();

  return (
    <div className="-mx-4 -my-8 md:-mx-8 md:-my-10">
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 bg-plum px-5 py-3 text-cream">
        <p className="flex items-center gap-3 text-sm">
          <span className="font-semibold">Preview</span>
          <StatusBadge status={gift.status} />
          {gift.status !== "published" && <span>Visitors can&apos;t see this yet.</span>}
        </p>
        <Link href={`/admin/gifts/${gift.id}/edit`} className="text-sm font-semibold underline underline-offset-4">
          Back to editing
        </Link>
      </div>
      <div className="bg-cream pb-16">
        <GiftDetail gift={gift} related={[]} />
      </div>
    </div>
  );
}
