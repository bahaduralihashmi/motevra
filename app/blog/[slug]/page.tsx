import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

const fallbackArticles: Record<string, { title: string; excerpt: string; content: string }> = {
  "how-to-read-your-tyre-size": { title: "How to read your tyre size", excerpt: "A clear guide to the numbers on your sidewall.", content: "Your tyre size describes width, aspect ratio, and rim diameter. Match all three measurements to your vehicle specification before ordering, and use MOTEVRA compatibility search when you need a second check." },
  "when-to-replace-your-tyres": { title: "When should you replace your tyres?", excerpt: "Know the signs before grip becomes a problem.", content: "Inspect tread depth, sidewall damage, uneven wear, and the age of the tyre. If you notice cracks, bulges, or repeated pressure loss, have the tyre inspected by a qualified professional." },
  "choosing-tyres-for-city-driving": { title: "Choosing tyres for city driving", excerpt: "What matters most on daily urban routes.", content: "For city driving, prioritize wet braking, comfort, predictable handling, and durability. The right choice depends on your vehicle, local road conditions, and the tyre size approved for your car." },
};

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let article = fallbackArticles[slug];

  if (process.env.DATABASE_URL) {
    try {
      const post = await db.blogPost.findUnique({ where: { slug, isPublished: true } });
      if (post) article = { title: post.title, excerpt: post.excerpt ?? "MOTEVRA Journal", content: post.content };
    } catch {
      // Keep the editorial fallback available.
    }
  }

  if (!article) notFound();

  return <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8"><Link href="/blog" className="text-sm font-semibold text-slate-900 underline decoration-[#f97316] underline-offset-4">Back to journal</Link><p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">MOTEVRA Journal</p><h1 className="mt-3 text-5xl font-black tracking-[-0.07em] text-slate-900">{article.title}</h1><p className="mt-5 text-xl leading-8 text-slate-600">{article.excerpt}</p><div className="mt-10 border-t border-slate-200 pt-8 text-lg leading-9 text-slate-700"><p>{article.content}</p></div></article>;
}
