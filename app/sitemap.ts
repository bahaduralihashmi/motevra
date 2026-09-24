import type { MetadataRoute } from "next";
import { getPrisma } from "@/lib/prisma";

const baseUrl = "https://www.motevra.com";

const staticPaths = [
  "/",
  "/shop",
  "/tyres",
  "/tyres/chinese-tyre-brands",
  "/wheels",
  "/accessories",
  "/auto-parts",
  "/batteries",
  "/car-care",
  "/about",
  "/brands/autogrip",
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

    const [products, tyreSizes] = await Promise.all([
      getPrisma().product.findMany({
        where: { status: "ACTIVE" },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      getPrisma().tyreSize.findMany({
        where: { tyres: { some: { product: { status: "ACTIVE" } } } },
        select: { label: true },
        orderBy: [{ rimSize: "asc" }, { width: "asc" }, { aspectRatio: "asc" }],
      }),
    ]);

    const sizeEntries = tyreSizes.map((size) => ({
      url: `${baseUrl}/shop?size=${sizeLabelToSlug(size.label)}`,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));

    const productEntries = products.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticEntries, ...sizeEntries, ...productEntries];
  } catch {
    return staticEntries;
  }
}
