import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPrisma } from "@/lib/prisma";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { CurrencyPrice } from "@/components/currency-price";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const fallback = "https://images.unsplash.com/photo-1578844251758-2f71da64c6e6?auto=format&fit=crop&w=1400&q=85";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!process.env.DATABASE_URL) {
    return <><SiteHeader /><main><section className="section"><div className="container narrow"><div className="empty-state"><span>PRODUCT</span><h2>Product catalogue is not connected.</h2><p>Configure the production database to load product details.</p><Link className="button button-dark" href="/shop">Back to shop</Link></div></div></section></main><SiteFooter /></>;
  }
  const { slug } = await params;
  try {
    const product = await getPrisma().product.findUnique({ where: { slug }, include: { brand: true, category: true, images: { orderBy: { position: "asc" } }, tyre: { include: { size: true } } } });
    if (!product || product.status !== "ACTIVE") notFound();
    const image = product.images[0]?.url || fallback;
    const price = Number(product.salePrice ?? product.price);
    return <><SiteHeader /><main><section className="section"><div className="container product-detail"><div className="product-gallery"><div className="product-main-image" style={{ backgroundImage: `url("${image}")` }} />{product.images.length > 1 && <div className="product-thumbs">{product.images.slice(0, 4).map(img => <div key={img.id} className="product-thumb" style={{ backgroundImage: `url("${img.url}")` }} />)}</div>}</div><div className="product-copy"><span className="product-brand">{product.brand?.name || "MOTEVRA"}</span><h1>{product.name}</h1><p className="price"><CurrencyPrice amount={price} from={product.currency} /></p>{product.tyre && <p className="muted">Size <strong>{product.tyre.size.label}</strong> · Load {product.tyre.loadIndex ?? "—"} · Speed {product.tyre.speedRating ?? "—"}</p>}<p className="muted">{product.stock > 0 ? product.stock + " units available" : "Currently out of stock"}</p><AddToCartButton productId={product.id} stock={product.stock} /><div className="spec-grid"><div className="spec"><span>Brand</span>{product.brand?.name || "MOTEVRA"}</div><div className="spec"><span>Category</span>{product.category?.name || "Automotive"}</div><div className="spec"><span>SKU</span>{product.sku}</div><div className="spec"><span>Shipping</span>International-ready</div></div><p style={{ marginTop: 24 }}><Link className="text-link" href="/shipping">View shipping information →</Link></p></div></div></section></main><SiteFooter /></>;
  } catch {
    return <><SiteHeader /><main><section className="section"><div className="container narrow"><div className="empty-state"><span>PRODUCT</span><h2>Product is temporarily unavailable.</h2><p>The catalogue service could not be reached. Please try again later.</p><Link className="button button-dark" href="/shop">Back to shop</Link></div></div></section></main><SiteFooter /></>;
  }
}