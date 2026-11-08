import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { getTaxonomy } from "@/lib/queries/public";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const taxonomy = await getTaxonomy();
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-plum focus:px-5 focus:py-3 focus:font-semibold focus:text-cream"
      >
        Skip to content
      </a>
      <SiteHeader taxonomy={taxonomy} />
      <main id="main">{children}</main>
      <SiteFooter taxonomy={taxonomy} />
    </>
  );
}
