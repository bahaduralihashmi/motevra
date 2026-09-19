import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/account/", "/cart/", "/checkout/"],
    },
    sitemap: "https://www.motevra.com/sitemap.xml",
  };
}
