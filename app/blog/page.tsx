import Link from "next/link";
import { db } from "@/lib/db";

const fallbackPosts = [
  { slug: "how-to-read-your-tyre-size", title: "How to read your tyre size", excerpt: "A clear guide to width, aspect ratio, rim size, and the markings on your sidewall." },
  { slug: "when-to-replace-your-tyres", title: "When should you replace your tyres?", excerpt: "The practical signs that your current set is ready for inspection or replacement." },
  { slug: "choosing-tyres-for-city-driving", title: "Choosing tyres for city driving", excerpt: "What matters most when your daily route is made of traffic, heat, and changing road surfaces." },
];

export default async function BlogPage() {
  let posts = fallbackPosts;
  if (process.env.DATABASE_URL) {
    try {
      const records = await db.blogPost.findMany({ where: { isPublished: true }, orderBy: { publishedAt: "desc" }, take: 12 });
      if (records.length) posts = records.map((post) => ({ slug: post.slug, title: post.title, excerpt: post.excerpt ?? "MOTEVRA journal" }));
    } catch {
      // Use editorial fallback until database content is available.
    }
  }

  return <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><div className="mb-10 max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">Journal</p><h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-900">Better decisions for every drive.</h1><p className="mt-4 text-base leading-7 text-slate-600">Guides, maintenance notes, and practical automotive knowledge from MOTEVRA.</p></div><div className="grid gap-6 md:grid-cols-3">{posts.map((post) => <article key={post.slug} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f97316]">MOTEVRA Journal</div><h2 className="mt-4 text-2xl font-black tracking-[-0.05em] text-slate-900">{post.title}</h2><p className="mt-3 leading-7 text-slate-600">{post.excerpt}</p><Link href={`/blog/${post.slug}`} className="mt-6 inline-flex text-sm font-semibold text-slate-900 underline decoration-[#f97316] underline-offset-4">Read article</Link></article>)}</div></div>;
}