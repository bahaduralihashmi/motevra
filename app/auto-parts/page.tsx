export const metadata = { title: "Auto Parts in Pakistan | Car Spare Parts", description: "Find auto parts and car spare parts in Pakistan with MOTEVRA, including brakes, filters, suspension, engine and electrical components.", alternates: { canonical: "/auto-parts" } };

import { CategoryPage } from "@/components/category-page";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function AutoPartsPage() {
  return <><SiteHeader /><CategoryPage eyebrow="MOTEVRA / AUTO PARTS" title="Auto parts for maintenance, repair and replacement." description="Explore replacement components with a catalogue structure designed around part type, vehicle compatibility, brand and availability." accent="AUTO PARTS" heroImage="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1800&q=85" heroAlt="Automotive engine and replacement parts" primaryHref="/shop?category=auto-parts" primaryLabel="Shop auto parts" secondaryHref="/blog" secondaryLabel="Read parts guides" highlights={["Maintenance & replacement", "Part and vehicle fitment", "Brand-aware discovery"]} /><SiteFooter /></>;
}
