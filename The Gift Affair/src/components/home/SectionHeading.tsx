import Link from "next/link";

export default function SectionHeading({
  id,
  title,
  description,
  link,
}: {
  id: string;
  title: string;
  description?: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div className="max-w-2xl">
        <h2 id={id} className="text-[clamp(2rem,4vw,3rem)]">
          {title}
        </h2>
        {description && <p className="mt-3 text-lg text-plum-soft">{description}</p>}
      </div>
      {link && (
        <Link
          href={link.href}
          className="shrink-0 self-start font-semibold underline decoration-coral decoration-2 underline-offset-[6px] hover:decoration-plum md:self-auto"
        >
          {link.label}
        </Link>
      )}
    </div>
  );
}
