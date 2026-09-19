const reviews = [
  {
    name: "Ammar K.",
    quote: "The fitment guidance was spot on and delivery was faster than expected. The whole experience felt premium from start to finish.",
    rating: 5,
  },
  {
    name: "Zain H.",
    quote: "I found the right geometry for my SUV in minutes and the tyres arrived exactly as promised. MOTEVRA nails the premium experience.",
    rating: 5,
  },
  {
    name: "Saad R.",
    quote: "The product quality and the detail on the pages made the decision easy. Very polished and easy to navigate on mobile.",
    rating: 5,
  },
];

export function Reviews() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f97316]">Customer reviews</p>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-slate-900">Drivers love the MOTEVRA difference.</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {reviews.map((review) => (
          <article key={review.name} className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 text-[#f59e0b]">
              {Array.from({ length: review.rating }).map((_, index) => (
                <span key={`${review.name}-${index}`} className="text-xl">★</span>
              ))}
            </div>
            <p className="text-lg leading-8 text-slate-700">“{review.quote}”</p>
            <div className="mt-6 border-t border-slate-200 pt-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-900">
              {review.name}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
