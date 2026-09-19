import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const make = p.get("make");
  const model = p.get("model");
  const year = Number(p.get("year"));
  const width = Number(p.get("width"));
  const aspectRatio = Number(p.get("aspectRatio"));
  const rimSize = Number(p.get("rimSize"));

  const prisma = getPrisma();
  let sizes: { id: string; label: string; width: number; aspectRatio: number; rimSize: number }[] = [];

  if (width && aspectRatio && rimSize) {
    sizes = await prisma.tyreSize.findMany({ where: { width, aspectRatio, rimSize } });
  } else if (make && model && year) {
    const variant = await prisma.vehicleVariant.findFirst({
      where: {
        model: { slug: model, make: { slug: make } },
        yearFrom: { lte: year },
        OR: [{ yearTo: null }, { yearTo: { gte: year } }],
      },
      include: { fitments: { include: { tyreSize: true } } },
    });
    sizes = variant?.fitments.map((f) => f.tyreSize) ?? [];
  }

  if (!sizes.length) return NextResponse.json({ sizes: [], products: [] });

  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", productType: "TYRE", tyre: { tyreSizeId: { in: sizes.map((s) => s.id) } } },
    include: { brand: true, images: { orderBy: { position: "asc" }, take: 1 }, tyre: { include: { size: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ sizes, products });
}
