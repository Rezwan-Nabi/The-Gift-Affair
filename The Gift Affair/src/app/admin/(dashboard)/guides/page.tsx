import { Plus } from "lucide-react";
import Link from "next/link";
import GuideRowActions from "@/components/admin/GuideRowActions";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { requireEditor } from "@/lib/auth";
import { listAdminGuides } from "@/lib/queries/admin";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Gift guides" };

export default async function AdminGuidesPage() {
  const editor = await requireEditor();
  const guides = await listAdminGuides(editor.supabase);
  return (
    <>
      <PageHeader
        title="Gift guides"
        description="Curated collections of gifts with a short article."
        actions={
          <Link href="/admin/guides/new" className={buttonVariants()}>
            <Plus aria-hidden="true" /> New guide
          </Link>
        }
      />
      {guides.length === 0 ? (
        <p className="rounded-[var(--radius-card)] bg-surface p-8 text-center text-plum-soft ring-1 ring-plum-line">No guides yet.</p>
      ) : (
        <ul className="divide-y divide-plum-line rounded-[var(--radius-card)] bg-surface ring-1 ring-plum-line">
          {guides.map((g) => (
            <li key={g.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <Link href={`/admin/guides/${g.id}/edit`} className="font-semibold hover:underline">
                  {g.title}
                </Link>
                <p className="mt-0.5 flex items-center gap-2 text-sm text-plum-soft">
                  <StatusBadge status={g.status} /> Updated {formatDate(g.updated_at)}
                </p>
              </div>
              <GuideRowActions id={g.id} title={g.title} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
