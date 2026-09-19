import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getPrisma().product.findUnique({ where: { slug }, include: { brand: true, category: true, images: { orderBy: { position: "asc" } }, tyre: { include: { size: true } } } });
  if (!product || product.status !== "ACTIVE") notFound();
  const price = Number(product.salePrice ?? product.price).toLocaleString();
  return <><SiteHeader /><main><section className="page-hero"><div className="container narrow"><p className="eyebrow">{product.brand?.name ?? "MOTEVRA"}</p><h1>{product.name}</h1><p className="hero-copy">{product.description}</p></div></section><section className="section"><div className="container"><div className="product-detail"><div className="product-image-placeholder">{product.tyre?.size.label ?? product.productType}</div><div><p className="price">{product.currency} {price}</p>{product.tyre && <p>Size: <strong>{product.tyre.size.label}</strong> · Load {product.tyre.loadIndex ?? "—"} · Speed {product.tyre.speedRating ?? "—"}</p>}<p>Stock: {product.stock > 0 ? `${product.stock} available` : "Out of stock"}</p><button className="button button-dark" disabled={product.stock < 1}>Add to cart</button></div></div></div></section></main><SiteFooter /></>;
}
