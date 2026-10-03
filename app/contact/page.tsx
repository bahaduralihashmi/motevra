export const metadata = { title: "Contact MOTEVRA | Automotive Store Pakistan", description: "Contact MOTEVRA for tyre, wheel, auto parts, battery, accessory and car care product enquiries in Pakistan." , alternates: { canonical: "/contact" } };

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ContactForm } from "@/components/contact-form";

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="category-hero"><div className="container"><div className="category-hero-media"><img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1800&q=85" alt="Modern performance car representing automotive support" fetchPriority="high" /><div className="category-hero-scrim" /><div className="category-hero-content"><p className="eyebrow">MOTEVRA / CONTACT</p><h1>Let&apos;s talk.</h1><p className="hero-copy">Have a question about a product, fitment, partnership or your order? Send MOTEVRA a message and our team will help.</p></div><span className="category-hero-label">CONTACT</span></div></div></section>
        <section className="section contact-section">
          <div className="container contact-layout">
            <div>
              <p className="eyebrow">GET IN TOUCH</p>
              <h2>We&apos;re here to help.</h2>
              <p className="contact-copy">Use the form to contact MOTEVRA. Your message will be delivered to our support inbox.</p>
              <p className="contact-email">bahaduralihashmi@gmail.com</p>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
