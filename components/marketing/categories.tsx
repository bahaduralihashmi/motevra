const categories = [
  { name: "Summer tyres", image: "https://images.unsplash.com/photo-1489820144811-0d7f6f87d154?auto=format&fit=crop&w=900&q=80", accent: "#f97316" },
  { name: "All-season", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80", accent: "#38bdf8" },
  { name: "Performance", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80", accent: "#a78bfa" },
  { name: "SUV & 4x4", image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80", accent: "#f472b6" },
];

export function Categories() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f97316]">Shop by category</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-slate-900">Built for every drive.</h2>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => (
          <article key={category.name} className="group overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="relative h-72 overflow-hidden">
              <img src={category.image} alt={category.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/15 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="mb-2 inline-flex h-2.5 w-10 rounded-full" style={{ backgroundColor: category.accent }} />
                <h3 className="text-2xl font-black text-white tracking-[-0.05em]">{category.name}</h3>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
