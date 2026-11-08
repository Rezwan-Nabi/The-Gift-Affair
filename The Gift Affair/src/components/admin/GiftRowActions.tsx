"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteGift, setGiftStatus } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import type { ContentStatus } from "@/types";
import ConfirmDialog from "./ConfirmDialog";

export default function GiftRowActions({ id, title, status }: { id: string; title: string; status: ContentStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const change = (next: ContentStatus) =>
    startTransition(async () => {
      setError("");
      const res = await setGiftStatus(id, next);
      if (!res.ok) setError(res.message);
      else router.refresh();
    });

  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      {status === "published" ? (
        <Button variant="ghost" size="sm" disabled={pending} onClick={() => change("draft")}>
          Unpublish<span className="sr-only">: {title}</span>
        </Button>
      ) : (
        <Button variant="ghost" size="sm" disabled={pending} onClick={() => change("published")}>
          Publish<span className="sr-only">: {title}</span>
        </Button>
      )}
      {status !== "archived" && (
        <Button variant="ghost" size="sm" disabled={pending} onClick={() => change("archived")}>
          Archive<span className="sr-only">: {title}</span>
        </Button>
      )}
      <ConfirmDialog
        trigger={
          <Button variant="ghost" size="sm" className="text-danger" aria-label={`Delete ${title}`}>
            <Trash2 aria-hidden="true" />
          </Button>
        }
        title={`Delete “${title}”?`}
        description="This permanently removes the gift and takes it off the website. Archive it instead if you might want it back."
        confirmLabel="Delete gift"
        onConfirm={() => deleteGift(id)}
        onDone={() => router.refresh()}
      />
      {error && (
        <p role="alert" className="basis-full text-right text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
