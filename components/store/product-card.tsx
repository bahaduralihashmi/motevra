import Link from "next/link";
import type { ProductCard as ProductCardData } from "@/lib/mock-data";
import { AddToCartButton } from "@/components/store/add-to-cart-button";

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
      <div className="relative p-3">
        <div className="absolute left-6 top-6 z-10 rounded-full bg-[#111827] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
          {product.badge}
        </div>
        <Link href={`/product/${product.slug}`} aria-label={`View ${product.name}`}>
          <img src={product.image} alt={product.name} className="h-64 w-full rounded-[1.25rem] object-cover transition duration-300 hover:scale-[1.02]" />
        </Link>
      </div>
      <div className="space-y-4 p-5">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{product.brand}</div>
          <Link href={`/product/${product.slug}`} className="block text-xl font-black tracking-[-0.04em] text-slate-900 hover:text-[#ea580c]">
            {product.name}
          </Link>
        </div>
        <div className="flex items-end gap-3">
          <span className="text-2xl font-black tracking-[-0.04em] text-slate-900">PKR {product.salePrice.toLocaleString()}</span>
          {product.salePrice < product.price ? <span className="text-sm text-slate-400 line-through">PKR {product.price.toLocaleString()}</span> : null}
        </div>
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>{product.category}</span>
          <span>{product.stock} in stock</span>
        </div>
        <AddToCartButton product={product} />
      </div>
    </article>
  );
}