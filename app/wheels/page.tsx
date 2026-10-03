export const metadata = { title: "Wheels & Rims in Pakistan | Alloy Wheels", description: "Shop wheels and rims in Pakistan by size, style, finish and vehicle fitment with MOTEVRA.", alternates: { canonical: "/wheels" } };

import { CategoryPage } from "@/components/category-page";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function WheelsPage() {
  return <><SiteHeader /><CategoryPage eyebrow="MOTEVRA / WHEELS & RIMS" title="Wheels that balance fitment, style and performance." description="Explore wheels and rims by size, finish, style and vehicle compatibility with a cleaner automotive shopping experience." accent="WHEELS & RIMS" heroImage="https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1800&q=85" heroAlt="Premium automotive alloy wheel" primaryHref="/shop?category=wheels" primaryLabel="Shop wheels" secondaryHref="/contact" secondaryLabel="Check fitment" highlights={["Size & finish discovery", "Vehicle fitment", "Style-led browsing"]} /><SiteFooter /></>;
}
