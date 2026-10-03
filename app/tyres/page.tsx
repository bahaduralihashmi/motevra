import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TyreFinder } from "@/components/tyre-finder";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tyres in Pakistan | Tyre Prices, Sizes & Brands",
  description: "Find car tyres in Pakistan by tyre size or vehicle. Compare tyre sizes, prices, brands, stock and active MOTEVRA products.",
  alternates: { canonical: "/tyres" },
};

function sizeToSlug(label: string) {
  return label.toLowerCase().replace(/\s+/g, "").replace(/\//g, "-").replace(/r(?=\d)/, "-r");
}

export default async function TyresPage() {
  let sizes: string[] = [];
  try {
    if (process.env.DATABASE_URL) {
      const rows = await getPrisma().tyreSize.findMany({
        where: { tyres: { some: { product: { status: "ACTIVE" } } } },
        select: { label: true },
        orderBy: [{ rimSize: "asc" }, { width: "asc" }, { aspectRatio: "asc" }],
        take: 24,
      });
      sizes = rows.map((row) => row.label);
    }
  } catch {
    sizes = [];
  }

  return (
    <>
      <SiteHeader />
      <main>
        <section className="category-hero">
          <div className="container">
            <div className="category-hero-media">
              <img src="https://images.unsplash.com/photo-1578844251758-2f71da64c6e6?auto=format&fit=crop&w=1800&q=85" alt="Car tyre tread and performance tyre" fetchPriority="high" />
              <div className="category-hero-scrim" />
              <div className="category-hero-content">
                <p className="eyebrow">TYRES IN PAKISTAN</p>
                <h1>Find the right tyre for your vehicle.</h1>
                <p className="hero-copy">Search by vehicle or exact tyre size to discover compatible options, compare prices and check tyre information before you buy.</p>
                <div className="hero-actions">
                  <a className="button button-light" href="#tyre-finder">Find my tyres</a>
                  <Link className="button button-outline-light" href="/shop">Shop all tyres</Link>
                </div>
              </div>
              <span className="category-hero-label">TYRES</span>
            </div>
          </div>
        </section>

        <section className="section" id="tyre-finder">
          <div className="container narrow">
            <div className="section-heading"><div><p className="eyebrow">FITMENT FIRST</p><h2>Start with your vehicle or tyre size.</h2></div></div>
            <TyreFinder />
          </div>
        </section>

        <section className="section section-soft">
          <div className="container narrow">
            <div className="section-heading"><div><p className="eyebrow">POPULAR SIZES</p><h2>Shop tyres by exact size.</h2></div><Link href="/shop">View all products →</Link></div>
            {sizes.length ? <div className="chip-grid">{sizes.map((size) => <Link key={size} className="filter-chip" href={"/shop?size=" + sizeToSlug(size)}>{size} tyres</Link>)}</div> : <p className="muted">Exact-size links will appear here as active tyre products are added to the MOTEVRA catalogue.</p>}
            <div className="content-note" style={{ marginTop: 32 }}><p>Always confirm tyre size, load index and speed rating against your vehicle placard or current tyre sidewall before ordering.</p></div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
