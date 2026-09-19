import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function ShopPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero"><div className="container narrow"><p className="eyebrow">MOTEVRA SHOP</p><h1>Automotive products, one place.</h1><p className="hero-copy">The catalog foundation is ready for real product, category, brand and inventory data in the next phase.</p></div></section>
        <section className="section"><div className="container"><div className="empty-state"><span>CATALOG</span><h2>Product catalog is being connected.</h2><p>Phase A focuses on the production-ready storefront foundation. Demo product data and commerce APIs remain isolated until the database phase.</p></div></div></section>
      </main>
      <SiteFooter />
    </>
  );
}
