"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/store/cart-store";
import type { ProductCard } from "@/lib/mock-data";

export function AddToCartButton({ product }: { product: ProductCard }) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        addItem({
          id: product.id,
          slug: product.slug,
          name: product.name,
          brand: product.brand,
          image: product.image,
          price: product.price,
          salePrice: product.salePrice,
        });
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1200);
      }}
      className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-900 transition-colors"
    >
      {added ? "Added" : "Add to cart"}
    </button>
  );
}
