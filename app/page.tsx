import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const categories = [
  ["Tyres", "/tyres", "Performance, touring, all-season and EV tyres."],
  ["Wheels & Rims", "/wheels", "Fitment-focused wheels for modern vehicles."],
  ["Accessories", "/accessories", "Practical upgrades for everyday driving."],
  ["Auto Parts", "/auto-parts", "Replacement parts for maintenance and repair."],
  ["Batteries", "/batteries", "Dependable starting and electrical power."],
  ["Car Care", "/car-care", "Products to keep your vehicle looking its best."],
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <p className="eyebrow">MOTEVRA · AUTOMOTIVE MARKETPLACE</p>
              <h1>Everything your drive needs.</h1>
              <p className="hero-copy">
                Shop tyres, wheels, parts and accessories through one modern automotive marketplace,
                built to scale from Pakistan to international markets.
              </p>
              <div className="hero-actions">
                <Link className="button button-dark" href="/shop">Shop all products</Link>
                <Link className="button button-light" href="/tyres">Find my tyres</Link>
              </div>
            </div>
            <div className="hero-card" aria-label="MOTEVRA automotive marketplace">
              <span>M</span>
              <strong>DRIVE · EQUIP · EXPLORE</strong>
              <small>Local-first. International-ready.</small>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Shop by category</p>
                <h2>Built around the way drivers shop.</h2>
              </div>
              <Link href="/shop">View all →</Link>
            </div>
            <div className="category-grid">
              {categories.map(([name, href, description]) => (
                <Link href={href} className="category-card" key={href}>
                  <span className="category-mark">M</span>
                  <h3>{name}</h3>
                  <p>{description}</p>
                  <span className="arrow">Explore →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-dark">
          <div className="container split-section">
            <div>
              <p className="eyebrow">Tyre finder</p>
              <h2>Find the right tyre by size or vehicle.</h2>
            </div>
            <div>
              <p>Phase A establishes the user journey. Vehicle fitment and live tyre compatibility will connect to the automotive database in a later phase.</p>
              <Link className="button button-light" href="/tyres">Open tyre finder</Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container split-section">
            <div>
              <p className="eyebrow">Global by design</p>
              <h2>Ready for multi-country commerce.</h2>
            </div>
            <div>
              <p>Country, currency, tax, warehouse, shipping and payment concepts are kept separate from the storefront so international expansion can be added without rebuilding the customer experience.</p>
              <Link className="text-link" href="/shipping">Explore shipping →</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
