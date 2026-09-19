import Link from "next/link";
import { ProductCard } from "@/components/store/product-card";
import { getCatalogProducts } from "@/lib/catalog";

export default async function WheelsPage() {
  const products = (await getCatalogProducts()).filter((product) => /wheel|rim/i.test(`${product.name} ${product.category}`));
  return <ProductCollection title="Wheels" eyebrow="Wheels" description="Complete your setup with confident fitment and considered design." products={products} empty="Wheel inventory is being prepared. Browse our tyre collection in the meantime." />;
}

function ProductCollection({ title, eyebrow, description, products, empty }: { title: string; eyebrow: string; description: string; products: Awaited<ReturnType<typeof getCatalogProducts>>; empty: string }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">{eyebrow}</p><h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-900">{title}</h1><p className="mt-4 text-base leading-7 text-slate-600">{description}</p></div>
      {products.length ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">{empty}<div className="mt-5"><Link href="/shop" className="font-semibold text-slate-900 underline decoration-[#f97316] underline-offset-4">Browse shop</Link></div></div>}
    </div>
  );
}
