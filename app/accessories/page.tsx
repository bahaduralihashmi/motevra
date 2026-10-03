export const metadata = { title: "Car Accessories in Pakistan | MOTEVRA", description: "Shop car accessories in Pakistan including interior, exterior, lighting, organizers and practical driving upgrades.", alternates: { canonical: "/accessories" } };

import { CategoryPage } from "@/components/category-page";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function AccessoriesPage() {
  return <><SiteHeader /><CategoryPage eyebrow="MOTEVRA / ACCESSORIES" title="Car accessories for a more useful, comfortable drive." description="Discover practical interior, exterior, lighting and everyday driving accessories through a focused automotive marketplace." accent="ACCESSORIES" heroImage="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1800&q=85" heroAlt="Car interior and automotive accessories" primaryHref="/shop?category=accessories" primaryLabel="Shop accessories" secondaryHref="/blog" secondaryLabel="Read buying guides" highlights={["Interior & exterior upgrades", "Practical driving essentials", "Easy product discovery"]} /><SiteFooter /></>;
}
