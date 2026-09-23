import type { MetadataRoute } from "next";
import { getPrisma } from "@/lib/prisma";

const baseUrl = "https://www.motevra.com";

const staticPaths = [
  "/",
  "/shop",
  "/tyres",
  "/wheels",
  "/accessories",
  "/auto-parts",
  "/batteries",
  "/car-care",
  "/about",
  "/brands",
  "/brands/autogrip",
  "/deals",
  "/contact",
  "/shipping",
  "/blog",
  "/blog/how-to-read-a-tyre-size",
  "/blog/when-to-replace-car-tyres",
  "/blog/tyre-pressure-guide",
  "/blog/summer-vs-all-season-tyres",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = staticPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));

  try {
    if (!process.env.DATABASE_URL) return staticEntries;

    const products = await getPrisma().product.findMany({
      where: { status: "ACTIVE" },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    const productEntries = products.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticEntries, ...productEntries];
  } catch {
    return staticEntries;
  }
}
