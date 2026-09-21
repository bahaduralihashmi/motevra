import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ContactForm } from "@/components/contact-form";

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero">
          <div className="container narrow">
            <p className="eyebrow">CONTACT</p>
            <h1>Let&apos;s talk.</h1>
            <p className="hero-copy">Have a question about MOTEVRA, a product, partnership or the marketplace? Send us a message and our team will get back to you.</p>
          </div>
        </section>
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
