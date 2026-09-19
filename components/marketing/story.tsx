import Link from "next/link";

const stories = [
  {
    title: "Why premium tyres matter in every season",
    excerpt: "The right compound changes grip, safety, confidence, and efficiency across road conditions.",
    image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "How to choose the ideal tyre for your vehicle",
    excerpt: "Fitment, load rating, and driving profile all influence how tyres behave on the road.",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Performance tips for city and highway driving",
    excerpt: "A smarter tyre setup improves lane confidence, braking response, and cabin comfort.",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
  },
];

export function StorySection() {
  return (
    <section className="bg-[#0b0d10] py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#fbbf24]">MOTEVRA stories</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-white">Insights for better driving.</h2>
          </div>
          <Link href="/blog" className="text-sm font-semibold text-white underline decoration-[#f97316] underline-offset-4">Read the journal</Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {stories.map((story) => (
            <article key={story.title} className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/5">
              <img src={story.image} alt={story.title} className="h-56 w-full object-cover" />
              <div className="space-y-4 p-6">
                <h3 className="text-2xl font-black tracking-[-0.05em] text-white">{story.title}</h3>
                <p className="text-base leading-7 text-slate-300">{story.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
