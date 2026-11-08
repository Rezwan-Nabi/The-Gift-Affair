"use client";

import { cn } from "@/lib/utils";

/* Small, consistent form building blocks for the admin. Errors are linked with aria-describedby. */

export function Field({
  id,
  label,
  hint,
  error,
  optional,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block font-semibold">
        {label} {optional && <span className="font-normal text-plum-soft">(optional)</span>}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-plum-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function describedBy(id: string, hint?: string, error?: string) {
  return [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
}

export function CheckboxGroup({
  legend,
  options,
  value,
  onChange,
  error,
  hint,
}: {
  legend: string;
  options: { id: string; name: string; inactive?: boolean }[];
  value: string[];
  onChange: (next: string[]) => void;
  error?: string;
  hint?: string;
}) {
  return (
    <fieldset>
      <legend className="mb-2 font-semibold">{legend}</legend>
      {hint && <p className="-mt-1 mb-2 text-sm text-plum-soft">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const checked = value.includes(o.id);
          return (
            <label
              key={o.id}
              className={cn(
                "inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border-[1.5px] px-3.5 text-sm font-medium has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-plum",
                checked ? "border-plum bg-plum text-cream" : "border-plum/25 bg-surface hover:border-plum/60",
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={(e) => onChange(e.target.checked ? [...value, o.id] : value.filter((v) => v !== o.id))}
              />
              <span aria-hidden="true">{checked ? "✓" : "+"}</span>
              {o.name}
              {o.inactive && <span className="text-xs opacity-75">(hidden)</span>}
            </label>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-sm font-medium text-danger">{error}</p>}
    </fieldset>
  );
}

export function FormSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[var(--radius-card)] bg-surface p-6 ring-1 ring-plum-line md:p-8">
      <h2 className="font-display text-2xl">{title}</h2>
      {description && <p className="mt-1 text-plum-soft">{description}</p>}
      <div className="mt-6 space-y-6">{children}</div>
    </section>
  );
}
