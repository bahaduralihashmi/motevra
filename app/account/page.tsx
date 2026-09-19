import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero">
          <div className="container narrow">
            <p className="eyebrow">YOUR MOTEVRA ACCOUNT</p>
            <h1>Welcome{session.user.name ? `, ${session.user.name}` : ""}.</h1>
            <p className="hero-copy">{session.user.email}</p>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <div className="feature-grid">
              {["Orders", "Saved Vehicles", "Addresses"].map((item, index) => (
                <article className="feature-card" key={item}>
                  <span className="feature-number">0{index + 1}</span>
                  <h3>{item}</h3>
                  <p>This account area is protected by Auth.js. Commerce data will connect in later phases.</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
