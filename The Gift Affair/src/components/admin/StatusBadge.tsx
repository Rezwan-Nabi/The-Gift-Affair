import { cn } from "@/lib/utils";
import type { ContentStatus } from "@/types";

const STYLES: Record<ContentStatus, string> = {
  published: "bg-sage-soft text-success",
  draft: "bg-sunshine-soft text-plum",
  archived: "bg-plum/8 text-plum-soft",
};
const LABELS: Record<ContentStatus, string> = { published: "Published", draft: "Draft", archived: "Archived" };

/** Status is always written out, never shown by colour alone. */
export default function StatusBadge({ status, className }: { status: ContentStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", STYLES[status], className)}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {LABELS[status]}
    </span>
  );
}
