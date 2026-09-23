import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPrisma } from "@/lib/prisma";
import { CurrencyPrice } from "@/components/currency-price";
import { AddToCartButton } from "@/components/add-to-cart-button";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Chinese Tyre Brands | MOTEVRA",
  description:
    "Explore Chinese tyre brands and active tyre products added to the MOTEVRA catalogue.",
};

const CATEGORY_SLUG = "chinese-tyre-brands";

type BrandGroup = {
  id: string;
  name: string;
  slug: string;
  products: any[];
};

export default async function ChineseTyreBrandsPage() {
  let groups: BrandGroup[] = [];
  let connected = true;

  try {
    if (!process.env.DATABASE_URL) {
      connected = false;
    } else {
      const products = await getPrisma().product.findMany({
        where: {
          status: "ACTIVE",
          productType: "TYRE",
          category: { slug: CATEGORY_SLUG },
        },
        include: {
          brand: true,
          category: true,
          images: { orderBy: { position: "asc" }, take: 2 },
          tyre: { include: { size: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 120,
      });

      const byBrand = new Map<string, BrandGroup>();

      for (const product of products) {
        if (!product.brand) continue;
        const existing = byBrand.get(product.brand.id);

        if (existing) {
          existing.products.push(product);
        } else {
          byBrand.set(product.brand.id, {
            id: product.brand.id,
            name: product.brand.name,
            slug: product.brand.slug,
            products: [product],
          });
        }
      }

      groups = Array.from(byBrand.values());
    }
  } catch {
    connected = false;
  }

  const productCount = groups.reduce((total, group) => total + group.products.length, 0);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="chinese-tyres-hero">
          <div className="container">
            <p className="eyebrow">MOTEVRA / TYRES / COLLECTION</p>
            <h1>Chinese tyre brands.</h1>
            <p className="chinese-tyres-hero-copy">
              A dedicated MOTEVRA collection for Chinese tyre brands you choose to
              add to the catalogue. Brands appear here automatically when their
              active tyre products are assigned to the <strong>Chinese Tyre Brands</strong>
              category in Admin.
            </p>
            <div className="chinese-tyres-meta">
              <span>{groups.length} brand{groups.length === 1 ? "" : "s"}</span>
              <span>{productCount} active product{productCount === 1 ? "" : "s"}</span>
              <Link href="/tyres">Find by tyre size →</Link>
            </div>
          </div>
        </section>

        <section className="section chinese-tyres-section">
          <div className="container">
            {!connected ? (
              <div className="empty-state">
                <span>CATALOGUE</span>
                <h2>Catalogue is being connected.</h2>
                <p>Connect the production database to load Chinese tyre brands.</p>
              </div>
            ) : groups.length === 0 ? (
              <div className="empty-state">
                <span>CHINESE TYRE BRANDS</span>
                <h2>Your collection is ready.</h2>
                <p>
                  Add a tyre in Admin with its brand and set the category to
                  <strong> Chinese Tyre Brands</strong>. Once published, the brand
                  and product will appear here automatically.
                </p>
                <Link className="button button-dark" href="/admin">
                  Open Admin
                </Link>
              </div>
            ) : (
              <>
                <div className="chinese-brand-index" aria-label="Chinese tyre brands">
                  {groups.map((group) => (
                    <a key={group.id} href={"#" + group.slug}>
                      <span>{String(group.name).slice(0, 1)}</span>
                      <strong>{group.name}</strong>
                      <small>{group.products.length} product{group.products.length === 1 ? "" : "s"}</small>
                    </a>
                  ))}
                </div>

                <div className="chinese-brand-sections">
                  {groups.map((group) => (
                    <section className="chinese-brand-section" id={group.slug} key={group.id}>
                      <div className="chinese-brand-heading">
                        <div>
                          <p className="eyebrow">TYRE BRAND</p>
                          <h2>{group.name}</h2>
                        </div>
                        <span>{group.products.length} product{group.products.length === 1 ? "" : "s"}</span>
                      </div>

                      <div className="brand-product-grid">
                        {group.products.map((product) => {
                          const image = product.images[0]?.url;
                          const price = Number(product.salePrice ?? product.price);

                          return (
                            <article className="brand-product-card" key={product.id}>
                              <Link href={"/product/" + product.slug} className="brand-product-image">
                                {image ? (
                                  <img src={image} alt={product.images[0]?.alt || product.name} />
                                ) : (
                                  <span className="brand-product-placeholder">
                                    {String(group.name).slice(0, 2).toUpperCase()}
                                  </span>
                                )}
                                <span className="product-badge">TYRE</span>
                              </Link>

                              <div className="brand-product-copy">
                                <span className="product-brand">{group.name}</span>
                                <h3>{product.name}</h3>
                                <p>
                                  {product.tyre?.size?.label || "Tyre"} ·{" "}
                                  {product.stock > 0 ? "In stock" : "Out of stock"}
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
                    </section>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        <section className="section section-dark chinese-tyres-guide">
          <div className="container narrow">
            <p className="eyebrow">FITMENT FIRST</p>
            <h2>Shop by size. Then choose the brand.</h2>
            <p className="hero-copy">
              Use the MOTEVRA tyre finder to check vehicle or tyre-size information
              before opening a product and confirming its specifications.
            </p>
            <Link className="button button-light" href="/tyres">
              Open tyre finder →
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
