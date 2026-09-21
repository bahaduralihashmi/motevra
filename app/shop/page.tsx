import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPrisma } from "@/lib/prisma";
import { CurrencyPrice } from "@/components/currency-price";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata = { title: "Shop", description: "Shop tyres, wheels, auto parts and accessories from MOTEVRA." };

const fallbackImages: Record<string, string> = {
  TYRE: "https://images.unsplash.com/photo-1578844251758-2f71da64c6e6?auto=format&fit=crop&w=1000&q=85",
  WHEEL: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1000&q=85",
  ACCESSORY: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1000&q=85",
  AUTO_PART: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=85",
  BATTERY: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1000&q=85",
  CAR_CARE: "https://images.unsplash.com/photo-1603712725038-e9334ae8f39f?auto=format&fit=crop&w=1000&q=85",
  OTHER: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=85",
};

export default async function ShopPage() {
  let products: any[] = [];
  let databaseError = false;

  try {
    if (!process.env.DATABASE_URL) databaseError = true;
    else {
      products = await getPrisma().product.findMany({
        where: { status: "ACTIVE" },
        include: { brand: true, category: true, images: { orderBy: { position: "asc" } }, tyre: { include: { size: true } } },
        orderBy: { createdAt: "desc" },
        take: 24,
      });
    }
  } catch {
    databaseError = true;
  }

  return <><SiteHeader /><main>
    <section className="page-hero"><div className="container narrow">
      <p className="eyebrow">MOTEVRA SHOP</p><h1>Automotive products, beautifully presented.</h1>
      <p className="hero-copy">Explore tyres, wheels, parts and accessories from one international-ready automotive catalogue.</p>
    </div></section>
    <section className="section"><div className="container">
      {databaseError ? (
        <div className="empty-state"><span>CATALOGUE</span><h2>Catalogue is being connected.</h2><p>The storefront is online, but the product database is not available right now. Configure the production database to load live products.</p></div>
      ) : (
        <div className="product-grid">{products.map(product => {
          const image = product.images[0]?.url || fallbackImages[product.productType] || fallbackImages.OTHER;
          return <Link className="product-card" href={"/product/" + product.slug} key={product.id}>
            <div className="product-visual" style={{ backgroundImage: "url(\"" + image + "\")" }}><span className="product-badge">{product.productType.replace("_", " ")}</span></div>
            <div className="product-info"><span className="product-brand">{product.brand?.name || "MOTEVRA"}</span><h3>{product.name}</h3>
              <p className="product-meta">{product.tyre?.size.label || product.category?.name || "Automotive product"} · {product.stock > 0 ? "In stock" : "Out of stock"}</p>
              <div className="product-price"><CurrencyPrice amount={Number(product.salePrice ?? product.price)} from={product.currency} /></div>
              <div className="product-actions"><span className="mini-button">View details</span><span className="mini-button primary">Buy now</span></div>
            </div>
          </Link>;
        })}</div>
      )}
      {!databaseError && !products.length && <div className="empty-state"><span>CATALOG</span><h2>No products yet.</h2><p>Run the database migration and seed command to load development catalogue data.</p></div>}
    </div></section>
  </main><SiteFooter /></>;
}