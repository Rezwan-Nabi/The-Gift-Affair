import { Plus } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { requireEditor } from "@/lib/auth";
import { getDashboardStats } from "@/lib/queries/admin";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const editor = await requireEditor();
  const stats = await getDashboardStats(editor.supabase);
  const tiles = [
    { label: "Gifts", value: stats.total, href: "/admin/gifts", tone: "bg-lavender-soft" },
    { label: "Published", value: stats.published, href: "/admin/gifts?status=published", tone: "bg-sage-soft" },
    { label: "Drafts", value: stats.drafts, href: "/admin/gifts?status=draft", tone: "bg-sunshine-soft" },
    { label: "Categories", value: stats.categories, href: "/admin/categories", tone: "bg-coral-soft" },
  ];

  return (
    <>
      <PageHeader
        title={`Hello, ${editor.displayName.split(" ")[0]}`}
        description="Here's what's on the site right now."
        actions={
          <Link href="/admin/gifts/new" className={buttonVariants()}>
            <Plus aria-hidden="true" /> Add a gift
          </Link>
        }
      />
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <li key={t.label}>
            <Link href={t.href} className={`block rounded-[var(--radius-card)] p-5 hover:ring-2 hover:ring-plum ${t.tone}`}>
              <span className="block font-display text-4xl">{t.value}</span>
              <span className="mt-1 block font-medium">{t.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-10 rounded-[var(--radius-card)] bg-surface p-6 ring-1 ring-plum-line">
        <h2 className="font-display text-2xl">Recently updated</h2>
        {stats.recent.length === 0 ? (
          <p className="mt-3 text-plum-soft">No gifts yet. Add the first one to get started.</p>
        ) : (
          <ul className="mt-3 divide-y divide-plum-line">
            {stats.recent.map((g) => (
              <li key={g.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <Link href={`/admin/gifts/${g.id}/edit`} className="font-semibold hover:underline">
                  {g.title}
                </Link>
                <span className="flex items-center gap-3 text-sm text-plum-soft">
                  <StatusBadge status={g.status} />
                  {formatDate(g.updated_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
