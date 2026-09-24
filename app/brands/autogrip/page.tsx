import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPrisma } from "@/lib/prisma";
import { CurrencyPrice } from "@/components/currency-price";
import { AddToCartButton } from "@/components/add-to-cart-button";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Autogrip Tyres | MOTEVRA",
  description: "Shop Autogrip tyres at MOTEVRA. Browse available Autogrip models, sizes and products.",
};

const AUTOGRIP_MODELS = [
  "P308 Plus", "Grip2000", "Grip200", "Grip670", "Grip1000", "Grip280",
  "Grip620", "Grip690", "Grip4000", "Vanmax", "Grip603", "Grip660",
  "Grip-790", "Grip-900", "Allseason AS7", "Effitrac", "Ecosaver",
  "Grip-760", "F101", "F105", "Grip-6000 LT", "F110", "Ecosnow",
  "S100", "Snowguard", "Ecosnow 4×4",
];

export default async function AutogripBrandPage() {
  let products: any[] = [];
  let connected = true;

  try {
    if (!process.env.DATABASE_URL) connected = false;
    else {
      products = await getPrisma().product.findMany({
        where: { status: "ACTIVE", brand: { slug: "autogrip" } },
        include: {
          brand: true,
          category: true,
          images: { orderBy: { position: "asc" }, take: 2 },
          tyre: { include: { size: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 60,
      });
    }
  } catch {
    connected = false;
  }

  return (
    <>
      <SiteHeader />
      <main>
        <section className="autogrip-hero">
          <div className="container">
            <p className="eyebrow">MOTEVRA / TYRE BRAND</p>
            <h1>AUTOGRIP</h1>
            <p className="autogrip-hero-copy">
              Explore Autogrip tyres through MOTEVRA — a dedicated brand storefront for
              available models, tyre sizes and fitment-ready products. Autogrip is a
              Fullrun Tyre Corp. brand from Qingdao, China.
            </p>
            <div className="autogrip-meta">
              <span className="autogrip-chip">Passenger</span>
              <span className="autogrip-chip">SUV & 4×4</span>
              <span className="autogrip-chip">Van / LTR</span>
              <span className="autogrip-chip">Summer</span>
              <span className="autogrip-chip">Winter</span>
              <span className="autogrip-chip">All-season</span>
            </div>
          </div>
          <div className="autogrip-pattern-visual" aria-hidden="true">
            <img
              src="https://omo-oss-image.thefastimg.com/portal-saas/pg2024083014125708609/cms/image/0b6c61f4-0569-40f0-8c62-3fb55b117675.jpg_640xaf.jpg"
              alt=""
            />
          </div>
        </section>

        <section className="section autogrip-range-section"><div className="container"><div className="autogrip-range-head"><div><p className="eyebrow">EXPLORE THE RANGE</p><h2>One brand. Many road needs.</h2></div><p>Choose from familiar Autogrip model families, then select the exact size and specification for your vehicle.</p></div><div className="autogrip-model-cloud">{AUTOGRIP_MODELS.map((model) => <span key={model}>{model}</span>)}</div></div></section>\n\n        <section className="section brand-product-section">
          <div className="container">
            <div className="brand-product-toolbar">
              <div>
                <p className="eyebrow">AUTOGRIP / AVAILABLE NOW</p>
                <h2>Shop Autogrip.</h2>
              </div>
              <span className="brand-product-count">
                {products.length} product{products.length === 1 ? "" : "s"}
              </span>
            </div>

            {!connected ? (
              <div className="empty-state">
                <span>CATALOGUE</span>
                <h2>Catalogue is being connected.</h2>
                <p>Connect the production database to load live Autogrip products.</p>
              </div>
            ) : products.length ? (
              <div className="brand-product-grid">
                {products.map((product) => {
                  const image = product.images[0]?.url;
                  const price = Number(product.salePrice ?? product.price);
                  return (
                    <article className="brand-product-card" key={product.id}>
                      <Link href={"/product/" + product.slug} className="brand-product-image">
                        {image ? (
                          <img src={image} alt={product.name} />
                        ) : (
                          <span className="brand-product-placeholder">AG</span>
                        )}
                        <span className="product-badge">{product.productType.replaceAll("_", " ")}</span>
                      </Link>
                      <div className="brand-product-copy">
                        <span className="product-brand">AUTOGRIP</span>
                        <h3>{product.name}</h3>
                        <p>
                          {product.tyre?.size?.label ??
                            product.category?.name ??
                            "Autogrip automotive product"}{" "}
                          · {product.stock > 0 ? "In stock" : "Out of stock"}
                        </p>
                        <div className="brand-product-price">
                          <CurrencyPrice amount={price} from={product.currency} />
                        </div>
                        <div className="brand-product-actions">
                          <Link className="button button-light" href={"/product/" + product.slug}>
                            View
                          </Link>
                          <AddToCartButton productId={product.id} stock={product.stock} />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <span>AUTOGRIP</span>
                <h2>Autogrip is ready for products.</h2>
                <p>
                  No active Autogrip products are in the catalogue yet. Add products
                  through the MOTEVRA admin with the brand set to Autogrip and they will
                  automatically appear here for purchase.
                </p>
                <Link className="button button-dark" href="/shop">Browse all products</Link>
              </div>
            )}

            <div className="autogrip-benefits"><article><span>01 / RANGE</span><h3>Broad fitment coverage.</h3><p>Autogrip is listed across many passenger-car sizes and also has SUV, 4×4, van and LTR-oriented products.</p></article><article><span>02 / SEASONS</span><h3>Built around your conditions.</h3><p>The range includes summer, winter and all-season patterns, making it easier to shop around the driving conditions you actually face.</p></article><article><span>03 / CHOICE</span><h3>More sizes. More options.</h3><p>Independent tyre catalogues list dozens of Autogrip model and size combinations, giving drivers more fitment options to explore.</p></article></div><div className="autogrip-info">
              <article>
                <span>Brand profile</span>
                <h3>China-born. Road focused.</h3>
                <p>
                  Fullrun identifies AUTOGRIP as one of its international tyre brands.
                  Its official catalogue groups Autogrip products across HP, UHP, HT,
                  VAN, AT and LTR categories.
                </p>
              </article>
              <article>
                <span>Model range</span>
                <h3>Find your size.</h3>
                <p>
                  Reference catalogues list models including P308 Plus, Grip200,
                  Grip1000, Grip280, Vanmax and winter lines such as Ecosnow and
                  Snowguard. Availability on MOTEVRA depends on the products currently
                  added to our catalogue.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container narrow">
            <p className="eyebrow">FITMENT FIRST</p>
            <h2>Need the right Autogrip size?</h2>
            <p className="hero-copy">
              Use the MOTEVRA tyre finder to narrow products by vehicle and tyre size,
              then check the product page before ordering.
            </p>
            <Link className="button button-dark" href="/tyres">Find my tyre size →</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
