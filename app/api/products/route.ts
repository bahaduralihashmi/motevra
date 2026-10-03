import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { storageProxyUrl } from "@/lib/supabase-storage";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = params.get("q")?.trim();
  const category = params.get("category")?.trim();
  const brand = params.get("brand")?.trim();
  const type = params.get("type")?.trim();
  const subcategory = params.get("subcategory")?.trim().toLowerCase() || null;
  const filter = params.get("filter")?.trim().toLowerCase() || null;
  const categoryTypeMap: Record<string, string> = { tyres: "TYRE", wheels: "WHEEL", accessories: "ACCESSORY", "auto-parts": "AUTO_PART", batteries: "BATTERY", "car-care": "CAR_CARE" };
  const expectedProductType = category ? categoryTypeMap[category.toLowerCase()] : null;
  const limit = Math.min(Math.max(Number(params.get("limit") || 24), 1), 60);

  const products = await getPrisma().product.findMany({
    where: {
      status: "ACTIVE",
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] } : {}),
      ...(category ? { category: subcategory ? { slug: subcategory, parent: { slug: category.toLowerCase() } } : { parent: { slug: category.toLowerCase() } }, ...(expectedProductType ? { productType: expectedProductType as never } : {}) } : {}),
      ...(filter ? { OR: [{ category: { slug: filter } }, { category: { name: { contains: filter.replace(/-/g," "), mode:"insensitive" } } }, { brand: { slug: filter } }, { brand: { name: { contains: filter.replace(/-/g," "), mode:"insensitive" } } }, { name: { contains: filter.replace(/-/g," "), mode:"insensitive" } }, { tyre: { size: { label: { contains: filter.replace(/-/g," "), mode:"insensitive" } } } }] } : {}),
      ...(brand ? { brand: { slug: brand } } : {}),
      ...(type ? { productType: type as never } : {}),
    },
    include: { brand: true, category: true, images: { orderBy: { position: "asc" }, take: 1 }, tyre: { include: { size: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  
  return NextResponse.json({
    products: products.map((product) => ({
      ...product,
      images: product.images.map((image) => ({
        ...image,
        url: image.url.startsWith("supabase://") ? storageProxyUrl(image.url) : image.url,
      })),
    })),
  });
}
