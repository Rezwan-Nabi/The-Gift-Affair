"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/* Thin, styled wrappers around Radix Dialog (focus trap, Escape, aria wiring come from Radix). */

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

type ContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
  /** "center" for confirmations, "left"/"right" for drawers. */
  side?: "center" | "left" | "right";
  closeLabel?: string;
};

export function DialogContent({ className, children, side = "center", closeLabel = "Close", ...props }: ContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-plum/40 data-[state=open]:animate-[fade-in_160ms_ease-out]" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 bg-cream text-plum shadow-[0_20px_60px_rgb(56_42_58/0.25)] focus:outline-none",
          side === "center" &&
            "top-1/2 left-1/2 w-[min(92vw,30rem)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-card)] p-6 data-[state=open]:animate-[pop-in_180ms_ease-out]",
          side === "left" &&
            "inset-y-0 left-0 w-[min(88vw,24rem)] overflow-y-auto p-6 data-[state=open]:animate-[slide-in-left_220ms_ease-out]",
          side === "right" &&
            "inset-y-0 right-0 w-[min(92vw,26rem)] overflow-y-auto p-6 data-[state=open]:animate-[slide-in-right_220ms_ease-out]",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute top-4 right-4 inline-flex size-10 items-center justify-center rounded-full hover:bg-plum/8"
          aria-label={closeLabel}
        >
          <X className="size-5" aria-hidden="true" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
