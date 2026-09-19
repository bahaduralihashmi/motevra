import Link from "next/link";
import { ProductCard } from "@/components/store/product-card";
import { getCompatibleProducts } from "@/lib/compatibility";

export default async function TyresPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const getValue = (key: string) => typeof params[key] === "string" ? params[key] : undefined;
  const width = getValue("width");
  const aspect = getValue("aspect");
  const rim = getValue("rim");
  const manufacturer = getValue("manufacturer");
  const model = getValue("model");
  const products = await getCompatibleProducts({ width: Number(width) || undefined, aspect: Number(aspect) || undefined, rim: Number(rim) || undefined, manufacturer, model });
  const hasSearch = Boolean(width || aspect || rim || manufacturer || model);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">Compatibility</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-900">Tyres that fit your drive</h1>
        </div>
        <Link href="/" className="text-sm font-semibold text-slate-900 underline decoration-[#f97316] underline-offset-4">New search</Link>
      </div>

      <div className="mb-8 flex flex-wrap gap-3 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        {hasSearch ? <>
          {width && aspect && rim ? <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">{width} / {aspect} / R{rim}</span> : null}
          {manufacturer && model ? <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">{manufacturer} {model}</span> : null}
        </> : <span className="text-sm text-slate-600">Showing all available compatibility matches.</span>}
      </div>

      {products.length ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">No compatible tyres found for this vehicle or size.</div>}
      {!process.env.DATABASE_URL && hasSearch ? <p className="mt-5 text-center text-sm text-amber-700">Connect PostgreSQL and run the seed command to enable verified compatibility matching.</p> : null}
    </div>
  );
}
