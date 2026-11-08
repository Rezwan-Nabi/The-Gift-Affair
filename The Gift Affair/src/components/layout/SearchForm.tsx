import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchFormProps = {
  defaultValue?: string;
  size?: "md" | "lg";
  className?: string;
  /** Visible label text; hidden visually for the compact header search. */
  label?: string;
  hideLabel?: boolean;
  id?: string;
  placeholder?: string;
};

/** A plain GET form to the gift catalogue, so search works without JavaScript. */
export default function SearchForm({
  defaultValue = "",
  size = "md",
  className,
  label = "Search gifts",
  hideLabel = true,
  id = "site-search",
  placeholder = "Search gifts",
}: SearchFormProps) {
  return (
    <form action="/gift-ideas" method="get" role="search" className={cn("w-full", className)}>
      <label htmlFor={id} className={hideLabel ? "sr-only" : "mb-2 block font-semibold"}>
        {label}
      </label>
      <div className="relative flex items-center">
        <Search
          aria-hidden="true"
          className={cn("pointer-events-none absolute left-4 text-plum-soft", size === "lg" ? "size-5" : "size-4")}
        />
        <input
          id={id}
          name="q"
          type="search"
          defaultValue={defaultValue}
          maxLength={100}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(
            "w-full rounded-full border-[1.5px] border-plum/25 bg-surface text-plum placeholder:text-plum-soft/80 hover:border-plum/50 focus:border-plum focus:shadow-[0_0_0_3px_var(--color-lavender-soft)] focus:outline-none",
            size === "lg" ? "min-h-14 pr-32 pl-12 text-[1.05rem]" : "min-h-11 pr-24 pl-10 text-[0.95rem]",
          )}
        />
        <button
          type="submit"
          className={cn(
            "absolute right-1.5 rounded-full bg-plum font-semibold text-cream hover:bg-plum/90",
            size === "lg" ? "min-h-11 px-6" : "min-h-8 px-4 text-sm",
          )}
        >
          Search
        </button>
      </div>
    </form>
  );
}
