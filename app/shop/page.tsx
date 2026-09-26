import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPrisma } from "@/lib/prisma";
import { CurrencyPrice } from "@/components/currency-price";

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
function buildHref(params: Record<string,string|undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key,value]) => { if(value) query.set(key,value); });
  const text = query.toString();
  return "/shop" + (text ? "?" + text : "");
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const params = await searchParams;
  const size = params.size ? sizeSlugToLabel(params.size) : null;
  const q = params.q?.trim();
  return {
    title: q ? `Search results for "${q}" | MOTEVRA` : size ? `${size} Tyres in Pakistan | Prices & Options` : "Buy Tyres, Wheels & Auto Parts Online | MOTEVRA",
    description: q ? `Search MOTEVRA for tyres, wheels, auto parts, accessories and automotive products matching "${q}".` : size ? `Shop ${size} tyres in Pakistan at MOTEVRA.` : "Shop tyres, wheels, auto parts, batteries, accessories and car care products from MOTEVRA.",
    alternates: { canonical: q || size ? buildHref({ q, size: size ? sizeLabelToSlug(size) : undefined }) : "/shop" },
  };
}

const fallbackImages: Record<string,string> = {
  TYRE:"https://images.unsplash.com/photo-1578844251758-2f71da64c6e6?auto=format&fit=crop&w=1000&q=85",
  WHEEL:"https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1000&q=85",
  ACCESSORY:"https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1000&q=85",
  AUTO_PART:"https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=85",
  BATTERY:"https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1000&q=85",
  CAR_CARE:"https://images.unsplash.com/photo-1603712725038-e9334ae8f39f?auto=format&fit=crop&w=1000&q=85",
  OTHER:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=85",
};

