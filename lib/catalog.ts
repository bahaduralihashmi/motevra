import { db } from "@/lib/db";
import { MOCK_PRODUCTS, type ProductCard } from "@/lib/mock-data";

type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  stock: number;
  status: string;
  price: number;
  salePrice?: number;
};

export async function getCatalogProducts(): Promise<ProductCard[]> {
  if (!process.env.DATABASE_URL) {
    return MOCK_PRODUCTS;
  }

  try {
    const products = await db.product.findMany({
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    });

    return products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand?.name ?? "MOTEVRA",
      category: product.category?.name ?? "General",
      price: Number(product.price),
      salePrice: product.salePrice ? Number(product.salePrice) : Number(product.price),
      image: product.images?.[0]?.url ?? "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80",
      stock: product.stock,
      rating: 4.8,
      badge: product.isFeatured ? "Featured" : "New",
    }));
  } catch {
    return MOCK_PRODUCTS;
  }
}

export async function getAdminProducts(): Promise<AdminProductRow[]> {
  if (!process.env.DATABASE_URL) {
    return MOCK_PRODUCTS.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      stock: product.stock,
      status: "ACTIVE",
      price: product.salePrice,
    }));
  }

  try {
    const products = await db.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        stock: true,
        status: true,
        price: true,
        salePrice: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      stock: product.stock,
      status: product.status,
      price: Number(product.price),
      salePrice: product.salePrice ? Number(product.salePrice) : Number(product.price),
    }));
  } catch {
    return MOCK_PRODUCTS.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      stock: product.stock,
      status: "ACTIVE",
      price: product.salePrice,
    }));
  }
}
