import { getCatalogProducts } from "@/lib/catalog";
import { ShopCatalog } from "@/components/store/shop-catalog";

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const products = await getCatalogProducts();
  const params = await searchParams;
  const initialBrand = typeof params.brand === "string" ? params.brand : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">Shop</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-900">Premium tyre collection</h1>
        </div>
        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
          {products.length} products available
        </div>
      </div>

      <ShopCatalog products={products} initialBrand={initialBrand} />
    </div>
  );
}
