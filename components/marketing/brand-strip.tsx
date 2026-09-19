const brands = ["Pirelli", "Michelin", "Bridgestone", "Continental", "Goodyear", "Yokohama"];

export function BrandStrip() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f97316]">Featured brands</p>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-slate-900">Trusted performance partners.</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {brands.map((brand) => (
          <div key={brand} className="flex h-24 items-center justify-center rounded-[1.5rem] border border-slate-200 bg-white text-xl font-black tracking-[-0.06em] text-slate-700 shadow-sm">
            {brand}
          </div>
        ))}
      </div>
    </section>
  );
}
