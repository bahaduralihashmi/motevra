import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AdSlot } from "@/components/ad-slot";

export const metadata = {
  title: "MOTEVRA Automotive Guides | Tyre & Car Care Advice",
  description:
    "Practical automotive guides from MOTEVRA covering tyre sizes, maintenance, tyre pressure and driving care.",
  alternates: { canonical: "/blog" },
};

const posts = [
  {slug:"how-to-read-a-tyre-size",title:"How to Read a Tyre Size",text:"Understand width, aspect ratio, rim diameter, load index and speed rating before choosing your next tyre.",category:"Tyre Basics",image:"https://images.unsplash.com/photo-1578844251758-2f71da64c6e6?auto=format&fit=crop&w=1200&q=88",alt:"Automotive tyre tread and sidewall details for understanding tyre size"},
  {slug:"when-to-replace-car-tyres",title:"When Should You Replace Your Car Tyres?",text:"Learn the signs of tread wear, ageing, damage, uneven wear and repeated pressure loss.",category:"Maintenance",image:"https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=88",alt:"Car and tyre scene illustrating tyre inspection and replacement"},
  {slug:"tyre-pressure-guide",title:"Tyre Pressure: A Simple Driver's Guide",text:"A practical guide to correct tyre pressure, handling, braking, comfort and tyre wear.",category:"Maintenance",image:"https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1200&q=88",alt:"Passenger car tyre used for a guide to correct tyre pressure"},
  {slug:"summer-vs-all-season-tyres",title:"Summer vs All-Season Tyres",text:"Compare tyre types and understand how climate, road conditions and driving needs affect your choice.",category:"Buying Guide",image:"https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1200&q=88",alt:"Performance car tyre representing summer and all-season tyre choices"}
];

export default function Blog(){
  return <><SiteHeader/>
    <main className="blog-page">
      <section className="blog-hero"><div className="container blog-hero-inner"><div>
        <p className="eyebrow">MOTEVRA JOURNAL · AUTOMOTIVE GUIDES</p><h1>Know your drive.</h1>
        <p className="blog-hero-copy">Clear, practical automotive knowledge to help you understand tyres, maintenance and the products your vehicle needs.</p>
      </div><div className="blog-hero-mark" aria-hidden="true">M</div></div></section>
      <section className="section blog-section"><div className="container">
        <AdSlot slot="BLOG_TOP_SLOT"/>
        <div className="blog-heading"><div><p className="eyebrow">LATEST GUIDES</p><h2>Practical information.<br/>No unnecessary jargon.</h2></div><p>From reading a tyre sidewall to checking pressure, start with the guide that matches your question.</p></div>
        <div className="blog-grid">{posts.map((post,index)=><article className={`blog-card blog-card-${index+1}`} key={post.slug}>
          <Link href={`/blog/${post.slug}`} className="blog-card-image"><Image src={post.image} alt={post.alt} fill sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 33vw"/><span>{String(index+1).padStart(2,"0")}</span></Link>
          <div className="blog-card-content"><p className="blog-card-category">{post.category}</p><h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3><p>{post.text}</p><Link className="blog-read" href={`/blog/${post.slug}`}>Read guide <span>↗</span></Link></div>
        </article>)}</div>
        <div className="blog-bottom"><div><p className="eyebrow">MOTEVRA / KNOWLEDGE</p><h2>Better information<br/>makes better decisions.</h2></div><Link className="button" href="/tyres">Explore tyres</Link></div>
        <AdSlot slot="BLOG_BOTTOM_SLOT"/>
      </div></section>
    </main><SiteFooter/></>;
}
