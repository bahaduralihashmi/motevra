import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CurrencyPrice } from "@/components/currency-price";

const categories = [
  ["Tyres", "/tyres", "Everyday, performance, touring and all-season tyres.", "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1000&q=80"],
  ["Wheels & Rims", "/wheels", "Premium wheels with fitment-ready options for your vehicle.", "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1000&q=80"],
  ["Accessories", "/accessories", "Practical upgrades and essentials for a better drive.", "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1000&q=80"],
  ["Auto Parts", "/auto-parts", "Reliable replacement parts for maintenance and repair.", "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1000&q=80"],
  ["Batteries", "/batteries", "Dependable starting power and electrical essentials.", "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=1000&q=80"],
  ["Car Care", "/car-care", "Cleaning, detailing and protection for every journey.", "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1000&q=80"],
];

const products = [
  { name:"MOTEVRA Touring Pro", type:"All-season tyre", size:"205/55 R16", price:89, image:"https://images.unsplash.com/photo-1578844251758-2f71da64c6e6?auto=format&fit=crop&w=900&q=85" },
  { name:"MOTEVRA Sport X", type:"Performance tyre", size:"225/45 R17", price:119, image:"https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=900&q=85" },
  { name:"MOTEVRA Urban GT", type:"Touring tyre", size:"215/60 R17", price:105, image:"https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=900&q=85" },
  { name:"MOTEVRA Trail AT", type:"All-terrain tyre", size:"265/65 R17", price:149, image:"https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=85" },
];

const accessories = [
  { name:"MOTEVRA Drive Phone Mount", type:"Interior accessory", detail:"Dashboard & vent mount", price:29, image:"https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=900&q=85" },
  { name:"MOTEVRA LED Interior Kit", type:"Interior lighting", detail:"Ambient LED lighting", price:39, image:"https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=900&q=85" },
  { name:"MOTEVRA Premium Floor Mats", type:"Interior accessory", detail:"All-weather protection", price:59, image:"https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=85" },
  { name:"MOTEVRA Emergency Road Kit", type:"Safety & emergency", detail:"Essential roadside tools", price:49, image:"https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=900&q=85" },
];

