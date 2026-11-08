"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import GiftImage from "./GiftImage";

type Img = { path: string | null; alt: string | null };

export default function Gallery({ images }: { images: Img[] }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-lavender-soft">
        <GiftImage path={current?.path ?? null} alt={current?.alt ?? null} priority sizes="(min-width: 1024px) 40rem, 100vw" />
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex gap-3" aria-label="More images">
          {images.map((img, i) => (
            <li key={`${img.path}-${i}`}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                aria-label={`Show image ${i + 1} of ${images.length}${img.alt ? `: ${img.alt}` : ""}`}
                className={cn(
                  "relative block size-20 overflow-hidden rounded-xl ring-offset-2 ring-offset-cream",
                  i === active ? "ring-2 ring-plum" : "opacity-80 hover:opacity-100",
                )}
              >
                <GiftImage path={img.path} alt="" sizes="5rem" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
