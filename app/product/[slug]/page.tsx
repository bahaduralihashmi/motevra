import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPrisma } from "@/lib/prisma";
import { ProductExperience } from "@/components/product-experience";
import { CurrencyPrice } from "@/components/currency-price";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const fallback = "https://images.unsplash.com/photo-1578844251758-2f71da64c6e6?auto=format&fit=crop&w=1400&q=85";

async function getProduct(slug: string) {
  return getPrisma().product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { sku: "asc" } },
      tyre: { include: { size: true } },
      fitments: { include: { vehicleVariant: { include: { model: { include: { make: true } } } } }, take: 20 },
      reviews: { where: { status: "APPROVED" }, orderBy: { createdAt: "desc" }, take: 8, include: { user: { select: { name: true } } } },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    if (!process.env.DATABASE_URL) return { title: "Automotive Product" };
    const product = await getProduct(slug);
    if (!product || product.status !== "ACTIVE") return { title: "Product not found" };
    const size = product.tyre?.size?.label;
    const brand = product.brand?.name;
    const title = [product.name, brand, size].filter(Boolean).join(" | ");
    const description = product.description?.slice(0, 155) || `Shop ${product.name}${size ? ` in ${size}` : ""}${brand ? ` from ${brand}` : ""} at MOTEVRA. Check price, stock and product details.`;
    return { title, description, alternates: { canonical: `/product/${product.slug}` }, openGraph: { title, description, url: `https://www.motevra.com/product/${product.slug}`, type: "website", images: [{ url: product.images[0]?.url || fallback }] } };
  } catch { return { title: "Automotive Product" }; }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!process.env.DATABASE_URL) return <><SiteHeader /><main><section className="section"><div className="container narrow"><div className="empty-state"><span>PRODUCT</span><h2>Product catalogue is not connected.</h2><p>Configure the production database to load product details.</p><Link className="button button-dark" href="/shop">Back to shop</Link></div></div></section></main><SiteFooter /></>;
  const { slug } = await params;
  try {
    const product = await getProduct(slug);
    if (!product || product.status !== "ACTIVE") notFound();
    const image = product.images[0]?.url || fallback;
    const price = Number(product.salePrice ?? product.price);
    const availability = product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
    const productUrl = `https://www.motevra.com/product/${product.slug}`;
    const approvedReviews = product.reviews;
    const averageRating = approvedReviews.length ? approvedReviews.reduce((sum, review) => sum + review.rating, 0) / approvedReviews.length : null;
    const structuredData:any = {
      "@context":"https://schema.org","@type":"Product",name:product.name,description:product.description||undefined,sku:product.sku,
      image:product.images.length ? product.images.map(img=>img.url) : [image],
      brand:{"@type":"Brand",name:product.brand?.name||"MOTEVRA"},category:product.category?.name||product.productType,url:productUrl,
      offers:{"@type":"Offer",url:productUrl,priceCurrency:product.currency,price:price.toFixed(2),availability}
    };
    if (averageRating) structuredData.aggregateRating={"@type":"AggregateRating",ratingValue:averageRating.toFixed(1),reviewCount:approvedReviews.length};
    return <><SiteHeader /><main>
      <Script id={`product-schema-${product.id}`} type="application/ld+json">{JSON.stringify(structuredData)}</Script>
      <section className="section product-section">
        <div className="container product-detail">
          <ProductExperience
            product={{
              id:product.id,name:product.name,sku:product.sku,price,currency:product.currency,stock:product.stock,
              brand:product.brand?.name||"MOTEVRA",category:product.category?.name||"Automotive",productType:product.productType,
              description:product.description||"",images:product.images.map(img=>({id:img.id,url:img.url,alt:img.alt||product.name})),
              variants:product.variants.map(v=>({id:v.id,name:v.name,sku:v.sku,price:v.price!=null?Number(v.price):null,stock:v.stock,options:v.options})),
              tyre:product.tyre?{size:product.tyre.size.label,loadIndex:product.tyre.loadIndex,speedRating:product.tyre.speedRating,season:product.tyre.season,runFlat:product.tyre.runFlat,warranty:product.tyre.warranty}:null,
              fitments:product.fitments.map(f=>({make:f.vehicleVariant.model.make.name,model:f.vehicleVariant.model.name,variant:f.vehicleVariant.name,yearFrom:f.vehicleVariant.yearFrom,yearTo:f.vehicleVariant.yearTo,engine:f.vehicleVariant.engine,notes:f.notes})),
              reviews:approvedReviews.map(r=>({id:r.id,rating:r.rating,title:r.title,comment:r.comment,name:r.user?.name||"Verified customer",createdAt:r.createdAt.toISOString()})),
              averageRating,count:approvedReviews.length
            }}
          />
        </div>
      </section>
      <section className="section related-section">
        <div className="container">
          <div className="section-heading"><div><p className="eyebrow">MORE FROM MOTEVRA</p><h2>You may also like.</h2></div><Link href={product.brand?.slug?"/shop?brand="+product.brand.slug:"/shop"}>View more →</Link></div>
          <RelatedProducts productId={product.id} brandId={product.brandId} categoryId={product.categoryId} productType={product.productType} currency={product.currency}/>
        </div>
      </section>
    </main><SiteFooter /></>;
  } catch { return <><SiteHeader /><main><section className="section"><div className="container narrow"><div className="empty-state"><span>PRODUCT</span><h2>Product is temporarily unavailable.</h2><p>The catalogue service could not be reached. Please try again later.</p><Link className="button button-dark" href="/shop">Back to shop</Link></div></div></section></main><SiteFooter /></>; }
}

async function RelatedProducts({productId,brandId,categoryId,productType,currency}:{productId:string;brandId:string|null;categoryId:string|null;productType:string;currency:string}) {
  let products:any[]=[];
  try {
    products=await getPrisma().product.findMany({where:{status:"ACTIVE",id:{not:productId},OR:[...(brandId?[{brandId}]:[]),...(categoryId?[{categoryId}]:[]),{productType:productType as any}]},include:{brand:true,images:{orderBy:{position:"asc"}}},orderBy:{createdAt:"desc"},take:8});
  } catch {}
  if(!products.length) return <div className="empty-state compact"><p>More products will appear here as the catalogue grows.</p><Link className="text-link" href="/shop">Browse the full catalogue →</Link></div>;
  return <div className="related-grid">{products.map(p=><Link className="product-card" href={"/product/"+p.slug} key={p.id}><div className="product-visual" style={{backgroundImage:`url("${p.images[0]?.url||fallback}")`}}><span className="product-badge">{p.productType.replace("_"," ")}</span></div><div className="product-info"><span className="product-brand">{p.brand?.name||"MOTEVRA"}</span><h3>{p.name}</h3><div className="product-price"><CurrencyPrice amount={Number(p.salePrice??p.price)} from={p.currency}/></div><span className="mini-button">View details</span></div></Link>)}</div>;
}
