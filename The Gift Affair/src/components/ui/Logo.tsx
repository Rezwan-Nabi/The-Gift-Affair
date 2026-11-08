import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Wordmark with a small bow made of two accent loops. */
export default function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 font-display text-[1.45rem] leading-none font-semibold", className)}>
      <svg viewBox="0 0 32 24" className="h-6 w-8" aria-hidden="true">
        <ellipse cx="9" cy="12" rx="8" ry="6.5" transform="rotate(-20 9 12)" fill="var(--color-coral)" />
        <ellipse cx="23" cy="12" rx="8" ry="6.5" transform="rotate(20 23 12)" fill="var(--color-lavender)" />
        <circle cx="16" cy="12.5" r="3.6" fill="var(--color-sunshine)" stroke="var(--color-plum)" strokeWidth="1.4" />
      </svg>
      <span>{SITE_NAME}</span>
    </Link>
  );
}
