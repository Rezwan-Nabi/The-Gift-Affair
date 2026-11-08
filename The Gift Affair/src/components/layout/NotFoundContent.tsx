import Link from "next/link";
import SearchForm from "./SearchForm";

export default function NotFoundContent() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-start justify-center py-20">
      <div className="garland w-[210px]" aria-hidden="true" />
      <h1 className="mt-8 text-[clamp(2.4rem,5vw,4rem)]">We couldn&apos;t find that page</h1>
      <p className="mt-4 max-w-xl text-lg text-plum-soft">
        This gift may have been moved or taken down, or the link may be mistyped. Try searching instead.
      </p>
      <div className="mt-8 w-full max-w-xl">
        <SearchForm id="notfound-search" size="lg" />
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/gift-ideas" className="inline-flex min-h-11 items-center rounded-full bg-plum px-5 font-semibold text-cream">
          Browse all gifts
        </Link>
        <Link href="/" className="inline-flex min-h-11 items-center rounded-full px-4 font-semibold underline underline-offset-4">
          Go to the homepage
        </Link>
      </div>
    </div>
  );
}
