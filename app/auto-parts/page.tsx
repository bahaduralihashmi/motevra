import { CategoryPage } from "@/components/category-page";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function AutoPartsPage() {
  return <><SiteHeader /><CategoryPage eyebrow="MOTEVRA / AUTO PARTS" title="Parts for maintenance and repair." description="A scalable parts catalog prepared for brands, SKUs, fitment and inventory-driven availability." accent="PARTS" /><SiteFooter /></>;
}
