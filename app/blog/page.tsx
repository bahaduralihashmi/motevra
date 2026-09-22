import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AdSlot } from "@/components/ad-slot";

const posts = [
  {slug:"how-to-read-a-tyre-size",title:"How to Read a Tyre Size",text:"Understand width, aspect ratio, rim diameter, load index and speed rating before choosing your next tyre.",category:"Tyre Basics",image:"https://images.unsplash.com/photo-1578844251758-2f71da64c6e6?auto=format&fit=crop&w=1200&q=88",alt:"Automotive tyre tread and sidewall details for understanding tyre size"},
  {slug:"when-to-replace-car-tyres",title:"When Should You Replace Your Car Tyres?",text:"Learn the signs of tread wear, ageing, damage, uneven wear and repeated pressure loss.",category:"Maintenance",image:"https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=88",alt:"Car and tyre scene illustrating tyre inspection and replacement"},
  {slug:"tyre-pressure-guide",title:"Tyre Pressure: A Simple Driver's Guide",text:"A practical guide to correct tyre pressure, handling, braking, comfort and tyre wear.",category:"Maintenance",image:"https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1200&q=88",alt:"Passenger car tyre used for a guide to correct tyre pressure"},
  {slug:"summer-vs-all-season-tyres",title:"Summer vs All-Season Tyres",text:"Compare tyre types and understand how climate, road conditions and driving needs affect your choice.",category:"Buying Guide",image:"https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1200&q=88",alt:"Performance car tyre representing summer and all-season tyre choices"}
];

export const metadata = {
  title:"MOTEVRA Blog | Tyre Guides, Maintenance & Automotive Advice",
  description:"Explore MOTEVRA automotive guides covering tyre sizes, tyre pressure, tyre replacement, seasonal tyres and practical car maintenance advice."
};

export default function Blog(){
  return <><SiteHeader/>
    <style jsx global>{`
      .blog-page{background:var(--bg)}
      .blog-hero{min-height:clamp(520px,68vh,760px);display:flex;align-items:flex-end;background:#111;color:#fff;position:relative;overflow:hidden}
      .blog-hero:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 82% 30%,rgba(232,75,42,.2),transparent 30%),linear-gradient(115deg,#111 0%,#181818 58%,#0c0c0c 100%)}
      .blog-hero:after{content:"";position:absolute;right:-7vw;top:8%;width:42vw;height:42vw;border:1px solid rgba(255,255,255,.08);border-radius:50%;box-shadow:0 0 0 80px rgba(255,255,255,.025),0 0 0 160px rgba(255,255,255,.018)}
      .blog-hero-inner{position:relative;z-index:2;display:flex;align-items:flex-end;justify-content:space-between;gap:40px;padding-top:150px;padding-bottom:78px}
      .blog-hero .eyebrow{color:rgba(255,255,255,.55)}
      .blog-hero h1{font-size:clamp(72px,12vw,170px);max-width:1000px;margin-bottom:24px;letter-spacing:-.09em}
      .blog-hero-copy{font-size:19px;line-height:1.55;color:rgba(255,255,255,.68);max-width:620px;margin:0}
      .blog-hero-mark{font-family:'Space Grotesk';font-size:clamp(180px,28vw,420px);font-weight:700;line-height:.65;letter-spacing:-.14em;color:rgba(255,255,255,.045);user-select:none}
      .blog-section{padding-top:74px}
      .blog-heading{display:grid;grid-template-columns:1.25fr .75fr;gap:60px;align-items:end;margin:15px 0 48px;padding-bottom:30px;border-bottom:1px solid var(--line)}
      .blog-heading h2{font-size:clamp(40px,5vw,68px);margin:0}
      .blog-heading>p{max-width:420px;color:var(--muted);font-size:14px;line-height:1.7;margin:0 0 3px}
      .blog-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:2px;background:var(--ink);border:1px solid var(--ink)}
      .blog-card{background:#fff;min-width:0}
      .blog-card-image{display:block;position:relative;aspect-ratio:16/10;overflow:hidden;background:#ddd}
      .blog-card-image img{object-fit:cover;transition:transform .65s cubic-bezier(.2,.7,.2,1),filter .45s ease}
      .blog-card-image:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 45%,rgba(0,0,0,.38));pointer-events:none}
      .blog-card-image span{position:absolute;z-index:2;right:18px;top:17px;font-family:'Space Grotesk';font-size:12px;font-weight:700;color:#fff;letter-spacing:.1em}
      .blog-card:hover .blog-card-image img{transform:scale(1.055);filter:saturate(1.08)}
      .blog-card-content{padding:28px 30px 32px;min-height:260px;display:flex;flex-direction:column;align-items:flex-start}
      .blog-card-category{font-size:9px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin:0 0 18px}
      .blog-card h3{font-size:clamp(25px,2.5vw,37px);line-height:1.02;letter-spacing:-.055em;margin:0 0 14px;max-width:570px}
      .blog-card h3 a:hover{color:var(--accent)}
      .blog-card-content>p:not(.blog-card-category){font-size:13px;line-height:1.65;color:var(--muted);max-width:520px;margin:0}
      .blog-read{margin-top:auto;padding-top:24px;font-size:11px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;border-bottom:1px solid var(--ink);padding-bottom:5px}
      .blog-read span{display:inline-block;margin-left:8px;transition:transform .2s ease}
      .blog-read:hover{color:var(--accent);border-color:var(--accent)}
      .blog-read:hover span{transform:translate(3px,-3px)}
      .blog-bottom{margin:85px 0 10px;padding:60px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);display:flex;align-items:flex-end;justify-content:space-between;gap:35px}
      .blog-bottom h2{font-size:clamp(42px,5vw,70px);margin:0}
      .blog-bottom .button{flex:none}
      @media(max-width:1000px){.blog-heading{grid-template-columns:1fr;gap:20px}.blog-grid{grid-template-columns:1fr}.blog-bottom{align-items:flex-start}}
      @media(max-width:640px){.blog-hero{min-height:650px}.blog-hero-inner{padding-top:120px;padding-bottom:50px}.blog-hero h1{font-size:clamp(58px,18vw,82px)}.blog-hero-copy{font-size:16px}.blog-hero-mark{position:absolute;right:-25px;bottom:20px;font-size:260px}.blog-section{padding-top:45px}.blog-heading{margin-bottom:28px;padding-bottom:24px}.blog-heading h2{font-size:40px}.blog-card-image{aspect-ratio:4/3}.blog-card-content{padding:23px 20px 25px;min-height:235px}.blog-card h3{font-size:29px}.blog-bottom{margin-top:60px;padding:42px 0;display:grid;gap:28px}.blog-bottom h2{font-size:43px}.blog-bottom .button{width:100%}}
      @media(prefers-reduced-motion:reduce){.blog-card-image img,.blog-read span{transition:none}}
    `}</style>
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
