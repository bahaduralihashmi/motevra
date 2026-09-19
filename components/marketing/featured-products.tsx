import Link from "next/link";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { AddToCartButton } from "@/components/store/add-to-cart-button";

export function FeaturedProducts() {
  return (
    <section className="bg-[#f8fafc] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f97316]">Trending products</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-slate-900">Performance, ready to ship.</h2>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-slate-900 underline decoration-[#f97316] underline-offset-4">View all products</Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {MOCK_PRODUCTS.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
              <div className="relative p-3">
                <div className="absolute left-6 top-6 rounded-full bg-[#111827] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                  {product.badge}
                </div>
                <Link href={`/product/${product.slug}`}>
                  <img src={product.image} alt={product.name} className="h-64 w-full rounded-[1.25rem] object-cover" />
                </Link>
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <Link href={`/product/${product.slug}`} className="text-xl font-black tracking-[-0.04em] text-slate-900">
                    {product.name}
                  </Link>
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-2xl font-black tracking-[-0.04em] text-slate-900">PKR {product.salePrice.toLocaleString()}</span>
                  <span className="text-sm text-slate-400 line-through">PKR {product.price.toLocaleString()}</span>
                </div>
                <AddToCartButton product={product} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
