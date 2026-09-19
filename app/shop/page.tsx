import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const metadata = { title: "Shop | MOTEVRA", description: "Shop the MOTEVRA automotive catalogue." };

export default async function ShopPage() {
  const products = await getPrisma().product.findMany({
    where: { status: "ACTIVE" },
    include: { brand: true, category: true, tyre: { include: { size: true } } },
    orderBy: { createdAt: "desc" },
    take: 24,
  });
  return <><SiteHeader /><main><section className="page-hero"><div className="container narrow"><p className="eyebrow">MOTEVRA SHOP</p><h1>Automotive products, one place.</h1><p className="hero-copy">Browse the live database catalogue. Product inventory and compatibility are connected through Prisma.</p></div></section><section className="section"><div className="container"><div className="product-grid">{products.map(product => <a className="product-card" href={`/product/${product.slug}`} key={product.id}><span className="product-type">{product.productType}</span><h3>{product.name}</h3><p>{product.tyre?.size.label ?? product.category?.name ?? "Automotive product"}</p><strong>{product.currency} {Number(product.salePrice ?? product.price).toLocaleString()}</strong></a>)}</div>{!products.length && <div className="empty-state"><span>CATALOG</span><h2>No products yet.</h2><p>Run the Phase C database migration and seed command to load development catalogue data.</p></div>}</div></section></main><SiteFooter /></>;
}