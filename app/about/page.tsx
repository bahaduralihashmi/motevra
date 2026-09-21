import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const aboutImages = {
  hero: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1800&q=88",
  tyres: "https://images.unsplash.com/photo-1578844251758-2f71da64c6e6?auto=format&fit=crop&w=1000&q=88",
  wheels: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1000&q=88",
  detail: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1000&q=88",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="about-page">
        <section className="about-hero">
          <Image
            src={aboutImages.hero}
            alt="Modern performance car on the road, representing MOTEVRA's automotive world"
            fill
            priority
            sizes="100vw"
            className="about-hero-image"
          />
          <div className="about-hero-overlay" />
          <div className="container about-hero-content">
            <p className="eyebrow">ABOUT MOTEVRA</p>
            <h1>Everything your drive needs. In one place.</h1>
            <p>
              MOTEVRA is being built as a modern, international-ready automotive marketplace for tyres and the wider automotive ecosystem.
            </p>
          </div>
        </section>

        <section className="section about-intro">
          <div className="container about-two-column">
            <div>
              <p className="eyebrow">THE IDEA</p>
              <h2>Built around the way people actually shop for their cars.</h2>
            </div>
            <div className="about-copy">
              <p>
                Finding the right automotive product should not feel complicated. MOTEVRA brings tyres, wheels and rims, accessories, auto parts, batteries and car-care products into one focused shopping experience.
              </p>
              <p>
                The goal is simple: clear product information, vehicle-focused fitment, a clean buying journey and dependable support from product discovery through checkout.
              </p>
              <Link className="button" href="/shop">Explore the shop</Link>
            </div>
          </div>
        </section>

        <section className="about-image-grid">
          <figure>
            <Image src={aboutImages.tyres} alt="Automotive tyre close-up representing MOTEVRA tyre products" fill sizes="(max-width: 640px) 100vw, 50vw" />
          </figure>
          <figure>
            <Image src={aboutImages.wheels} alt="Automotive alloy wheel representing MOTEVRA wheels and rims" fill sizes="(max-width: 640px) 100vw, 50vw" />
          </figure>
        </section>

        <section className="section about-values">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">WHAT WE FOCUS ON</p>
                <h2>A better automotive buying experience.</h2>
              </div>
            </div>
            <div className="about-value-grid">
              <article><span>01</span><h3>Fitment first</h3><p>Make it easier to find products that match the vehicle, size and intended use.</p></article>
              <article><span>02</span><h3>Clear by design</h3><p>Keep product details, pricing and buying steps straightforward instead of overwhelming.</p></article>
              <article><span>03</span><h3>Quality & trust</h3><p>Build around accurate information, secure checkout and responsive customer support.</p></article>
              <article><span>04</span><h3>Ready to grow</h3><p>Start with a strong foundation in Pakistan and build toward international automotive commerce.</p></article>
            </div>
          </div>
        </section>

        <section className="about-story">
          <div className="container about-story-grid">
            <div className="about-story-image">
              <Image src={aboutImages.detail} alt="Car detailing and care scene representing MOTEVRA's car-care products" fill sizes="(max-width: 1000px) 100vw, 50vw" />
            </div>
            <div className="about-story-copy">
              <p className="eyebrow">THE MOTEVRA VISION</p>
              <h2>From tyres to the wider automotive ecosystem.</h2>
              <p>
                MOTEVRA starts with the essentials drivers depend on and is designed to grow with them: from tyres and wheels to accessories, replacement parts, batteries and car care.
              </p>
              <p>
                Over time, the vision is to connect more drivers with trusted automotive products across markets, while keeping the experience modern, useful and vehicle-focused.
              </p>
              <Link className="text-link" href="/contact">Talk to MOTEVRA →</Link>
            </div>
          </div>
        </section>

        <section className="section about-closing">
          <div className="container narrow">
            <p className="eyebrow">MOTEVRA</p>
            <h2>Built for the road ahead.</h2>
            <p className="hero-copy">A premium automotive commerce experience, designed to make every next drive easier to prepare for.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
