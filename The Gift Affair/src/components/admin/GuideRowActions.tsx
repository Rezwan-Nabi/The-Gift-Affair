"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteGuide } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "./ConfirmDialog";

export default function GuideRowActions({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  return (
    <ConfirmDialog
      trigger={
        <Button variant="ghost" size="sm" className="text-danger">
          <Trash2 aria-hidden="true" /> Delete<span className="sr-only"> {title}</span>
        </Button>
      }
      title={`Delete “${title}”?`}
      description="The guide is removed from the website. The gifts in it are not affected."
      confirmLabel="Delete guide"
      onConfirm={() => deleteGuide(id)}
      onDone={() => router.refresh()}
    />
  );
}
