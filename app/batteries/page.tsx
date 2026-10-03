export const metadata = { title: "Car Batteries in Pakistan | Battery Prices", description: "Explore car batteries in Pakistan by capacity, type, brand and vehicle compatibility with MOTEVRA.", alternates: { canonical: "/batteries" } };

import { CategoryPage } from "@/components/category-page";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function BatteriesPage() {
  return <><SiteHeader /><CategoryPage eyebrow="MOTEVRA / BATTERIES" title="Car batteries for dependable starting power." description="Compare battery options around capacity, type, brand and vehicle requirements, with clear information before you order." accent="BATTERIES" heroImage="https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=1800&q=85" heroAlt="Automotive battery and electrical system" primaryHref="/shop?category=batteries" primaryLabel="Shop batteries" secondaryHref="/contact" secondaryLabel="Ask about fitment" highlights={["Battery type & capacity", "Vehicle compatibility", "Clear specifications"]} /><SiteFooter /></>;
}
