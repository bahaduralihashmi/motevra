import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AdSlot } from "@/components/ad-slot";

const articles = {
  "how-to-read-a-tyre-size": {
    title: "How to Read a Tyre Size",
    description:
      "Learn how to read tyre size markings such as 205/55 R16, including tyre width, aspect ratio, construction, rim diameter, load index and speed rating.",
    image:
      "https://images.unsplash.com/photo-1578844251758-2f71da64c6e6?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Automotive tyre showing tread and sidewall details for understanding tyre size",
  },
  "when-to-replace-car-tyres": {
    title: "When Should You Replace Your Car Tyres?",
    description:
      "Learn the common signs of tyre wear, ageing, damage, uneven tread and pressure loss that can mean your car tyres need replacement or inspection.",
    image:
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Car and tyre scene illustrating tyre inspection and replacement",
  },
  "tyre-pressure-guide": {
    title: "Tyre Pressure: A Simple Driver's Guide",
    description:
      "Understand why correct tyre pressure matters for handling, braking, comfort and tyre wear, and where to find your vehicle's recommended pressure.",
    image:
      "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Passenger car tyre used for a guide to correct tyre pressure",
  },
  "summer-vs-all-season-tyres": {
    title: "Summer vs All-Season Tyres",
    description:
      "Compare summer and all-season tyres and understand how climate, road conditions and driving needs affect your tyre choice.",
    image:
      "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Performance car tyre representing summer and all-season tyre choices",
  },
} as const;

export function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = articles[slug as keyof typeof articles];
  if (!article) return {};
  return {
    title: article.title + " | MOTEVRA Guides",
    description: article.description,
    alternates: { canonical: "/blog/" + slug },
    openGraph: {
      title: article.title + " | MOTEVRA Guides",
      description: article.description,
      type: "article",
      images: [{ url: article.image, alt: article.imageAlt }],
    },
  };
}

