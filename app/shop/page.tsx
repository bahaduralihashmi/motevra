import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPrisma } from "@/lib/prisma";
import { CurrencyPrice } from "@/components/currency-price";
import { resolveImageUrls } from "@/lib/supabase-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sizeSlugToLabel(value: string) {
  const clean = decodeURIComponent(value).trim().toLowerCase();
  const match = clean.match(/^(\d{3})-(\d{2})-r(\d{2})$/);
  return match ? `${match[1]}/${match[2]} R${match[3]}` : value;
}

function sizeLabelToSlug(label: string) {
  return label.toLowerCase().replace(/\s+/g, "").replace(/\//g, "-").replace(/r(?=\d)/, "-r");
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ size?: string; category?: string; subcategory?: string; filter?: string; brand?: string }> }) {
  const params = await searchParams;
  const size = params.size ? sizeSlugToLabel(params.size) : null;
  const category = params.category?.trim().toLowerCase() || null;
  const subcategory = params.subcategory?.trim().toLowerCase() || null;
  const filter = params.filter?.trim().toLowerCase() || null;
  return {
    title: size ? `${size} Tyres in Pakistan | Prices & Options` : subcategory ? `${subcategory.replace(/-/g," ")} | MOTEVRA` : filter ? `${filter.replace(/-/g," ")} | MOTEVRA` : "Buy Tyres, Wheels & Auto Parts Online in Pakistan",
    description: size ? `Shop ${size} tyres in Pakistan at MOTEVRA. See available products, brands, prices and stock for this exact tyre size.` : "Shop tyres, wheels, auto parts, batteries, accessories and car care products from MOTEVRA.",
    alternates: { canonical: size ? `/shop?size=${sizeLabelToSlug(size)}` : "/shop" },
  };
}

const fallbackImages: Record<string, string> = {
  TYRE: "https://images.unsplash.com/photo-1578844251758-2f71da64c6e6?auto=format&fit=crop&w=1000&q=85",
  WHEEL: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1000&q=85",
  ACCESSORY: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1000&q=85",
  AUTO_PART: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=85",
  BATTERY: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1000&q=85",
  CAR_CARE: "https://images.unsplash.com/photo-1603712725038-e9334ae8f39f?auto=format&fit=crop&w=1000&q=85",
  OTHER: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=85",
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ size?: string; category?: string; subcategory?: string; filter?: string; brand?: string }> }) {
  const params = await searchParams;
  const size = params.size ? sizeSlugToLabel(params.size) : null;
  const category = params.category?.trim().toLowerCase() || null;
  const categoryTypeMap: Record<string, string> = { tyres: "TYRE", wheels: "WHEEL", accessories: "ACCESSORY", "auto-parts": "AUTO_PART", batteries: "BATTERY", "car-care": "CAR_CARE" };
  const expectedProductType = category ? categoryTypeMap[category] : null;
  const subcategory = params.subcategory?.trim().toLowerCase() || null;
  const filter = params.filter?.trim().toLowerCase() || null;
  const brand = params.brand?.trim().toLowerCase() || null;
  let products: any[] = [];
  let databaseError = false;

  try {
    if (!process.env.DATABASE_URL) databaseError = true;
    else {
      products = await getPrisma().product.findMany({
        where: { status: "ACTIVE",
          ...(category ? (subcategory ? { category: { slug: subcategory, parent: { slug: category } }, ...(expectedProductType ? { productType: expectedProductType as never } : {}) } : { OR: [{ category: { slug: category } }, { category: { parent: { slug: category } } }], ...(expectedProductType ? { productType: expectedProductType as never } : {}) }) : {}),
          ...(brand ? { brand: { slug: brand } } : {}),
          ...(filter ? { OR: [{ category: { slug: filter } }, { category: { name: { contains: filter.replace(/-/g," "), mode: "insensitive" } } }, { brand: { slug: filter } }, { brand: { name: { contains: filter.replace(/-/g," "), mode: "insensitive" } } }, { name: { contains: filter.replace(/-/g," "), mode: "insensitive" } }, { tyre: { size: { label: { contains: filter.replace(/-/g," "), mode: "insensitive" } } } }] } : {}),
          ...(size ? { tyre: { size: { label: size } } } : {}) },
        include: { brand: true, category: true, images: { orderBy: { position: "asc" } }, tyre: { include: { size: true } } },
        orderBy: { createdAt: "desc" },
        take: 48,
      });
      const imageMap = await resolveImageUrls(
        products.flatMap((product) => product.images.map((image: { url: string }) => image.url)),
      );
      products = products.map((product) => ({
        ...product,
        images: product.images.map((image: { url: string }) => ({
          ...image,
          url: imageMap.get(image.url) || image.url,
        })),
      }));
    }
  } catch {
    databaseError = true;
  }

  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero">
          <div className="container narrow">
            <p className="eyebrow">{size ? "TYRE SIZE" : subcategory ? "SUBCATEGORY" : category ? "CATEGORY" : "MOTEVRA SHOP"}</p>
            <h1>{size ? `${size} Tyres in Pakistan` : subcategory ? subcategory.replace(/-/g," ") : filter ? filter.replace(/-/g," ") : category ? category.replace(/-/g," ") : "Automotive products, beautifully presented."}</h1>
            <p className="hero-copy">
              {size ? `Explore available ${size} tyres, including product details, brands, prices and stock. Confirm your vehicle's required size before ordering.` : "Explore tyres, wheels, parts and accessories from one international-ready automotive catalogue."}
            </p>
          </div>
        </section>
        <section className="section">
          <div className="container">
            {databaseError ? <div className="empty-state"><span>CATALOGUE</span><h2>Catalogue is being connected.</h2><p>The storefront is online, but the product database is not available right now.</p></div> : <div className="product-grid">{products.map((product) => { const image = product.images[0]?.url || fallbackImages[product.productType] || fallbackImages.OTHER; return <Link className="product-card" href={"/product/"+product.slug} key={product.id}><div className="product-visual" style={{backgroundImage:`url("${image}")`}}><span className="product-badge">{product.productType.replace("_"," ")}</span></div><div className="product-info"><span className="product-brand">{product.brand?.name||"MOTEVRA"}</span><h3>{product.name}</h3><p className="product-meta">{product.tyre?.size.label||product.category?.name||"Automotive product"} · {product.stock>0?"In stock":"Out of stock"}</p><div className="product-price"><CurrencyPrice amount={Number(product.salePrice??product.price)} from={product.currency}/></div><div className="product-actions"><span className="mini-button">View details</span><span className="mini-button primary">Buy now</span></div></div></Link>})}</div>}
            {!databaseError&&!products.length&&<div className="empty-state"><span>{size?"TYRE SIZE":"CATALOG"}</span><h2>{size?`No active products for ${size} yet.`:"No products yet."}</h2><p>{size?"This exact-size landing page will become useful as soon as matching active products are added.":"Add active products from the MOTEVRA admin catalogue."}</p></div>}
            {size&&products.length>0&&<div className="content-note" style={{marginTop:40}}><h2>About {size} tyres</h2><p>{size} is an exact tyre-size search, so compatibility should be confirmed against the vehicle placard or the current tyre sidewall. Price varies by brand, pattern, load index, speed rating, manufacturing date and stock.</p><Link className="text-link" href="/tyres">Need help choosing your size? Use the MOTEVRA tyre finder →</Link></div>}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
