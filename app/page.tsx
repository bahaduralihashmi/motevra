import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CurrencyPrice } from "@/components/currency-price";
import { TyreFinder } from "@/components/tyre-finder";

const categories = [
  ["Tyres","/tyres","Everyday, performance, touring and all-season tyres.","https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1000&q=80"],
  ["Wheels & Rims","/wheels","Premium wheels with fitment-ready options for your vehicle.","https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1000&q=80"],
  ["Accessories","/accessories","Practical upgrades and essentials for a better drive.","https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1000&q=80"],
  ["Auto Parts","/auto-parts","Reliable replacement parts for maintenance and repair.","https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1000&q=80"],
  ["Batteries","/batteries","Dependable starting power and electrical essentials.","https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=1000&q=80"],
  ["Car Care","/car-care","Cleaning, detailing and protection for every journey.","https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1000&q=80"],
];

const products = [
  {name:"MOTEVRA Touring Pro",type:"All-season tyre",size:"205/55 R16",price:89,image:"https://images.unsplash.com/photo-1578844251758-2f71da64c6e6?auto=format&fit=crop&w=900&q=85",image2:"https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=85"},
  {name:"MOTEVRA Sport X",type:"Performance tyre",size:"225/45 R17",price:119,image:"https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=900&q=85",image2:"https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=900&q=85"},
  {name:"MOTEVRA Urban GT",type:"Touring tyre",size:"215/60 R17",price:105,image:"https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=900&q=85",image2:"https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=85"},
  {name:"MOTEVRA Trail AT",type:"All-terrain tyre",size:"265/65 R17",price:149,image:"https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=85",image2:"https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=900&q=85"},
];

const accessories = [
  {name:"MOTEVRA Drive Phone Mount",type:"Interior accessory",detail:"Dashboard & vent mount",price:29,image:"https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=900&q=85"},
  {name:"MOTEVRA LED Interior Kit",type:"Interior lighting",detail:"Ambient LED lighting",price:39,image:"https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=900&q=85"},
  {name:"MOTEVRA Premium Floor Mats",type:"Interior accessory",detail:"All-weather protection",price:59,image:"https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=85"},
  {name:"MOTEVRA Emergency Road Kit",type:"Safety & emergency",detail:"Essential roadside tools",price:49,image:"https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=900&q=85"},
];

const hotSelling = [
  {name:"MOTEVRA RoadGrip X",type:"All-season tyre",detail:"205/55 R16 · Daily driving",price:99,image:"https://images.unsplash.com/photo-1578844251758-2f71da64c6e6?auto=format&fit=crop&w=900&q=85"},
  {name:"MOTEVRA Performance GT",type:"Performance tyre",detail:"225/45 R17 · Sport driving",price:129,image:"https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=900&q=85"},
  {name:"MOTEVRA Touring Shield",type:"Touring tyre",detail:"215/60 R17 · Long journeys",price:109,image:"https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=900&q=85"},
  {name:"MOTEVRA SUV Trail",type:"All-terrain tyre",detail:"265/65 R17 · SUV & 4x4",price:159,image:"https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=85"},
];

type ProductRailItem = {name:string; type:string; size?:string; detail?:string; price:number; image:string; image2?:string};

function ProductRail({items,badge,href}: {items: ProductRailItem[]; badge:string; href:string}) {
  return <div className="product-rail-wrap"><div className="product-rail">{[...items,...items].map((p,i)=><article className="product-card" key={p.name+i}><div className="product-visual"><Image className="product-image-primary" src={p.image} alt={p.name+", "+p.type} fill sizes="(max-width: 640px) 82vw, (max-width: 1000px) 45vw, 25vw" />{p.image2 && <Image className="product-image-secondary" src={p.image2} alt="" fill sizes="(max-width: 640px) 82vw, (max-width: 1000px) 45vw, 25vw" aria-hidden="true" />}<span className="product-badge">{badge}</span></div><div className="product-info"><span className="product-brand">MOTEVRA</span><h3>{p.name}</h3><p className="product-meta">{p.type} · {p.size ?? p.detail}</p><div className="product-price">From <CurrencyPrice amount={p.price} /></div><div className="product-actions"><Link className="mini-button" href={href}>View details</Link><Link className="mini-button primary" href={href}>Shop</Link></div></div></article>)}</div></div>;
}

