export const metadata = { title: "Car Care Products in Pakistan | MOTEVRA", description: "Shop car care products in Pakistan for cleaning, detailing, tyre care, glass care, interior care and vehicle protection.", alternates: { canonical: "/car-care" } };

import { CategoryPage } from "@/components/category-page";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function CarCarePage() {
  return <><SiteHeader /><CategoryPage eyebrow="MOTEVRA / CAR CARE" title="Car care for a cleaner, better-protected vehicle." description="Explore cleaning, detailing, tyre care, glass care and interior protection products for everyday vehicle care." accent="CAR CARE" heroImage="https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1800&q=85" heroAlt="Car cleaning and detailing" primaryHref="/shop?category=car-care" primaryLabel="Shop car care" secondaryHref="/blog" secondaryLabel="Read care guides" highlights={["Cleaning & detailing", "Interior & exterior care", "Protection essentials"]} /><SiteFooter /></>;
}
