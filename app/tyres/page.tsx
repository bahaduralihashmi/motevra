import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TyreFinder } from "@/components/tyre-finder";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tyres in Pakistan | Tyre Prices & Sizes",
  description:
    "Find car tyres in Pakistan by tyre size or vehicle. Compare available tyre sizes, prices and active MOTEVRA products.",
};

function sizeToSlug(label: string) {
  return label.toLowerCase().replace(/\s+/g, "").replace(/\//g, "-").replace(/r(?=\d)/, "-r");
}

export default async function TyresPage() {
  let sizes: string[] = [];

  try {
    if (process.env.DATABASE_URL) {
      const rows = await getPrisma().tyreSize.findMany({
        where: { tyres: { some: { product: { status: "ACTIVE" } } } },
        select: { label: true },
        orderBy: [{ rimSize: "asc" }, { width: "asc" }, { aspectRatio: "asc" }],
        take: 24,
      });
      sizes = rows.map((row) => row.label);
    }
  } catch {
    sizes = [];
  }

  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero">
          <div className="container narrow">
            <p className="eyebrow">TYRES IN PAKISTAN</p>
            <h1>Find the right tyre for your drive.</h1>
            <p className="hero-copy">
              Search by vehicle or exact tyre size to discover compatible options from the MOTEVRA catalogue.
              Check current tyre prices, size details, stock and product information before you buy.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container narrow">
            <TyreFinder />
          </div>
        </section>

        <section className="section">
          <div className="container narrow">
            <div className="section-heading">
              <div>
                <p className="eyebrow">POPULAR SIZES</p>
                <h2>Shop tyres by exact size.</h2>
              </div>
              <Link href="/shop">View all products →</Link>
            </div>

            {sizes.length ? (
              <div className="chip-grid">
                {sizes.map((size) => (
                  <Link key={size} className="filter-chip" href={"/shop?size=" + sizeToSlug(size)}>
                    {size} tyres
                  </Link>
                ))}
              </div>
            ) : (
              <p className="muted">
                Exact-size links will appear here as active tyre products are added to the MOTEVRA catalogue.
              </p>
            )}

            <div className="content-note" style={{ marginTop: 32 }}>
              <p>
                Looking for a specific size such as 195/65 R15 or 205/55 R16? Always confirm the size,
                load index and speed rating against your vehicle or tyre sidewall before ordering.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
