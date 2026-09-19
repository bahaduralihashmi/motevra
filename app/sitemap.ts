import type { MetadataRoute } from "next";

const baseUrl = "https://www.motevra.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/", "/shop", "/tyres", "/wheels", "/accessories", "/auto-parts",
    "/batteries", "/car-care", "/about", "/brands", "/deals",
    "/contact", "/shipping", "/blog",
  ];

  return paths.map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
