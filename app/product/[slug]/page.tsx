import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { AddToCartButton } from "@/components/store/add-to-cart-button";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found | MOTEVRA" };
  }

  return {
    title: `${product.name} | MOTEVRA`,
    description: `${product.name} by ${product.brand}. Premium automotive product from MOTEVRA.`,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 text-sm text-slate-500">
        <Link href="/" className="text-slate-700">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/shop" className="text-slate-700">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">{product.name}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_6rem]">
            <img src={product.images[0] ?? product.image} alt={product.name} className="h-[540px] w-full rounded-[1.5rem] object-cover" />
            <div className="flex gap-3 overflow-x-auto sm:flex-col">
              {product.images.map((image, index) => <img key={`${image}-${index}`} src={image} alt={`${product.name} view ${index + 1}`} className="h-20 w-20 shrink-0 rounded-xl border border-slate-200 object-cover" />)}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">{product.brand}</div>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-900">{product.name}</h1>
          </div>

          <div className="flex items-end gap-3">
            <span className="text-4xl font-black tracking-[-0.06em] text-slate-900">PKR {product.salePrice.toLocaleString()}</span>
            <span className="text-lg text-slate-400 line-through">PKR {product.price.toLocaleString()}</span>
          </div>

          <p className="text-base leading-7 text-slate-600">{product.description}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <AddToCartButton product={product} />
            <button className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-900">
              Save for later
            </button>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="font-semibold text-slate-900">Category:</span> {product.category}</div>
              <div><span className="font-semibold text-slate-900">Stock:</span> {product.stock}</div>
              <div><span className="font-semibold text-slate-900">Rating:</span> {product.rating}/5</div>
              <div><span className="font-semibold text-slate-900">Shipping:</span> 48h</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-black tracking-[-0.06em] text-slate-900">Related products</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {related.map((item) => (
            <Link key={item.id} href={`/product/${item.slug}`} className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
              <img src={item.image} alt={item.name} className="h-56 w-full object-cover" />
              <div className="p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.brand}</div>
                <h3 className="mt-2 text-xl font-black tracking-[-0.04em] text-slate-900">{item.name}</h3>
                <div className="mt-3 text-lg font-black text-slate-900">PKR {item.salePrice.toLocaleString()}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