const typeLabels: Record<string,string> = { TYRE:"Tyres", WHEEL:"Wheels & Rims", ACCESSORY:"Accessories", AUTO_PART:"Auto Parts", BATTERY:"Batteries", ELECTRONICS:"Electronics", CAR_CARE:"Car Care", OTHER:"Other" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const size = params.size ? sizeSlugToLabel(params.size) : "";
  const category = params.category || "";
  const brand = params.brand || "";
  const type = params.type || "";
  const sort = params.sort || "newest";
  const inStock = params.inStock === "1";
  const minPrice = Number(params.minPrice || 0);
  const maxPrice = Number(params.maxPrice || 0);
  const page = Math.max(1, Number(params.page || 1));
  const pageSize = 24;

  let products:any[] = [], brands:any[] = [], categories:any[] = [], total = 0, databaseError = false;
  try {
    if (!process.env.DATABASE_URL) databaseError = true;
    else {
      const prisma = getPrisma();
      const where:any = {
        status:"ACTIVE",
        ...(q ? { OR:[
          { name:{ contains:q, mode:"insensitive" } },
          { sku:{ contains:q, mode:"insensitive" } },
          { description:{ contains:q, mode:"insensitive" } },
          { brand:{ name:{ contains:q, mode:"insensitive" } } },
          { category:{ name:{ contains:q, mode:"insensitive" } } },
          { tyre:{ size:{ label:{ contains:q, mode:"insensitive" } } } },
        ] } : {}),
        ...(size ? { tyre:{ size:{ label:size } } } : {}),
        ...(category ? { category:{ slug:category } } : {}),
        ...(brand ? { brand:{ slug:brand } } : {}),
        ...(type ? { productType:type } : {}),
        ...(inStock ? { stock:{ gt:0 } } : {}),
        ...(minPrice > 0 || maxPrice > 0 ? { price:{ ...(minPrice>0?{gte:minPrice}:{}), ...(maxPrice>0?{lte:maxPrice}:{}) } } : {}),
      };
      const orderBy:any = sort==="price-asc" ? { price:"asc" } : sort==="price-desc" ? { price:"desc" } : sort==="oldest" ? { createdAt:"asc" } : { createdAt:"desc" };
      [products,total,brands,categories] = await Promise.all([
        prisma.product.findMany({ where, include:{ brand:true,category:true,images:{orderBy:{position:"asc"}},tyre:{include:{size:true}} }, orderBy, skip:(page-1)*pageSize, take:pageSize }),
        prisma.product.count({ where }),
        prisma.brand.findMany({ where:{ products:{ some:{ status:"ACTIVE" } } }, orderBy:{ name:"asc" }, select:{name:true,slug:true} }),
        prisma.category.findMany({ where:{ products:{ some:{ status:"ACTIVE" } } }, orderBy:{ name:"asc" }, select:{name:true,slug:true} }),
      ]);
    }
  } catch { databaseError = true; }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const activeFilterCount = [category,brand,type,size,inStock,minPrice,maxPrice].filter(Boolean).length;
  const current = { q:q||undefined, size:params.size, category:category||undefined, brand:brand||undefined, type:type||undefined, sort:sort!=="newest"?sort:undefined, inStock:inStock?"1":undefined, minPrice:minPrice?String(minPrice):undefined, maxPrice:maxPrice?String(maxPrice):undefined };
  const clearHref = buildHref({ q:q||undefined });
  const pageHref = (next:number) => buildHref({ ...current, page:String(next) });

  return <>
    <SiteHeader />
    <main>
      <section className="page-hero shop-hero">
        <div className="container narrow">
          <p className="eyebrow">{q ? "SEARCH" : size ? "TYRE SIZE" : "MOTEVRA SHOP"}</p>
          <h1>{q ? <>Results for <span className="search-query">"{q}"</span></> : size ? `${size} Tyres in Pakistan` : "Automotive products, beautifully presented."}</h1>
          <p className="hero-copy">{q ? `Showing products that match "${q}". Search by product name, SKU, brand, category or tyre size.` : size ? `Explore available ${size} tyres, including product details, brands, prices and stock.` : "Explore tyres, wheels, parts and accessories from one international-ready automotive catalogue."}</p>
        </div>
      </section>

      <section className="section shop-section">
        <div className="container">
          <div className="shop-toolbar">
            <div className="shop-toolbar-top">
              <div><span className="shop-result-count">{databaseError ? "Catalogue unavailable" : `${total} ${total===1?"product":"products"}`}</span>{activeFilterCount>0 && <span className="shop-filter-count">{activeFilterCount} filter{activeFilterCount===1?"":"s"}</span>}</div>
              <div className="shop-sort">
                <label htmlFor="shop-sort">Sort</label>
                <select id="shop-sort" defaultValue={sort}>
                  <option value="newest">Newest</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="oldest">Oldest</option>
                </select>
              </div>
            </div>
            <form className="shop-filters" method="get">
              {q && <input type="hidden" name="q" value={q}/>}
              {size && <input type="hidden" name="size" value={params.size}/>}
              <div><label htmlFor="filter-category">Category</label><select id="filter-category" name="category" defaultValue={category}><option value="">All categories</option>{categories.map((x:any)=><option key={x.slug} value={x.slug}>{x.name}</option>)}</select></div>
              <div><label htmlFor="filter-brand">Brand</label><select id="filter-brand" name="brand" defaultValue={brand}><option value="">All brands</option>{brands.map((x:any)=><option key={x.slug} value={x.slug}>{x.name}</option>)}</select></div>
              <div><label htmlFor="filter-type">Product type</label><select id="filter-type" name="type" defaultValue={type}><option value="">All types</option>{Object.entries(typeLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></div>
              <div><label htmlFor="min-price">Min price</label><input id="min-price" name="minPrice" type="number" min="0" step="1" defaultValue={minPrice||""} placeholder="0"/></div>
              <div><label htmlFor="max-price">Max price</label><input id="max-price" name="maxPrice" type="number" min="0" step="1" defaultValue={maxPrice||""} placeholder="No limit"/></div>
              <label className="shop-stock-check"><input type="checkbox" name="inStock" value="1" defaultChecked={inStock}/> In stock only</label>
              <div className="shop-filter-actions"><button className="button button-dark" type="submit">Apply filters</button><Link className="button" href={clearHref}>Clear</Link></div>
            </form>
            <div className="shop-filter-chips">
              {q && <Link href={clearHref}>Search: {q} ×</Link>}
              {category && <Link href={buildHref({...current,category:undefined,page:undefined})}>Category ×</Link>}
              {brand && <Link href={buildHref({...current,brand:undefined,page:undefined})}>Brand ×</Link>}
              {type && <Link href={buildHref({...current,type:undefined,page:undefined})}>Type ×</Link>}
              {inStock && <Link href={buildHref({...current,inStock:undefined,page:undefined})}>In stock ×</Link>}
            </div>
          </div>

          {databaseError ? <div className="empty-state"><span>CATALOGUE</span><h2>Catalogue is being connected.</h2><p>The storefront is online, but the product database is not available right now.</p></div> :
            products.length ? <div className="product-grid">
              {products.map((product:any) => {
                const image=product.images[0]?.url || fallbackImages[product.productType] || fallbackImages.OTHER;
                return <Link className="product-card" href={"/product/"+product.slug} key={product.id}>
                  <div className="product-visual" style={{backgroundImage:`url("${image}")`}}><span className="product-badge">{typeLabels[product.productType] || product.productType}</span></div>
                  <div className="product-info"><span className="product-brand">{product.brand?.name || "MOTEVRA"}</span><h3>{product.name}</h3><p className="product-meta">{product.tyre?.size.label || product.category?.name || "Automotive product"} · {product.stock>0?"In stock":"Out of stock"}</p><div className="product-price"><CurrencyPrice amount={Number(product.salePrice ?? product.price)} from={product.currency}/></div><div className="product-actions"><span className="mini-button">View details</span><span className="mini-button primary">Buy now</span></div></div>
                </Link>;
              })}
            </div> : <div className="empty-state"><span>{q?"SEARCH":"CATALOG"}</span><h2>{q?`No products found for "${q}".`:size?`No active products for ${size} yet.`:"No products match these filters."}</h2><p>Try another search term, remove a filter, or browse the full catalogue.</p><Link className="button button-dark" href="/shop">Browse all products</Link></div>}

          {!databaseError && totalPages>1 && <nav className="shop-pagination" aria-label="Product pagination">
            {page>1 && <Link className="button" href={pageHref(page-1)}>← Previous</Link>}
            <span>Page {page} of {totalPages}</span>
            {page<totalPages && <Link className="button button-dark" href={pageHref(page+1)}>Next →</Link>}
          </nav>}
        </div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
