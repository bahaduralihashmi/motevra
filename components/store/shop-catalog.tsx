"use client";

import { useMemo, useState } from "react";
import type { ProductCard as ProductCardData } from "@/lib/mock-data";
import { ProductCard } from "@/components/store/product-card";

export function ShopCatalog({ products, initialBrand }: { products: ProductCardData[]; initialBrand?: string }) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState(initialBrand && products.some((product) => product.brand === initialBrand) ? initialBrand : "All brands");
  const [category, setCategory] = useState("All categories");
  const [sort, setSort] = useState("featured");

  const brands = ["All brands", ...new Set(products.map((product) => product.brand))];
  const categories = ["All categories", ...new Set(products.map((product) => product.category))];

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = products.filter((product) => {
      const matchesQuery = !normalizedQuery || [product.name, product.brand, product.category].some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesBrand = brand === "All brands" || product.brand === brand;
      const matchesCategory = category === "All categories" || product.category === category;
      return matchesQuery && matchesBrand && matchesCategory;
    });

    return [...result].sort((left, right) => {
      if (sort === "price-low") return left.salePrice - right.salePrice;
      if (sort === "price-high") return right.salePrice - left.salePrice;
      return Number(right.rating) - Number(left.rating);
    });
  }, [brand, category, products, query, sort]);

  return (
    <>
      <div className="mb-8 grid gap-3 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <label className="sr-only" htmlFor="product-search">Search products</label>
        <input id="product-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tyres, brands, categories..." className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#f97316]" />
        <select value={brand} onChange={(event) => setBrand(event.target.value)} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#f97316]">
          {brands.map((option) => <option key={option}>{option}</option>)}
        </select>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#f97316]">
          {categories.map((option) => <option key={option}>{option}</option>)}
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#f97316]">
          <option value="featured">Sort: Featured</option>
          <option value="price-low">Price: Low to high</option>
          <option value="price-high">Price: High to low</option>
        </select>
      </div>

      {filteredProducts.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
          No products match those filters.
        </div>
      )}
    </>
  );
}