function ArticleContent({ slug }: { slug: keyof typeof articles }) {
  if (slug === "how-to-read-a-tyre-size") {
    return (
      <>
        <p>A tyre sidewall can look like a collection of numbers and letters, but each part tells you something important about the tyre. A common example is <strong>205/55 R16 91V</strong>.</p>
        <h2>What does 205/55 R16 mean?</h2>
        <div className="article-spec-grid">
          <div><strong>205</strong><span>Tyre width</span><p>205 millimetres is the nominal width of the tyre from sidewall to sidewall.</p></div>
          <div><strong>55</strong><span>Aspect ratio</span><p>The sidewall height is 55% of the tyre width.</p></div>
          <div><strong>R</strong><span>Construction</span><p>R means the tyre uses radial construction, which is standard on most modern passenger cars.</p></div>
          <div><strong>16</strong><span>Rim diameter</span><p>The tyre is designed to fit a 16-inch wheel.</p></div>
        </div>
        <h2>What do 91V mean?</h2>
        <p>The numbers and letters after the rim diameter are normally the <strong>load index</strong> and <strong>speed rating</strong>. A load index identifies the tyre's maximum load capacity according to the applicable tyre standard, while the speed rating indicates the tyre's rated maximum speed under specified conditions.</p>
        <p>For an actual vehicle, always use the tyre size, load index and speed rating recommended by the vehicle manufacturer. Do not choose a replacement tyre from size alone.</p>
        <h2>How to find your correct tyre size</h2>
        <ol>
          <li>Read the full marking on the current tyre sidewall.</li>
          <li>Check the vehicle owner's manual for the manufacturer's approved sizes.</li>
          <li>Check the tyre information label on the vehicle, where fitted.</li>
          <li>Compare width, aspect ratio, rim diameter, load index and speed rating.</li>
          <li>Confirm the replacement tyre is suitable for your vehicle and intended use.</li>
        </ol>
        <div className="article-callout"><strong>Example:</strong> 225/45 R17 94W means a 225 mm tyre width, 45 aspect ratio, radial construction, a 17-inch rim diameter, load index 94 and W speed rating.</div>
        <h2>Why tyre size matters</h2>
        <p>The correct tyre specification helps preserve the vehicle's designed handling, braking characteristics, load capacity and wheel fitment. Fitting an incorrect size can affect clearance, speedometer readings, handling and other vehicle characteristics.</p>
        <p>If you are unsure, check the manufacturer's specification or consult a qualified tyre professional before purchasing.</p>
      </>
    );
  }
  if (slug === "when-to-replace-car-tyres") {
    return <><p>Tyres should be checked regularly because tread wear is only one part of tyre condition. Age, damage, uneven wear and repeated pressure loss can also affect whether a tyre remains suitable for use.</p><h2>Signs to check</h2><ul><li>Low or uneven tread depth</li><li>Cracks, cuts, bulges or exposed cords</li><li>Uneven wear across the tread</li><li>Repeated pressure loss</li><li>Vibration or pulling that may indicate a tyre or alignment problem</li></ul><h2>Check age as well as tread</h2><p>Tyre rubber changes over time. Check the tyre's date information and follow the vehicle and tyre manufacturer's guidance on service life. If you see structural damage, have the tyre inspected promptly.</p><h2>Before replacing tyres</h2><p>Confirm the correct size, load index and speed rating for your vehicle rather than choosing only by price or appearance.</p></>;
  }
  if (slug === "tyre-pressure-guide") {
    return <><p>Correct tyre pressure supports predictable handling, braking, tyre wear and ride comfort. The correct value is vehicle-specific.</p><h2>Where to find the recommended pressure</h2><p>Check the vehicle owner's manual or the manufacturer's tyre-pressure label, commonly located on a door jamb or another vehicle information area.</p><h2>How to check pressure</h2><ol><li>Check when the tyres are cold where possible.</li><li>Use an accurate pressure gauge.</li><li>Adjust each tyre to the vehicle manufacturer's recommended value.</li><li>Replace valve caps and check again regularly.</li></ol><p>Do not use the maximum pressure printed on the tyre sidewall as the vehicle's normal recommended pressure unless the vehicle manufacturer specifies it.</p></>;
  }
  return <><p>Summer and all-season tyres are designed with different priorities. Summer tyres focus on warm-weather grip and handling, while all-season tyres are designed to provide broader usability across changing conditions.</p><h2>Summer tyres</h2><p>They are generally designed for warm conditions and can prioritize dry and wet-road handling in those temperatures.</p><h2>All-season tyres</h2><p>They are designed as a compromise for drivers who want one tyre type across a wider range of temperatures and conditions.</p><h2>Which specification matters?</h2><p>Consider your local climate, road conditions, driving style, vehicle manufacturer's recommendations and the tyre's approved specification. There is no single tyre type that is appropriate for every vehicle or climate.</p></>;
}

export default async function Article({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articles[slug as keyof typeof articles];
  if (!article) notFound();

  return (
    <>
      <SiteHeader />
      <main className="article-page">
        <article>
          <header className="article-hero">
            <div className="container article-hero-grid">
              <div>
                <p className="eyebrow">MOTEVRA GUIDE · TYRES & AUTOMOTIVE</p>
                <h1>{article.title}</h1>
                <p className="article-lead">{article.description}</p>
              </div>
              <div className="article-hero-image">
                <Image src={article.image} alt={article.imageAlt} fill priority sizes="(max-width: 900px) 100vw, 50vw" />
              </div>
            </div>
          </header>
          <div className="container article-layout">
            <aside className="article-side"><Link href="/blog">← All guides</Link><p>Practical automotive information from MOTEVRA.</p></aside>
            <div className="article-body">
              <AdSlot slot="ARTICLE_TOP_SLOT" />
              <ArticleContent slug={slug as keyof typeof articles} />
              <AdSlot slot="ARTICLE_BOTTOM_SLOT" />
              <div className="article-footer"><Link className="button" href="/tyres">Shop tyres</Link><Link className="text-link" href="/contact">Need help? Contact MOTEVRA →</Link></div>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
