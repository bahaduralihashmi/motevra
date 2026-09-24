export const metadata = { title: "Wheels & Rims in Pakistan | Alloy Wheels", description: "Shop wheels and rims in Pakistan by size, style, finish and vehicle fitment with MOTEVRA." };

import { CategoryPage } from "@/components/category-page";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function WheelsPage() {
  return <><SiteHeader /><CategoryPage eyebrow="MOTEVRA / WHEELS" title="Wheels that fit the vehicle and the vision." description="A dedicated wheels and rims experience, prepared for fitment, finish, size and vehicle compatibility data." accent="WHEELS" /><SiteFooter /></>;
}
