import type { MetadataRoute } from "next";

const baseUrl = "https://www.motevra.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/", "/shop", "/tyres", "/wheels", "/accessories", "/auto-parts",
    "/batteries", "/car-care", "/about", "/brands", "/deals",
    "/contact", "/shipping", "/blog",
    "/blog/how-to-read-a-tyre-size",
    "/blog/when-to-replace-car-tyres",
    "/blog/tyre-pressure-guide",
    "/blog/summer-vs-all-season-tyres",
  ];

  return paths.map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
