import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { resolveImageUrls } from "@/lib/supabase-storage";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = params.get("q")?.trim();
  const category = params.get("category")?.trim();
  const brand = params.get("brand")?.trim();
  const type = params.get("type")?.trim();
  const limit = Math.min(Math.max(Number(params.get("limit") || 24), 1), 60);

  const products = await getPrisma().product.findMany({
    where: {
      status: "ACTIVE",
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] } : {}),
      ...(category ? { category: { slug: category } } : {}),
      ...(brand ? { brand: { slug: brand } } : {}),
      ...(type ? { productType: type as never } : {}),
    },
    include: { brand: true, category: true, images: { orderBy: { position: "asc" }, take: 1 }, tyre: { include: { size: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const imageMap = await resolveImageUrls(products.flatMap((product) => product.images.map((image) => image.url)));
  return NextResponse.json({
    products: products.map((product) => ({
      ...product,
      images: product.images.map((image) => ({
        ...image,
        url: image.url.startsWith("supabase://") ? storageProxyUrl(image.url) : imageMap.get(image.url) || image.url,
      })),
    })),
  });
}
