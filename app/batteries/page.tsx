export const metadata = { title: "Car Batteries in Pakistan | Battery Prices", description: "Explore car batteries in Pakistan by capacity, type, brand and vehicle compatibility with MOTEVRA." };

import { CategoryPage } from "@/components/category-page";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function BatteriesPage() {
  return <><SiteHeader /><CategoryPage eyebrow="MOTEVRA / BATTERIES" title="Reliable power for modern vehicles." description="Battery shopping will later connect specifications, compatibility, stock and delivery constraints." accent="BATTERIES" /><SiteFooter /></>;
}
