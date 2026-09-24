export const metadata = { title: "Car Care Products in Pakistan | MOTEVRA", description: "Shop car care products in Pakistan for cleaning, detailing, tyre care, glass care, interior care and vehicle protection." };

import { CategoryPage } from "@/components/category-page";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function CarCarePage() {
  return <><SiteHeader /><CategoryPage eyebrow="MOTEVRA / CAR CARE" title="Keep the vehicle looking its best." description="Car care products are part of the planned marketplace expansion and will use the same catalog foundation." accent="CAR CARE" /><SiteFooter /></>;
}