export default function Home() {
  return <><SiteHeader/><main>
    <section className="hero"><div className="container"><div className="hero-visual">
      <video className="hero-video" autoPlay muted playsInline preload="metadata" aria-hidden="true">
        <source src="/videos/Motevra_Homepage_Hero_15s_Clean.mp4" type="video/mp4" />
      </video>
      <div className="hero-content">
        <p className="eyebrow">MOTEVRA · MODERN AUTOMOTIVE MARKETPLACE</p>
        <h1>Everything your drive needs.</h1>
        <p className="hero-copy">Shop tyres, wheels, parts and accessories in one focused automotive marketplace — built for simple discovery today and global expansion tomorrow.</p>
        <div className="hero-actions"><Link className="button button-dark" href="/shop">Shop the range</Link><Link className="button button-light" href="/tyres">Find my tyres</Link></div>
      </div>
    </div></div></section>

    <section className="section"><div className="container"><div className="section-heading"><div><p className="eyebrow">Shop by category</p><h2>Start with what your vehicle needs.</h2></div><Link href="/shop">View all →</Link></div>
      <div className="category-grid">{categories.map(([name,href,description,image])=><Link href={href} className="category-card" key={href}><Image className="category-image" src={image} alt={name + " for cars and automotive shopping at MOTEVRA"} fill sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw" /><span className="category-overlay"/><span className="category-mark">M</span><h3>{name}</h3><p>{description}</p><span className="arrow">Explore →</span></Link>)}</div>
    </div></section>

    <section className="section"><div className="container"><div className="section-heading"><div><p className="eyebrow">Featured range</p><h2>Popular tyre options, clearly presented.</h2></div><Link href="/shop">Shop all →</Link></div>
      <div className="product-grid">{products.map(p=><article className="product-card" key={p.name}><div className="product-visual"><Image src={p.image} alt={p.name + ", " + p.type + ", size " + p.size} fill sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 25vw" /><span className="product-badge">FEATURED</span></div><div className="product-info"><span className="product-brand">MOTEVRA</span><h3>{p.name}</h3><p className="product-meta">{p.type} · {p.size}</p><div className="product-price">From <CurrencyPrice amount={p.price} /></div><div className="product-actions"><Link className="mini-button" href="/shop">View details</Link><Link className="mini-button primary" href="/shop">Shop</Link></div></div></article>)}</div>
    </div></section>

    <section className="section section-dark"><div className="container finder"><div><p className="eyebrow">Tyre finder</p><h2>Find the right tyre for your vehicle.</h2><p>Search by vehicle or tyre size to narrow down compatible options. As the MOTEVRA catalogue grows, fitment data will make product discovery even easier.</p></div>
      <div className="finder-panel"><div className="finder-tabs"><button className="finder-tab active">By vehicle</button><button className="finder-tab">By size</button></div><div className="finder-fields"><select defaultValue="" aria-label="Vehicle make"><option value="" disabled>Make</option><option>Toyota</option><option>Honda</option><option>BMW</option></select><select defaultValue="" aria-label="Vehicle model"><option value="" disabled>Model</option><option>Corolla</option><option>Civic</option><option>3 Series</option></select><select defaultValue="" aria-label="Vehicle year"><option value="" disabled>Year</option><option>2024</option><option>2023</option><option>2022</option></select></div><Link className="button button-accent" style={{marginTop:14,width:"100%"}} href="/tyres">Find compatible tyres</Link></div>
    </div></section>

    <section className="section"><div className="container"><div className="section-heading"><div><p className="eyebrow">Featured accessories</p><h2>Upgrade the drive, inside and out.</h2></div><Link href="/accessories">Show more →</Link></div>
      <div className="product-grid">{accessories.map(p=><article className="product-card" key={p.name}><div className="product-visual"><Image src={p.image} alt={p.name + ", " + p.type} fill sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 25vw" /><span className="product-badge">ACCESSORY</span></div><div className="product-info"><span className="product-brand">MOTEVRA</span><h3>{p.name}</h3><p className="product-meta">{p.type} · {p.detail}</p><div className="product-price">From <CurrencyPrice amount={p.price} /></div><div className="product-actions"><Link className="mini-button" href="/accessories">View details</Link><Link className="mini-button primary" href="/accessories">Shop</Link></div></div></article>)}</div>
    </div></section>

    <section className="global-strip"><div className="container split-section"><div><p className="eyebrow">Global by design</p><h2>One automotive store. Built to grow across markets.</h2></div><div><p>MOTEVRA is being built with the foundations for multiple countries, currencies, payment methods, warehouses and shipping options — so the storefront can evolve as the business expands.</p><div className="country-row"><span className="country">🇵🇰 Pakistan · PKR</span><span className="country">🇦🇪 UAE · AED</span><span className="country">🇸🇦 Saudi Arabia · SAR</span><span className="country">🇬🇧 UK · GBP</span><span className="country">🇺🇸 USA · USD</span><span className="country">🇪🇺 Europe · EUR</span></div></div></div></section>

    <section className="section"><div className="container"><div className="trust-grid"><div className="trust-item"><strong>Fitment-focused</strong><span>Clear vehicle and tyre information to help shoppers choose with confidence.</span></div><div className="trust-item"><strong>Global-ready</strong><span>Commerce foundations designed to support new markets as MOTEVRA grows.</span></div><div className="trust-item"><strong>Secure checkout</strong><span>A checkout experience designed for convenient local and international payments.</span></div><div className="trust-item"><strong>Driver-first</strong><span>Fast discovery, useful product details and a responsive shopping experience.</span></div></div></div></section>
  </main><SiteFooter/></>;
}
