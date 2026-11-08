import Link from "next/link";

export default function PageHeader({
  title,
  description,
  back,
  actions,
}: {
  title: string;
  description?: string;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      {back && (
        <Link href={back.href} className="text-sm font-semibold text-plum-soft underline-offset-4 hover:underline">
          {back.label}
        </Link>
      )}
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">{title}</h1>
          {description && <p className="mt-2 text-plum-soft">{description}</p>}
        </div>
        {actions}
      </div>
    </div>
  );
}
