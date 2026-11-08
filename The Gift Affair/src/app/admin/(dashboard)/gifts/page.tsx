import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import GiftRowActions from "@/components/admin/GiftRowActions";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { requireEditor } from "@/lib/auth";
import { listAdminGifts } from "@/lib/queries/admin";
import { formatDate, imageUrl } from "@/lib/utils";
import type { ContentStatus } from "@/types";

export const metadata = { title: "Gifts" };

type Props = { searchParams: Promise<{ status?: string; q?: string }> };
const STATUSES: { value: ContentStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "archived", label: "Archived" },
];

export default async function AdminGiftsPage({ searchParams }: Props) {
  const editor = await requireEditor();
  const sp = await searchParams;
  const status = (["published", "draft", "archived"].includes(sp.status ?? "") ? sp.status : "") as ContentStatus | "";
  const q = (sp.q ?? "").slice(0, 100);
  const gifts = await listAdminGifts(editor.supabase, { status, q });

  return (
    <>
      <PageHeader
        title="Gifts"
        actions={
          <Link href="/admin/gifts/new" className={buttonVariants()}>
            <Plus aria-hidden="true" /> Add a gift
          </Link>
        }
      />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <nav aria-label="Filter by status">
          <ul className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <li key={s.value}>
                <Link
                  href={`/admin/gifts${s.value ? `?status=${s.value}` : ""}`}
                  aria-current={status === s.value ? "page" : undefined}
                  className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold ${
                    status === s.value ? "bg-plum text-cream" : "bg-surface ring-1 ring-plum-line hover:ring-plum"
                  }`}
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <form method="get" className="flex gap-2" role="search">
          {status && <input type="hidden" name="status" value={status} />}
          <label htmlFor="admin-q" className="sr-only">
            Search by title
          </label>
          <input id="admin-q" name="q" type="search" defaultValue={q} placeholder="Search by title" className="field min-h-10 w-56" />
          <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Search
          </button>
        </form>
      </div>

      {gifts.length === 0 ? (
        <p className="mt-8 rounded-[var(--radius-card)] bg-surface p-8 text-center text-plum-soft ring-1 ring-plum-line">
          {q || status ? "No gifts match. Try a different search or status." : "No gifts yet. Add the first one."}
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-plum-line rounded-[var(--radius-card)] bg-surface ring-1 ring-plum-line">
          {gifts.map((g) => {
            const src = imageUrl(g.main_image_path);
            return (
              <li key={g.id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-lavender-soft">
                  {src && <Image src={src} alt="" fill sizes="3.5rem" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/gifts/${g.id}/edit`} className="font-semibold hover:underline">
                    {g.title}
                  </Link>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-plum-soft">
                    <StatusBadge status={g.status} />
                    {g.is_featured && <span className="font-medium text-plum">Featured</span>}
                    <span>Updated {formatDate(g.updated_at)}</span>
                  </p>
                </div>
                <GiftRowActions id={g.id} title={g.title} status={g.status} />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
