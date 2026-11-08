"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <div className="container-page flex min-h-[50vh] flex-col items-start justify-center py-20">
      <h1 className="text-4xl">This page didn&apos;t load</h1>
      <p className="mt-4 max-w-xl text-lg text-plum-soft">
        Something went wrong while loading the gifts. Try again, and if it keeps happening, come back in a few
        minutes.
      </p>
      <Button className="mt-8" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
