import { db } from "@/lib/db";
import { MOCK_PRODUCTS, type ProductCard } from "@/lib/mock-data";

export type CompatibilityQuery = {
  width?: number;
  aspect?: number;
  rim?: number;
  manufacturer?: string;
  model?: string;
};

export async function getCompatibleProducts(query: CompatibilityQuery): Promise<ProductCard[]> {
  if (!process.env.DATABASE_URL) {
    const hasCompatibilityQuery = Boolean(query.width || query.aspect || query.rim || query.manufacturer || query.model);
    return hasCompatibilityQuery ? [] : MOCK_PRODUCTS;
  }

  try {
    const products = await db.product.findMany({
      where: {
        status: "ACTIVE",
        tyres: query.width && query.aspect && query.rim
          ? { width: query.width, aspectRatio: query.aspect, rimSize: query.rim }
          : undefined,
        compatibilityMatches: query.manufacturer && query.model
          ? { some: { manufacturer: { equals: query.manufacturer, mode: "insensitive" }, model: { equals: query.model, mode: "insensitive" } } }
          : undefined,
      },
      include: { brand: true, category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      orderBy: { isFeatured: "desc" },
      take: 24,
    });

    return products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand?.name ?? "MOTEVRA",
      category: product.category?.name ?? "General",
      price: Number(product.price),
      salePrice: product.salePrice ? Number(product.salePrice) : Number(product.price),
      image: product.images[0]?.url ?? MOCK_PRODUCTS[0].image,
      stock: product.stock,
      rating: 4.8,
      badge: product.isFeatured ? "Featured" : "Compatible",
    }));
  } catch {
    return MOCK_PRODUCTS;
  }
}
