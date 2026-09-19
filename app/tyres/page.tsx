import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TyreFinder } from "@/components/tyre-finder";

export const metadata = { title: "Tyres | MOTEVRA", description: "Find tyres by vehicle or tyre size with MOTEVRA." };

export default function TyresPage() {
  return <><SiteHeader /><main><section className="page-hero"><div className="container narrow"><p className="eyebrow">TYRES</p><h1>Find the right tyre for your drive.</h1><p className="hero-copy">Use your vehicle details or tyre size to discover compatible options from the MOTEVRA catalogue.</p></div></section><section className="section"><div className="container narrow"><TyreFinder /></div></section></main><SiteFooter /></>;
}
