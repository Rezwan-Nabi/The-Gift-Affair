import { Gift as GiftIcon } from "lucide-react";
import Image from "next/image";
import { imageUrl, cn } from "@/lib/utils";

type Props = {
  path: string | null;
  alt: string | null;
  sizes: string;
  className?: string;
  priority?: boolean;
};

/** next/image with a graceful fallback when a gift has no image (PRD §17.3 "missing images"). */
export default function GiftImage({ path, alt, sizes, className, priority }: Props) {
  const src = imageUrl(path);
  if (!src) {
    return (
      <div className={cn("absolute inset-0 flex items-center justify-center bg-lavender-soft", className)}>
        <GiftIcon className="size-12 text-plum/40" aria-hidden="true" />
        <span className="sr-only">No image yet</span>
      </div>
    );
  }
  return <Image src={src} alt={alt ?? ""} fill sizes={sizes} priority={priority} className={cn("object-cover", className)} />;
}
