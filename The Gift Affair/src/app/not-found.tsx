import NotFoundContent from "@/components/layout/NotFoundContent";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { getTaxonomy } from "@/lib/queries/public";

export const metadata = { title: "Page not found" };

/** For URLs that match no route at all (pages inside (public) use their own not-found). */
export default async function NotFound() {
  const taxonomy = await getTaxonomy();
  return (
    <>
      <SiteHeader taxonomy={taxonomy} />
      <main id="main">
        <NotFoundContent />
      </main>
      <SiteFooter taxonomy={taxonomy} />
    </>
  );
}
