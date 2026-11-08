"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Props = {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<{ ok: boolean; message?: string }>;
  onDone?: () => void;
};

/** Confirmation for destructive actions (PRD FR-038). The confirm button names the action. */
export default function ConfirmDialog({ trigger, title, description, confirmLabel, onConfirm, onDone }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setError("");
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent role="alertdialog" closeLabel="Cancel">
        <DialogTitle className="pr-10 font-display text-2xl">{title}</DialogTitle>
        <DialogDescription className="mt-2 text-plum-soft">{description}</DialogDescription>
        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-danger/8 px-3 py-2 text-sm font-medium text-danger">
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const res = await onConfirm();
                if (res.ok) {
                  setOpen(false);
                  onDone?.();
                } else setError(res.message ?? "That didn't work. Try again.");
              })
            }
          >
            {pending ? "Working…" : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
