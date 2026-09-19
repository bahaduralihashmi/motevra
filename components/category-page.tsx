import Link from "next/link";

type CategoryPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
};

export function CategoryPage({ eyebrow, title, description, accent }: CategoryPageProps) {
  return (
    <main>
      <section className="page-hero">
        <div className="container narrow">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="hero-copy">{description}</p>
          <div className="hero-actions">
            <Link className="button button-dark" href="/shop">Browse products</Link>
            <Link className="button button-light" href="/contact">Talk to MOTEVRA</Link>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Coming together</p>
              <h2>Designed for a real automotive marketplace.</h2>
            </div>
            <span className="category-accent">{accent}</span>
          </div>
          <div className="feature-grid">
            {["Product discovery", "Vehicle compatibility", "Reliable fulfillment"].map((item) => (
              <article className="feature-card" key={item}>
                <span className="feature-number">0{["Product discovery", "Vehicle compatibility", "Reliable fulfillment"].indexOf(item) + 1}</span>
                <h3>{item}</h3>
                <p>Phase A establishes the storefront structure. Data, compatibility, inventory and checkout services will connect in later phases.</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
