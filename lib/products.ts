import { db } from "@/lib/db";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import type { ProductCard } from "@/lib/mock-data";

export type ProductDetails = ProductCard & { images: string[]; description: string };

export async function getProductBySlug(slug: string): Promise<ProductDetails | null> {
  if (!process.env.DATABASE_URL) {
    const product = MOCK_PRODUCTS.find((product) => product.slug === slug);
    return product ? { ...product, images: [product.image], description: "Premium performance tyre built for comfort, traction, and long-distance confidence across modern road conditions." } : null;
  }

  try {
    const product = await db.product.findUnique({
      where: { slug },
      include: { brand: true, category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    });

    if (!product) return null;

    return {
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
      badge: product.isFeatured ? "Featured" : "New",
      images: product.images.map((image) => image.url),
      description: product.description,
    };
  } catch {
    const product = MOCK_PRODUCTS.find((product) => product.slug === slug);
    return product ? { ...product, images: [product.image], description: "Premium performance tyre built for comfort, traction, and long-distance confidence across modern road conditions." } : null;
  }
}

export async function getRelatedProducts(currentSlug: string): Promise<ProductCard[]> {
  if (!process.env.DATABASE_URL) {
    return MOCK_PRODUCTS.filter((product) => product.slug !== currentSlug).slice(0, 3);
  }

  try {
    const products = await db.product.findMany({
      where: { slug: { not: currentSlug }, status: "ACTIVE" },
      include: { brand: true, category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      take: 3,
      orderBy: { createdAt: "desc" },
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
      badge: product.isFeatured ? "Featured" : "New",
    }));
  } catch {
    return MOCK_PRODUCTS.filter((product) => product.slug !== currentSlug).slice(0, 3);
  }
}
