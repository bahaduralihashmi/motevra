import Link from "next/link";

type CategoryPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  heroImage: string;
  heroAlt: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  highlights?: string[];
};

export function CategoryPage({
  eyebrow,
  title,
  description,
  accent,
  heroImage,
  heroAlt,
  primaryHref = "/shop",
  primaryLabel = "Browse products",
  secondaryHref = "/contact",
  secondaryLabel = "Talk to MOTEVRA",
  highlights = ["Clear product discovery", "Vehicle-aware shopping", "Reliable fulfilment"],
}: CategoryPageProps) {
  return (
    <main>
      <section className="category-hero">
        <div className="container">
          <div className="category-hero-media">
            <img src={heroImage} alt={heroAlt} fetchPriority="high" />
            <div className="category-hero-scrim" />
            <div className="category-hero-content">
              <p className="eyebrow">{eyebrow}</p>
              <h1>{title}</h1>
              <p className="hero-copy">{description}</p>
              <div className="hero-actions">
                <Link className="button button-light" href={primaryHref}>{primaryLabel}</Link>
                <Link className="button button-outline-light" href={secondaryHref}>{secondaryLabel}</Link>
              </div>
            </div>
            <span className="category-hero-label">{accent}</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">SHOPPING INTENT</p>
              <h2>Built around how drivers actually shop.</h2>
            </div>
            <Link href={primaryHref}>Explore the catalogue →</Link>
          </div>
          <div className="feature-grid">
            {highlights.map((item, index) => (
              <article className="feature-card" key={item}>
                <span className="feature-number">0{index + 1}</span>
                <h3>{item}</h3>
                <p>Find relevant products faster with focused category information, clear specifications and a responsive shopping experience.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container category-content-grid">
          <div>
            <p className="eyebrow">MOTEVRA / {accent}</p>
            <h2>Useful information before you buy.</h2>
          </div>
          <div className="category-content-copy">
            <p>Compare the details that matter for your vehicle, budget and intended use. MOTEVRA is structured to make product discovery, compatibility and checkout straightforward.</p>
            <Link className="text-link" href={primaryHref}>Continue shopping →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
