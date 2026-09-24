export const metadata = { title: "Car Accessories in Pakistan | MOTEVRA", description: "Shop car accessories in Pakistan including interior, exterior, lighting, organizers and practical driving upgrades." };

import { CategoryPage } from "@/components/category-page";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function AccessoriesPage() {
  return <><SiteHeader /><CategoryPage eyebrow="MOTEVRA / ACCESSORIES" title="Upgrade every part of the drive." description="Accessories are a future expansion category alongside tyres, with product discovery and filtering built into the same marketplace foundation." accent="ACCESSORIES" /><SiteFooter /></>;
}
