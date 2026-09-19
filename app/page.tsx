import { Header } from "@/components/marketing/header";
import { Hero } from "@/components/marketing/hero";
import { TyreFinder } from "@/components/marketing/tyre-finder";
import { Categories } from "@/components/marketing/categories";
import { FeaturedProducts } from "@/components/marketing/featured-products";
import { BrandStrip } from "@/components/marketing/brand-strip";
import { Collections } from "@/components/marketing/collections";
import { StorySection } from "@/components/marketing/story";
import { Reviews } from "@/components/marketing/reviews";
import { ShippingNewsletter } from "@/components/marketing/shipping-newsletter";
import { Footer } from "@/components/marketing/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />
      <main>
        <Hero />
        <TyreFinder />
        <Categories />
        <FeaturedProducts />
        <BrandStrip />
        <Collections />
        <StorySection />
        <Reviews />
        <ShippingNewsletter />
      </main>
      <Footer />
    </div>
  );
}
