import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const categories = [
  ["Tyres", "/tyres", "Performance, touring, all-season and EV tyres.", "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1000&q=80"],
  ["Wheels & Rims", "/wheels", "Premium wheels and fitment-ready rims.", "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1000&q=80"],
  ["Accessories", "/accessories", "Smart upgrades for everyday driving.", "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1000&q=80"],
  ["Auto Parts", "/auto-parts", "Replacement parts for maintenance and repair.", "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1000&q=80"],
  ["Batteries", "/batteries", "Reliable starting and electrical power.", "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=1000&q=80"],
  ["Car Care", "/car-care", "Detailing and protection for every drive.", "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1000&q=80"],
];

const products = [
  { name:"MOTEVRA Touring Pro", type:"All-season tyre", size:"205/55 R16", price:"$89", image:"https://images.unsplash.com/photo-1578844251758-2f71da64c6e6?auto=format&fit=crop&w=900&q=85" },
  { name:"MOTEVRA Sport X", type:"Performance tyre", size:"225/45 R17", price:"$119", image:"https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=900&q=85" },
  { name:"MOTEVRA Urban GT", type:"Touring tyre", size:"215/60 R17", price:"$105", image:"https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=900&q=85" },
  { name:"MOTEVRA Trail AT", type:"All-terrain tyre", size:"265/65 R17", price:"$149", image:"https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=85" },
];

export default function Home() {
  return <><SiteHeader/><main>
    <section className="hero"><div className="container"><div className="hero-visual">
      <video className="hero-video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
        <source src="/videos/Motevra_Homepage_Hero_15s_Clean.mp4" type="video/mp4" />
      </video>
      <div className="hero-content">
        <p className="eyebrow">MOTEVRA · INTERNATIONAL AUTOMOTIVE MARKETPLACE</p><h1>Everything your drive needs.</h1>
        <p className="hero-copy">Premium tyres, wheels, parts and accessories — brought together in one modern automotive marketplace, designed for drivers everywhere.</p>
        <div className="hero-actions"><Link className="button button-dark" href="/shop">Shop tyres, wheels & auto parts</Link><Link className="button button-light" href="/tyres">Find my tyres</Link></div>
      </div>
    </div></div></section>
    <section className="section"><div className="container"><div className="section-heading"><div><p className="eyebrow">Shop by category</p><h2>Built around the way drivers shop.</h2></div><Link href="/shop">View all →</Link></div>
      <div className="category-grid">{categories.map(([name,href,description,image])=><Link href={href} className="category-card" key={href}><Image className="category-image" src={image} alt={name+" for automotive shopping"} fill sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw" /><span className="category-overlay"/><span className="category-mark">M</span><h3>{name}</h3><p>{description}</p><span className="arrow">Explore →</span></Link>)}</div>
    </div></section>
    <section className="section"><div className="container"><div className="section-heading"><div><p className="eyebrow">Trending now</p><h2>Products drivers are looking for.</h2></div><Link href="/shop">Shop all →</Link></div>
      <div className="product-grid">{products.map(p=><article className="product-card" key={p.name}><div className="product-visual"><Image src={p.image} alt={p.name+" "+p.type+" "+p.size} fill sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 25vw" /><span className="product-badge">NEW</span></div><div className="product-info"><span className="product-brand">MOTEVRA</span><h3>{p.name}</h3><p className="product-meta">{p.type} · {p.size}</p><div className="product-price">{p.price}</div><div className="product-actions"><Link className="mini-button" href="/shop">View</Link><Link className="mini-button primary" href="/shop">Shop</Link></div></div></article>)}</div>
    </div></section>
    <section className="section section-dark"><div className="container finder"><div><p className="eyebrow">Tyre finder</p><h2>Find the right tyre for your vehicle.</h2><p>Search by tyre size or vehicle and discover compatible products as MOTEVRA's fitment catalogue grows.</p></div>
      <div className="finder-panel"><div className="finder-tabs"><button className="finder-tab active">By vehicle</button><button className="finder-tab">By size</button></div><div className="finder-fields"><select defaultValue=""><option value="" disabled>Make</option><option>Toyota</option><option>Honda</option><option>BMW</option></select><select defaultValue=""><option value="" disabled>Model</option><option>Corolla</option><option>Civic</option><option>3 Series</option></select><select defaultValue=""><option value="" disabled>Year</option><option>2024</option><option>2023</option><option>2022</option></select></div><Link className="button button-accent" style={{marginTop:14,width:"100%"}} href="/tyres">Find compatible tyres</Link></div>
    </div></section>
    <section className="global-strip"><div className="container split-section"><div><p className="eyebrow">Global by design</p><h2>One automotive store. Multiple markets.</h2></div><div><p>Our commerce architecture is being built around countries, currencies, tax, warehouses, shipping and payment methods — so MOTEVRA can expand internationally without rebuilding the storefront.</p><div className="country-row"><span className="country">🇵🇰 Pakistan · PKR</span><span className="country">🇦🇪 UAE · AED</span><span className="country">🇸🇦 Saudi Arabia · SAR</span><span className="country">🇬🇧 UK · GBP</span><span className="country">🇺🇸 USA · USD</span><span className="country">🇪🇺 Europe · EUR</span></div></div></div></section>
    <section className="section"><div className="container"><div className="trust-grid"><div className="trust-item"><strong>Verified fitment</strong><span>Vehicle and tyre compatibility built into the shopping journey.</span></div><div className="trust-item"><strong>Global-ready</strong><span>Country, currency and shipping concepts designed for expansion.</span></div><div className="trust-item"><strong>Secure checkout</strong><span>Payment architecture ready for local and international methods.</span></div><div className="trust-item"><strong>Driver-first</strong><span>Fast discovery, clear product information and responsive shopping.</span></div></div></div></section>
  </main><SiteFooter/></>;
}
