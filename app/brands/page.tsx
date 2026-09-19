import Link from "next/link";
import { db } from "@/lib/db";

const fallbackBrands = ["Pirelli", "Michelin", "Bridgestone", "Continental", "Goodyear", "Yokohama"];

type BrandRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
};

export default async function BrandsPage() {
  let brands: BrandRow[] = fallbackBrands.map((name) => ({
    id: name,
    name,
    slug: name.toLowerCase(),
    description: null,
    productCount: 0,
  }));

  if (process.env.DATABASE_URL) {
    try {
      const records = await db.brand.findMany({
        include: { _count: { select: { products: true } } },
        orderBy: { name: "asc" },
      });
      brands = records.map((brand) => ({
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        description: brand.description,
        productCount: brand._count.products,
      }));
    } catch {
      // Keep the directory usable while the database is unavailable.
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">Brands</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-900">Performance you can trust.</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">Explore premium automotive brands available through MOTEVRA.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => (
          <article key={brand.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-xl font-black text-[#f97316]">{brand.name.slice(0, 1)}</div>
            <h2 className="mt-5 text-2xl font-black tracking-[-0.05em] text-slate-900">{brand.name}</h2>
            <p className="mt-2 min-h-10 text-sm leading-6 text-slate-600">{brand.description ?? "Premium tyres and automotive products for confident driving."}</p>
            <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
              <span className="text-sm text-slate-500">{brand.productCount ? `${brand.productCount} products` : "Explore products"}</span>
              <Link href={`/shop?brand=${encodeURIComponent(brand.name)}`} className="text-sm font-semibold text-slate-900 underline decoration-[#f97316] underline-offset-4">Shop brand</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
