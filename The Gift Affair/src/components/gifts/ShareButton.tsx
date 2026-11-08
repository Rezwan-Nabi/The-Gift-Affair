"use client";

import { Check, Link2, Share2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/** Uses the system share sheet where available (mostly mobile), otherwise copies the link. */
export default function ShareButton({ title, path }: { title: string; path: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const [canShare, setCanShare] = useState(false);

  useEffect(() => setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function"), []);
  useEffect(() => {
    if (state === "idle") return;
    const t = setTimeout(() => setState("idle"), 2500);
    return () => clearTimeout(t);
  }, [state]);

  const url = () => new URL(path, window.location.origin).toString();

  async function onClick() {
    if (canShare) {
      try {
        await navigator.share({ title, url: url() });
        return;
      } catch (e) {
        if ((e as DOMException).name === "AbortError") return; // user closed the sheet
      }
    }
    try {
      await navigator.clipboard.writeText(url());
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" onClick={onClick}>
        {canShare ? <Share2 aria-hidden="true" /> : <Link2 aria-hidden="true" />}
        {canShare ? "Share this gift" : "Copy link"}
      </Button>
      <span role="status" aria-live="polite" className="text-sm font-medium">
        <AnimatePresence>
          {state !== "idle" && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="inline-flex items-center gap-1"
            >
              {state === "copied" ? (
                <>
                  <Check className="size-4 text-success" aria-hidden="true" /> Link copied
                </>
              ) : (
                "Couldn't copy. Copy the address from your browser instead."
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </div>
  );
}