export default function Home() {
  return <><SiteHeader/><main>
    <section className="hero"><div className="container"><div className="hero-visual"><video className="hero-video" autoPlay muted playsInline preload="metadata" aria-hidden="true"><source src="/videos/Motevra_Homepage_Hero_15s_Clean.mp4" type="video/mp4" /></video><div className="hero-content"><p className="eyebrow">MOTEVRA · MODERN AUTOMOTIVE MARKETPLACE</p><h1>Everything your drive needs.</h1><p className="hero-copy">Shop tyres, wheels, parts and accessories in one focused automotive marketplace — built for simple discovery today and global expansion tomorrow.</p><div className="hero-actions"><Link className="button button-dark" href="/shop">Shop the range</Link><Link className="button button-light" href="/tyres">Find my tyres</Link></div></div></div></div></section>
    <section className="quick-shop-section" aria-label="Quick shop categories and hot selling products"><div className="quick-shop-track">{[...categories.map(([name,href,,image])=>({name,href,image,type:"Category"})),...hotSelling.map(p=>({name:p.name,href:"/shop",image:p.image,type:"Hot selling"}))].map((item,i)=><Link href={item.href} className="quick-shop-item" key={item.name+i}><span className="quick-shop-image"><Image src={item.image} alt="" fill sizes="44px" /></span><span><small>{item.type}</small><strong>{item.name}</strong></span><b>→</b></Link>)}</div></section>

    <section className="section"><div className="container"><div className="section-heading"><div><p className="eyebrow">Shop by category</p><h2>Start with what your vehicle needs.</h2></div><Link href="/shop">View all →</Link></div><div className="category-grid">{categories.map(([name,href,description,image,image2])=><Link href={href} className="category-card" key={href}><Image className="category-image category-image-primary" src={image} alt={name+" for cars and automotive shopping at MOTEVRA"} fill sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw" />{image2 && <Image className="category-image category-image-secondary" src={image2} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw" aria-hidden="true" />}<span className="category-overlay"/><span className="category-mark">M</span><h3>{name}</h3><p>{description}</p><span className="arrow">Explore →</span></Link>)}</div></div></section>

    <section className="section product-rail-section"><div className="container"><div className="section-heading"><div><p className="eyebrow">Featured range</p><h2>Popular tyre options, clearly presented.</h2></div><Link href="/shop">Shop all →</Link></div><ProductRail items={products} badge="FEATURED" href="/shop"/></div></section>

    <section className="section section-dark"><div className="container finder"><div><p className="eyebrow">Tyre finder</p><h2>Find the right tyre for your vehicle.</h2><p>Search by vehicle or tyre size to narrow down compatible options. As the MOTEVRA catalogue grows, fitment data will make product discovery even easier.</p></div><TyreFinder /></div></section>

    <section className="section product-rail-section"><div className="container"><div className="section-heading"><div><p className="eyebrow">Featured accessories</p><h2>Upgrade the drive, inside and out.</h2></div><Link href="/accessories">Show more →</Link></div><ProductRail items={accessories} badge="ACCESSORY" href="/accessories"/></div></section>

    <section className="video-showcase video-showcase-tight"><div className="video-showcase-frame"><video className="video-showcase-media" autoPlay muted loop playsInline preload="metadata" aria-hidden="true"><source src="/videos/second_video_for_motevra.mp4" type="video/mp4" /></video><div className="video-showcase-overlay"><p className="eyebrow">MOTEVRA · BUILT FOR THE DRIVE</p><h2>Parts, performance and everything between.</h2><Link className="button button-light" href="/shop">Explore the range</Link></div></div></section>

    <section className="section product-rail-section hot-selling-section"><div className="container"><div className="section-heading"><div><p className="eyebrow">Hot selling</p><h2>What drivers are reaching for.</h2></div><Link href="/shop">Show more →</Link></div><ProductRail items={hotSelling} badge="HOT SELLING" href="/shop"/></div></section>

    <section className="section trust-section"><div className="container"><div className="trust-grid"><div className="trust-item"><strong>Fitment-focused</strong><span>Clear vehicle and tyre information to help shoppers choose with confidence.</span></div><div className="trust-item"><strong>Global-ready</strong><span>Commerce foundations designed to support new markets as MOTEVRA grows.</span></div><div className="trust-item"><strong>Secure checkout</strong><span>A checkout experience designed for convenient local and international payments.</span></div><div className="trust-item"><strong>Driver-first</strong><span>Fast discovery, useful product details and a responsive shopping experience.</span></div></div></div></section>
  </main><SiteFooter/></>;
}
