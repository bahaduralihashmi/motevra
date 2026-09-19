const collections = [
  {
    title: "City Grip",
    description: "Low-noise comfort for daily drives and commuting.",
    image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Track Ready",
    description: "Ultra-responsive performance for sharper handling.",
    image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Touring Range",
    description: "Long-mileage confidence for cross-country journeys.",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
  },
];

export function Collections() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f97316]">Automotive collections</p>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-slate-900">Curated for the way you move.</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {collections.map((collection) => (
          <article key={collection.title} className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="overflow-hidden">
              <img src={collection.image} alt={collection.title} className="h-80 w-full object-cover transition duration-500 group-hover:scale-105" />
            </div>
            <div className="space-y-4 p-6">
              <h3 className="text-2xl font-black tracking-[-0.05em] text-slate-900">{collection.title}</h3>
              <p className="text-base leading-7 text-slate-600">{collection.description}</p>
              <a href="/shop" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-900">
                Discover range
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
